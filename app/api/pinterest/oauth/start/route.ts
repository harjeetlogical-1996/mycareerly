import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { getSetting, SETTING_KEYS } from "../../../../lib/settings";

export const dynamic = "force-dynamic";

const AUTH_URL = "https://www.pinterest.com/oauth/";
// Scopes: read user/boards, read+write pins
const SCOPES = [
  "user_accounts:read",
  "boards:read",
  "boards:write",
  "pins:read",
  "pins:write",
].join(",");

function getRedirectUri(req: NextRequest): string {
  // Always use the current request's origin so whichever host the user
  // landed on (mycareerly.com, www.mycareerly.com, the *.run.app URL,
  // or localhost) is echoed back to Pinterest exactly. The redirect_uri
  // MUST byte-for-byte match one of the URIs registered in the Pinterest
  // developer console; any mismatch yields "redirect URI does not match".
  return `${req.nextUrl.origin}/api/pinterest/oauth/callback`;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.redirect(new URL("/admin/login", req.url));

  const clientId = await getSetting(SETTING_KEYS.PINTEREST_CLIENT_ID);
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/admin/pinterest/settings?error=missing_client_id", req.url)
    );
  }

  const label = req.nextUrl.searchParams.get("label") || "";

  // Generate state nonce — 10 min TTL enforced in callback
  const state = crypto.randomBytes(24).toString("hex");
  await prisma.setting.upsert({
    where: { key: SETTING_KEYS.PINTEREST_OAUTH_STATE },
    create: { key: SETTING_KEYS.PINTEREST_OAUTH_STATE, value: `${state}|${Date.now()}` },
    update: { value: `${state}|${Date.now()}` },
  });
  await prisma.setting.upsert({
    where: { key: SETTING_KEYS.PINTEREST_OAUTH_ACCOUNT_LABEL },
    create: { key: SETTING_KEYS.PINTEREST_OAUTH_ACCOUNT_LABEL, value: label },
    update: { value: label },
  });

  const redirectUri = getRedirectUri(req);
  const authUrl = new URL(AUTH_URL);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl);
}
