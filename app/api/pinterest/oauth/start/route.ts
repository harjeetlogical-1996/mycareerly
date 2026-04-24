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

/**
 * User-facing origin via X-Forwarded-* (set by Google's load balancer on
 * Cloud Run). `req.nextUrl.origin` inside the container can be the internal
 * bind address (0.0.0.0:8080) and must not be echoed back to the browser.
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
  return `${publicOrigin(req)}/api/pinterest/oauth/callback`;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.redirect(`${publicOrigin(req)}/admin/login`);

  const clientId = await getSetting(SETTING_KEYS.PINTEREST_CLIENT_ID);
  if (!clientId) {
    return NextResponse.redirect(
      `${publicOrigin(req)}/admin/pinterest/settings?error=missing_client_id`
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
