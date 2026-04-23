import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "../../../lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { gcsEnabled, uploadBuffer } from "../../../lib/storage/gcs";

export const dynamic = "force-dynamic";

const ALLOWED_MIME = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/svg+xml", "image/gif", "image/x-icon", "image/vnd.microsoft.icon",
]);
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^/.]+$/, "") // drop extension
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function extFromMime(mime: string, fallback: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/gif": ".gif",
    "image/x-icon": ".ico",
    "image/vnd.microsoft.icon": ".ico",
  };
  return map[mime] ?? fallback;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const folder = (formData.get("folder") as string) || "uploads";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: `File type ${file.type} not allowed` }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });
  }

  // Sanitize folder — allow forward slashes for subdirs, block dangerous chars
  const safeFolder = folder
    .split("/")
    .map((seg) => seg.replace(/[^a-z0-9-_]/gi, "").slice(0, 40))
    .filter(Boolean)
    .slice(0, 4)
    .join("/") || "uploads";

  const baseName = slugifyName(file.name) || "upload";
  const hash = crypto.randomBytes(4).toString("hex");
  const ext = path.extname(file.name).toLowerCase() || extFromMime(file.type, ".bin");
  const filename = `${baseName}-${hash}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const objectPath = `${safeFolder}/${filename}`;

  // Prefer GCS in production; fall back to local disk when bucket not configured
  if (gcsEnabled()) {
    try {
      const url = await uploadBuffer(objectPath, buffer, { contentType: file.type });
      return NextResponse.json({ success: true, url, size: file.size, storage: "gcs" });
    } catch (e: any) {
      return NextResponse.json({ error: `GCS upload failed: ${e?.message || e}` }, { status: 500 });
    }
  }

  // Local disk fallback (dev)
  const outDir = path.join(process.cwd(), "public", safeFolder);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const filepath = path.join(outDir, filename);
  fs.writeFileSync(filepath, buffer);

  const url = `/${objectPath}`;
  return NextResponse.json({ success: true, url, size: file.size, storage: "disk" });
}
