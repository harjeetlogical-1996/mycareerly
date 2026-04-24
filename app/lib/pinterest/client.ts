const PROD_BASE = "https://api.pinterest.com/v5";
const SANDBOX_BASE = "https://api-sandbox.pinterest.com/v5";

/**
 * Pinterest "Trial" apps can authenticate + read boards/user info on the
 * production API, but any POST to /pins gets blocked with:
 *   403 code 29: "Apps with Trial access may not create Pins in production"
 * The workaround is to send pin creation requests to the sandbox API at
 * api-sandbox.pinterest.com, which mirrors the same schema but doesn't
 * actually publish to real Pinterest. Good for testing the full flow
 * while waiting for Standard access approval.
 *
 * Toggle with env var PINTEREST_USE_SANDBOX=true — only affects pin-write
 * endpoints; reads (boards, user_account) stay on production so the admin
 * UI still shows real data.
 */
function baseFor(path: string, method: string): string {
  const sandbox = process.env.PINTEREST_USE_SANDBOX === "true";
  if (!sandbox) return PROD_BASE;
  // Only route blocked write endpoints to sandbox.
  const m = method.toUpperCase();
  const isPinWrite = /^\/pins(\/|$|\?)/i.test(path) && (m === "POST" || m === "PATCH" || m === "DELETE");
  return isPinWrite ? SANDBOX_BASE : PROD_BASE;
}

export class PinterestApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Pinterest API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

export async function pinterestFetch(
  path: string,
  accessToken: string,
  init: RequestInit = {}
): Promise<any> {
  const method = (init.method || "GET") as string;
  const url = path.startsWith("http") ? path : `${baseFor(path, method)}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers, cache: "no-store" });
  } catch (e: any) {
    const cause = e?.cause?.code || e?.cause?.message || e?.code || e?.message || String(e);
    throw new PinterestApiError(0, null, `Network error reaching ${url}. Cause: ${cause}`);
  }
  const text = await res.text();
  const body = text ? safeJson(text) : null;
  if (!res.ok) throw new PinterestApiError(res.status, body, typeof body === "object" && body && "message" in (body as any) ? (body as any).message : undefined);
  return body;
}

function safeJson(t: string) {
  try { return JSON.parse(t); } catch { return t; }
}
