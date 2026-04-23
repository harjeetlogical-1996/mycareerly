import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let warnedMissingUrl = false;

function buildClient(): PrismaClient | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    if (!warnedMissingUrl) {
      console.warn("[prisma] DATABASE_URL is not set — returning empty fallbacks. (Expected at build time; configure Secret Manager for runtime.)");
      warnedMissingUrl = true;
    }
    return null;
  }
  const adapter = new PrismaPg({ connectionString: dbUrl });
  return new PrismaClient({ adapter } as any);
}

function getClient(): PrismaClient | null {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = buildClient();
  if (client && process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

/**
 * Build-time stub: when DATABASE_URL is missing (e.g., inside `next build` in
 * a Docker image), every Prisma model method returns a safe empty value so
 * pages that do `await prisma.article.findMany()` or `prisma.listing.count()`
 * can render without crashing static generation. At runtime on Cloud Run the
 * real DATABASE_URL is injected via Secret Manager and the real client runs.
 */
function emptyFor(methodName: string): any {
  // Methods that should resolve to a number
  if (methodName === "count") return Promise.resolve(0);
  // Single-row lookups
  if (methodName === "findUnique" || methodName === "findFirst") return Promise.resolve(null);
  // Aggregations
  if (methodName === "aggregate") return Promise.resolve({});
  if (methodName === "groupBy") return Promise.resolve([]);
  // Writes — resolve to a fake blank object
  if (methodName === "create" || methodName === "update" || methodName === "upsert") {
    return Promise.resolve({});
  }
  if (methodName === "delete" || methodName === "deleteMany" || methodName === "updateMany") {
    return Promise.resolve({ count: 0 });
  }
  // Default: empty array (findMany, and anything else)
  return Promise.resolve([]);
}

function buildModelStub(): any {
  return new Proxy({}, {
    get(_target, methodName) {
      return (..._args: any[]) => emptyFor(String(methodName));
    },
  });
}

function buildClientStub(): any {
  return new Proxy({}, {
    get(_target, _modelName) {
      // $connect / $disconnect / $executeRawUnsafe etc. — no-op
      if (String(_modelName).startsWith("$")) {
        return (..._args: any[]) => Promise.resolve(0);
      }
      return buildModelStub();
    },
  });
}

/**
 * Proxy that defers real PrismaClient construction until first use.
 * When DATABASE_URL is unset (build time), every query resolves to a safe
 * empty value instead of rejecting — so static pages that read from the DB
 * render with empty data during `next build` and are re-rendered at runtime.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    if (!client) {
      const stub = buildClientStub();
      return stub[prop as any];
    }
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;
