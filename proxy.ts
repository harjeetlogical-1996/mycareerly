import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-me"
);

const COOKIE_NAME = "mycareerly_admin_token";

/**
 * Resolve the user-facing absolute URL for a same-origin path. On Cloud Run
 * the inbound request is proxied, so req.url can contain the container's
 * internal bind address (0.0.0.0:8080) — never redirect the browser there.
 * We trust X-Forwarded-Host + X-Forwarded-Proto set by Google's load balancer.
 */
function absoluteUrl(req: NextRequest, pathAndQuery: string): string {
  const fwdHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const fwdProto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  if (fwdHost && !fwdHost.startsWith("0.0.0.0") && !fwdHost.startsWith("127.")) {
    return `${fwdProto}://${fwdHost}${pathAndQuery}`;
  }
  return new URL(pathAndQuery, req.url).toString();
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(absoluteUrl(req, "/admin/login"));
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(absoluteUrl(req, "/admin/login"));
      res.cookies.delete(COOKIE_NAME);
      return res;
    }
  }

  // Pass pathname so admin layout can skip auth check for login page
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
