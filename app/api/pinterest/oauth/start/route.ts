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
  // On Cloud Run the inbound request is proxied, so req.nextUrl.origin can
  // resolve to the internal *.run.app URL even when the user is on
  // https://www.mycareerly.com. We trust the X-Forwarded-* headers set by
  // Google's load balancer to reconstruct the user-facing origin, and only
  // fall back to req.nextUrl.origin when those aren't present (local dev).
  const fwdHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const fwdProto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  if (fwdHost) {
    return `${fwdProto}://${fwdHost}/api/pinterest/oauth/callback`;
  }
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
