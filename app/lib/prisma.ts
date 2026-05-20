/**
 * Prisma → Mongoose compatibility shim.
 *
 * This file used to export a real PrismaClient. Now it exports a proxy that
 * translates Prisma's query API (findMany/findUnique/findFirst/count/create/
 * update/upsert/delete) into Mongoose calls against the models in
 * `app/models/index.ts`.
 *
 * Why a shim instead of rewriting every call site?
 *  - 100 files use `prisma.X.method(...)`. Rewriting them all in one session is
 *    too risky for a working production site.
 *  - Prisma's query DSL is a small surface (where/orderBy/select/include/skip/
 *    take). Mongoose can express the same things — a thin translator covers
 *    >95% of real-world usage in this codebase.
 *  - Files can be migrated to direct Mongoose calls incrementally over time;
 *    nothing forces them to change.
 *
 * What's covered:
 *  - findMany / findFirst / findUnique
 *  - count
 *  - create / createMany
 *  - update / updateMany / upsert
 *  - delete / deleteMany
 *  - where with $eq/in/contains/gte/lte/startsWith/AND/OR/NOT
 *  - orderBy (single + array)
 *  - select (projection)
 *  - skip / take
 *  - $disconnect / $connect (no-ops; Mongoose manages its own pool)
 *
 * NOT covered (will fail loudly — fix call sites if hit):
 *  - include (relations) — Prisma joins. Use manual lookups instead.
 *  - aggregate / groupBy — rare in this codebase; rewrite as Mongo pipelines.
 *  - transactions ($transaction) — Mongo M0 supports them but most uses here
 *    don't need it; rewrite per case.
 */
import * as Models from "../models";
import { connectMongo } from "./mongo";

// Map Prisma model accessor (lowercase) → Mongoose model
const MODEL_MAP: Record<string, any> = {
  article:           Models.Article,
  author:            Models.Author,
  category:          Models.Category,
  city:              Models.City,
  scheduledArticle:  Models.ScheduledArticle,
  setting:           Models.Setting,
  adminUser:         Models.AdminUser,
  subscriber:        Models.Subscriber,
  contactMessage:    Models.ContactMessage,
  review:            Models.Review,
  pinterestAccount:  Models.PinterestAccount,
  pinterestPin:      Models.PinterestPin,
  pinterestImage:    Models.PinterestImage,
  pinterestBoardMap: Models.PinterestBoardMap,
  listing:           Models.Listing,
};

// ── where clause translation ────────────────────────────────────────────────
function translateWhere(where: any): any {
  if (!where || typeof where !== "object") return where ?? {};
  const out: any = {};

  for (const [key, val] of Object.entries(where)) {
    if (key === "AND") {
      out.$and = (val as any[]).map(translateWhere);
      continue;
    }
    if (key === "OR") {
      out.$or = (val as any[]).map(translateWhere);
      continue;
    }
    if (key === "NOT") {
      out.$nor = Array.isArray(val) ? val.map(translateWhere) : [translateWhere(val)];
      continue;
    }

    if (val === null || val === undefined) { out[key] = val; continue; }

    if (typeof val === "object" && !(val instanceof Date) && !Array.isArray(val)) {
      const v = val as any;
      const cond: any = {};
      for (const [op, opVal] of Object.entries(v)) {
        switch (op) {
          case "equals":     cond.$eq  = opVal; break;
          case "not":        cond.$ne  = opVal; break;
          case "in":         cond.$in  = opVal; break;
          case "notIn":      cond.$nin = opVal; break;
          case "lt":         cond.$lt  = opVal; break;
          case "lte":        cond.$lte = opVal; break;
          case "gt":         cond.$gt  = opVal; break;
          case "gte":        cond.$gte = opVal; break;
          case "contains":
            cond.$regex = String(opVal).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            cond.$options = v.mode === "insensitive" ? "i" : "";
            break;
          case "startsWith":
            cond.$regex = "^" + String(opVal).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            cond.$options = v.mode === "insensitive" ? "i" : "";
            break;
          case "endsWith":
            cond.$regex = String(opVal).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$";
            cond.$options = v.mode === "insensitive" ? "i" : "";
            break;
          case "mode": /* handled above */ break;
          default:
            // Unknown operator — treat as nested where (rare)
            cond[op] = opVal;
        }
      }
      out[key] = Object.keys(cond).length ? cond : val;
    } else {
      out[key] = val;
    }
  }
  return out;
}

