const BASE = "https://api.pinterest.com/v5";

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
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
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
