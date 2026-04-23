import { Storage } from "@google-cloud/storage";

/**
 * Google Cloud Storage helpers for production file uploads.
 *
 * Configuration (env):
 *   GCS_BUCKET           — required, name of the public bucket (e.g., "mycareerly-media")
 *   GCS_PROJECT_ID       — optional, usually auto-detected on Cloud Run
 *   GCS_PUBLIC_URL       — optional, custom CDN URL (e.g., "https://cdn.mycareerly.com")
 *                          If omitted, the default storage.googleapis.com URL is used.
 *   GOOGLE_APPLICATION_CREDENTIALS — local dev only; on Cloud Run, the service account
 *                                    attached to the service is used automatically.
 */

let _storage: Storage | null = null;

function getStorage(): Storage {
  if (_storage) return _storage;
  const projectId = process.env.GCS_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  _storage = new Storage(projectId ? { projectId } : {});
  return _storage;
}

function getBucketName(): string {
  const b = process.env.GCS_BUCKET;
  if (!b) throw new Error("GCS_BUCKET env var not set");
  return b;
}

export function publicUrl(objectPath: string): string {
  const custom = process.env.GCS_PUBLIC_URL;
  if (custom) {
    return `${custom.replace(/\/$/, "")}/${objectPath.replace(/^\//, "")}`;
  }
  const bucket = getBucketName();
  return `https://storage.googleapis.com/${bucket}/${objectPath.replace(/^\//, "")}`;
}

/**
 * Uploads a buffer to GCS at `objectPath` and returns the public URL.
 * Automatically sets Content-Type and long-lived cache headers for CDN.
 */
export async function uploadBuffer(
  objectPath: string,
  data: Buffer,
  opts: { contentType: string; cacheControl?: string } = { contentType: "application/octet-stream" }
): Promise<string> {
  const storage = getStorage();
  const bucket = storage.bucket(getBucketName());
  const file = bucket.file(objectPath.replace(/^\//, ""));

  await file.save(data, {
    resumable: false,
    contentType: opts.contentType,
    metadata: {
      cacheControl: opts.cacheControl ?? "public, max-age=31536000, immutable",
    },
  });

  return publicUrl(objectPath);
}

export async function deleteObject(objectPath: string): Promise<void> {
  const storage = getStorage();
  const bucket = storage.bucket(getBucketName());
  const file = bucket.file(objectPath.replace(/^\//, ""));
  await file.delete({ ignoreNotFound: true } as any);
}

/** True when GCS_BUCKET is configured; lets callers fall back to local disk in dev. */
export function gcsEnabled(): boolean {
  return !!process.env.GCS_BUCKET;
}
