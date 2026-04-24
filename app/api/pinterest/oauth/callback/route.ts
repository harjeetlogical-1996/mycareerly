import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { getSetting, SETTING_KEYS } from "../../../../lib/settings";
import { exchangeCodeForTokens } from "../../../../lib/pinterest/tokens";
import { pinterestFetch } from "../../../../lib/pinterest/client";

export const dynamic = "force-dynamic";

const STATE_TTL_MS = 10 * 60 * 1000;

/**
 * Build an absolute URL based on the user-facing host (read from the
 * X-Forwarded-* headers that Google's load balancer sets), not the
 * internal Cloud Run container address (which is 0.0.0.0:8080).
 */
function publicOrigin(req: NextRequest): string {
  const fwdHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const fwdProto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  if (fwdHost && !fwdHost.startsWith("0.0.0.0") && !fwdHost.startsWith("127.")) {
    return `${fwdProto}://${fwdHost}`;
  }
  return req.nextUrl.origin;
}

function getRedirectUri(req: NextRequest): string {
  // Must match byte-for-byte the redirect_uri sent in the /start route.
  return `${publicOrigin(req)}/api/pinterest/oauth/callback`;
}

function backTo(req: NextRequest, qs: string): NextResponse {
  return NextResponse.redirect(`${publicOrigin(req)}/admin/pinterest/accounts?${qs}`);
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.redirect(`${publicOrigin(req)}/admin/login`);

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const err = req.nextUrl.searchParams.get("error");

  if (err) return backTo(req, `error=${encodeURIComponent(err)}`);
  if (!code || !state) return backTo(req, "error=missing_code_or_state");

  // Verify state nonce
  const storedRaw = await getSetting(SETTING_KEYS.PINTEREST_OAUTH_STATE);
  if (!storedRaw) return backTo(req, "error=state_expired");
  const [storedNonce, storedAtStr] = storedRaw.split("|");
  const storedAt = parseInt(storedAtStr || "0", 10);
  if (storedNonce !== state) return backTo(req, "error=state_mismatch");
  if (Date.now() - storedAt > STATE_TTL_MS) return backTo(req, "error=state_expired");

  // Consume state nonce
  await prisma.setting.update({
    where: { key: SETTING_KEYS.PINTEREST_OAUTH_STATE },
    data: { value: "" },
  });

  const label = (await getSetting(SETTING_KEYS.PINTEREST_OAUTH_ACCOUNT_LABEL)) || "";

  try {
    const tok = await exchangeCodeForTokens(code, getRedirectUri(req));
    const expiresAt = new Date(Date.now() + tok.expires_in * 1000);

    // Fetch user info to know the account username
    const userInfo: any = await pinterestFetch("/user_account", tok.access_token);
    const username: string = userInfo?.username || `user_${Date.now()}`;

    // Upsert on username (so re-connecting updates tokens)
    const existing = await prisma.pinterestAccount.findUnique({ where: { username } });
    if (existing) {
      await prisma.pinterestAccount.update({
        where: { id: existing.id },
        data: {
          label: label || existing.label,
          accessToken: tok.access_token,
          refreshToken: tok.refresh_token ?? existing.refreshToken,
          tokenExpiresAt: expiresAt,
          active: true,
        },
      });
    } else {
      await prisma.pinterestAccount.create({
        data: {
          username,
          label: label || username,
          accessToken: tok.access_token,
          refreshToken: tok.refresh_token ?? "",
          tokenExpiresAt: expiresAt,
          active: true,
        },
      });
    }

    return backTo(req, `connected=${encodeURIComponent(username)}`);
  } catch (e: any) {
    return backTo(req, `error=${encodeURIComponent(e?.message || "oauth_failed")}`);
  }
}