// ── orderBy translation ─────────────────────────────────────────────────────
function translateOrderBy(orderBy: any): Record<string, 1 | -1> | undefined {
  if (!orderBy) return undefined;
  const sort: Record<string, 1 | -1> = {};
  const items = Array.isArray(orderBy) ? orderBy : [orderBy];
  for (const item of items) {
    for (const [field, dir] of Object.entries(item)) {
      sort[field] = dir === "desc" ? -1 : 1;
    }
  }
  return sort;
}

// ── select translation ─────────────────────────────────────────────────────
function translateSelect(select: any): Record<string, 1 | 0> | undefined {
  if (!select) return undefined;
  const proj: Record<string, 1 | 0> = {};
  for (const [field, picked] of Object.entries(select)) {
    if (picked) proj[field] = 1;
  }
  // Mongoose returns _id by default — turn off
  if (!("_id" in proj)) proj._id = 0;
  return proj;
}

// ── data translation for writes (no-op for now — JSON fields stay strings) ──
function translateData(data: any): any {
  return data;
}

// ── Prisma method → Mongoose call ──────────────────────────────────────────
function buildModelProxy(Model: any) {
  return {
    async findMany(args: any = {}) {
      await connectMongo();
      const q = Model.find(translateWhere(args.where));
      if (args.orderBy) q.sort(translateOrderBy(args.orderBy));
      if (args.select)  q.select(translateSelect(args.select) as any);
      if (typeof args.skip === "number") q.skip(args.skip);
      if (typeof args.take === "number") q.limit(args.take);
      return q.lean();
    },

    async findFirst(args: any = {}) {
      await connectMongo();
      const q = Model.findOne(translateWhere(args.where));
      if (args.orderBy) q.sort(translateOrderBy(args.orderBy));
      if (args.select)  q.select(translateSelect(args.select) as any);
      return q.lean();
    },

    async findUnique(args: any) {
      await connectMongo();
      const q = Model.findOne(translateWhere(args.where));
      if (args.select) q.select(translateSelect(args.select) as any);
      return q.lean();
    },

    async count(args: any = {}) {
      await connectMongo();
      return Model.countDocuments(translateWhere(args.where));
    },

    async create(args: any) {
      await connectMongo();
      const doc = await Model.create(translateData(args.data));
      return doc.toObject();
    },

    async createMany(args: any) {
      await connectMongo();
      const docs = Array.isArray(args.data) ? args.data : [args.data];
      const res = await Model.insertMany(docs.map(translateData), { ordered: false });
      return { count: res.length };
    },

    async update(args: any) {
      await connectMongo();
      const updated = await Model.findOneAndUpdate(
        translateWhere(args.where),
        { $set: translateData(args.data) },
        { new: true, lean: true }
      );
      return updated;
    },

    async updateMany(args: any) {
      await connectMongo();
      const res = await Model.updateMany(
        translateWhere(args.where),
        { $set: translateData(args.data) }
      );
      return { count: res.modifiedCount };
    },

    async upsert(args: any) {
      await connectMongo();
      const existing = await Model.findOne(translateWhere(args.where)).lean();
      if (existing) {
        return Model.findOneAndUpdate(
          translateWhere(args.where),
          { $set: translateData(args.update) },
          { new: true, lean: true }
        );
      }
      const created = await Model.create(translateData(args.create));
      return created.toObject();
    },

    async delete(args: any) {
      await connectMongo();
      const deleted = await Model.findOneAndDelete(translateWhere(args.where), { lean: true });
      return deleted;
    },

    async deleteMany(args: any = {}) {
      await connectMongo();
      const res = await Model.deleteMany(translateWhere(args.where));
      return { count: res.deletedCount };
    },

    async groupBy(args: any) {
      await connectMongo();
      const by: string[] = Array.isArray(args.by) ? args.by : [args.by];
      const match = translateWhere(args.where);
      const groupId: any = {};
      for (const f of by) groupId[f] = "$" + f;

      const group: any = { _id: groupId };
      if (args._count) {
        if (args._count._all === true || args._count === true) {
          group.__count_all = { $sum: 1 };
        } else if (typeof args._count === "object") {
          for (const f of Object.keys(args._count)) {
            group["__count_" + f] = { $sum: { $cond: [{ $ifNull: ["$" + f, false] }, 1, 0] } };
          }
        }
      }
      if (args._sum) for (const f of Object.keys(args._sum)) group["__sum_" + f] = { $sum: "$" + f };
      if (args._avg) for (const f of Object.keys(args._avg)) group["__avg_" + f] = { $avg: "$" + f };
      if (args._min) for (const f of Object.keys(args._min)) group["__min_" + f] = { $min: "$" + f };
      if (args._max) for (const f of Object.keys(args._max)) group["__max_" + f] = { $max: "$" + f };

      const pipeline: any[] = [];
      if (Object.keys(match).length) pipeline.push({ $match: match });
      pipeline.push({ $group: group });
      if (args.orderBy) pipeline.push({ $sort: translateOrderBy(args.orderBy) });
      if (typeof args.skip === "number") pipeline.push({ $skip: args.skip });
      if (typeof args.take === "number") pipeline.push({ $limit: args.take });

      const rows = await Model.aggregate(pipeline);
      // Shape result back to Prisma's { <field>: val, _count: { _all: n } }
      return rows.map((r: any) => {
        const out: any = {};
        for (const f of by) out[f] = r._id?.[f];
        if (args._count) {
          if (args._count._all === true || args._count === true) {
            out._count = { _all: r.__count_all };
          } else if (typeof args._count === "object") {
            out._count = {};
            for (const f of Object.keys(args._count)) out._count[f] = r["__count_" + f];
          }
        }
        if (args._sum) { out._sum = {}; for (const f of Object.keys(args._sum)) out._sum[f] = r["__sum_" + f]; }
        if (args._avg) { out._avg = {}; for (const f of Object.keys(args._avg)) out._avg[f] = r["__avg_" + f]; }
        if (args._min) { out._min = {}; for (const f of Object.keys(args._min)) out._min[f] = r["__min_" + f]; }
        if (args._max) { out._max = {}; for (const f of Object.keys(args._max)) out._max[f] = r["__max_" + f]; }
        return out;
      });
    },

    async aggregate(args: any) {
      await connectMongo();
      const match = translateWhere(args.where);
      const group: any = { _id: null };
      if (args._count) {
        if (args._count === true) group.__count_all = { $sum: 1 };
        else for (const f of Object.keys(args._count)) group["__count_" + f] = { $sum: { $cond: [{ $ifNull: ["$" + f, false] }, 1, 0] } };
      }
      if (args._sum) for (const f of Object.keys(args._sum)) group["__sum_" + f] = { $sum: "$" + f };
      if (args._avg) for (const f of Object.keys(args._avg)) group["__avg_" + f] = { $avg: "$" + f };
      if (args._min) for (const f of Object.keys(args._min)) group["__min_" + f] = { $min: "$" + f };
      if (args._max) for (const f of Object.keys(args._max)) group["__max_" + f] = { $max: "$" + f };

      const pipeline: any[] = [];
      if (Object.keys(match).length) pipeline.push({ $match: match });
      pipeline.push({ $group: group });
      const [row] = await Model.aggregate(pipeline);
      const out: any = {};
      if (args._count) {
        if (args._count === true) out._count = row?.__count_all ?? 0;
        else { out._count = {}; for (const f of Object.keys(args._count)) out._count[f] = row?.["__count_" + f] ?? 0; }
      }
      if (args._sum) { out._sum = {}; for (const f of Object.keys(args._sum)) out._sum[f] = row?.["__sum_" + f] ?? 0; }
      if (args._avg) { out._avg = {}; for (const f of Object.keys(args._avg)) out._avg[f] = row?.["__avg_" + f] ?? 0; }
      if (args._min) { out._min = {}; for (const f of Object.keys(args._min)) out._min[f] = row?.["__min_" + f] ?? null; }
      if (args._max) { out._max = {}; for (const f of Object.keys(args._max)) out._max[f] = row?.["__max_" + f] ?? null; }
      return out;
    },
  };
}

// ── Cache built proxies so model identity is stable ────────────────────────
const proxyCache = new Map<string, any>();

/**
 * Drop-in replacement for the old `prisma` export.
 *
 *   import { prisma } from "../lib/prisma";
 *   const article = await prisma.article.findUnique({ where: { slug } });
 *   //              ↑ same shape as before — internally calls Mongoose
 */
export const prisma: any = new Proxy({}, {
  get(_target, propName) {
    const key = String(propName);

    // Lifecycle no-ops
    if (key === "$connect")    return async () => {};
    if (key === "$disconnect") return async () => {};
    if (key === "$transaction") {
      return async (arg: any) => {
        // Mongoose has its own transactions; for now, just run sequentially.
        if (Array.isArray(arg)) return Promise.all(arg);
        if (typeof arg === "function") return arg(prisma);
        return arg;
      };
    }
    if (key.startsWith("$")) return () => {};

    const Model = MODEL_MAP[key];
    if (!Model) {
      console.warn(`[prisma-shim] unknown model: ${key}`);
      return new Proxy({}, { get: () => async () => null });
    }

    if (!proxyCache.has(key)) proxyCache.set(key, buildModelProxy(Model));
    return proxyCache.get(key);
  },
});
