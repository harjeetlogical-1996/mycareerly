import { prisma } from "../prisma";
import { getSetting, SETTING_KEYS } from "../settings";

const TOKEN_ENDPOINT = "https://api.pinterest.com/v5/oauth/token";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  refresh_token_expires_in?: number;
  scope?: string;
  token_type?: string;
};

function basicAuth(clientId: string, clientSecret: string) {
  return "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

async function getAppCredentials() {
  const clientId = await getSetting(SETTING_KEYS.PINTEREST_CLIENT_ID);
  const clientSecret = await getSetting(SETTING_KEYS.PINTEREST_CLIENT_SECRET);
  if (!clientId || !clientSecret) {
    throw new Error("Pinterest app credentials not configured. Set them in /admin/pinterest/settings.");
  }
  return { clientId, clientSecret };
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenResponse> {
  const { clientId, clientSecret } = await getAppCredentials();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  let res: Response;
  try {
    res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: basicAuth(clientId, clientSecret),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
  } catch (e: any) {
    const cause = e?.cause?.code || e?.cause?.message || e?.code || e?.message || String(e);
    throw new Error(`Network error reaching Pinterest token endpoint (${TOKEN_ENDPOINT}). Cause: ${cause}. Redirect URI sent: ${redirectUri}`);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  const { clientId, clientSecret } = await getAppCredentials();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: basicAuth(clientId, clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * Returns a valid access token for this account. Refreshes if within 5 min of expiry.
 * Rotates refresh_token if Pinterest returns a new one.
 */
export async function getValidAccessToken(accountId: string): Promise<string> {
  const acct = await prisma.pinterestAccount.findUnique({ where: { id: accountId } });
  if (!acct) throw new Error(`Pinterest account ${accountId} not found`);

  const now = Date.now();
  const expiresAt = acct.tokenExpiresAt.getTime();
  const fiveMin = 5 * 60 * 1000;

  if (expiresAt - now > fiveMin) return acct.accessToken;

  // Refresh needed
  const tok = await refreshTokens(acct.refreshToken);
  const newExpires = new Date(now + tok.expires_in * 1000);
  await prisma.pinterestAccount.update({
    where: { id: accountId },
    data: {
      accessToken: tok.access_token,
      refreshToken: tok.refresh_token ?? acct.refreshToken,
      tokenExpiresAt: newExpires,
    },
  });
  return tok.access_token;
}
