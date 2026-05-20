/**
 * MongoDB connection — replaces app/lib/prisma.ts.
 *
 * Same lazy/safe-fallback contract: when MONGODB_URI is missing (e.g. during
 * `next build` in Docker), every query resolves to an empty value instead of
 * throwing — so static pages still render at build time, then re-fetch real
 * data at runtime once the secret is injected on Cloud Run.
 */
import mongoose from "mongoose";

const globalForMongo = globalThis as unknown as {
  _mongoConn?: Promise<typeof mongoose> | null;
};

let warned = false;

/**
 * Returns a connected mongoose instance, or `null` if MONGODB_URI isn't set.
 * Connection is cached on the global so hot-reload doesn't reconnect on every
 * request in dev.
 */
export async function connectMongo(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    if (!warned) {
      console.warn("[mongo] MONGODB_URI is not set — DB calls return empty fallbacks. (Expected at build time.)");
      warned = true;
    }
    return null;
  }

  if (mongoose.connection.readyState === 1) return mongoose;

  if (!globalForMongo._mongoConn) {
    globalForMongo._mongoConn = mongoose.connect(uri, {
      // Modest pool — Atlas M0 caps at 500 connections
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 30000,
    });
  }
  try {
    return await globalForMongo._mongoConn;
  } catch (e) {
    globalForMongo._mongoConn = null;
    if (!warned) {
      console.error("[mongo] connection failed:", (e as Error).message);
      warned = true;
    }
    return null;
  }
}

/**
 * Helper to wrap a query function so build-time / connection failure returns
 * a safe fallback instead of throwing.
 *
 *   const articles = await safe(() => Article.find(...).lean(), []);
 */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const conn = await connectMongo();
    if (!conn) return fallback;
    return await fn();
  } catch (e) {
    console.error("[mongo] query failed:", (e as Error).message);
    return fallback;
  }
}
