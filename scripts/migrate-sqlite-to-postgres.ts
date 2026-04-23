/**
 * One-off migration: copy every row from the legacy SQLite dev.db to the Neon Postgres DB
 * pointed to by DATABASE_URL.
 *
 * Usage:
 *   1. Make sure DATABASE_URL points to Postgres in .env
 *   2. Run `npx prisma db push` first so the Postgres schema exists
 *   3. Run `npx tsx scripts/migrate-sqlite-to-postgres.ts`
 *
 * The SQLite file is read with better-sqlite3 directly (bypassing Prisma) so we don't
 * need a separate SQLite-bound Prisma client. Rows are inserted via raw SQL into the
 * already-migrated Postgres schema, preserving ids and timestamps.
 */

import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
// @ts-expect-error — better-sqlite3 ships without types; only used by this migration script
import Database from "better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Tables to migrate, in dependency order (parents before children for FK).
// Schema additions can be appended here.
const TABLES: Array<{ name: string; columns: string[]; dateCols?: string[]; boolCols?: string[]; intCols?: string[] }> = [
  { name: "Article", columns: ["id","slug","title","excerpt","content","coverImage","category","tags","authorName","authorBio","authorEmail","status","featured","readTime","publishedAt","metaTitle","metaDescription","keywords","faqs","createdAt","updatedAt"], dateCols: ["createdAt","updatedAt"], boolCols: ["featured"] },
  { name: "Author", columns: ["id","slug","name","bio","avatar","email","specialty","twitter","instagram","website","active","createdAt","updatedAt"], dateCols: ["createdAt","updatedAt"], boolCols: ["active"] },
  { name: "Category", columns: ["id","name","slug","description","color","order","active","createdAt","updatedAt"], dateCols: ["createdAt","updatedAt"], boolCols: ["active"], intCols: ["order"] },
  { name: "City", columns: ["id","slug","name","state","stateFull","coverImage","heroImage","description","shortDesc","metaTitle","metaDescription","keywords","featured","active","order","createdAt","updatedAt"], dateCols: ["createdAt","updatedAt"], boolCols: ["featured","active"], intCols: ["order"] },
  { name: "ScheduledArticle", columns: ["id","title","reference","category","authorName","scheduledFor","status","generatedArticleId","errorMessage","createdAt","updatedAt"], dateCols: ["scheduledFor","createdAt","updatedAt"] },
  { name: "Setting", columns: ["key","value","updatedAt"], dateCols: ["updatedAt"] },
  { name: "Subscriber", columns: ["id","email","name","source","active","createdAt"], dateCols: ["createdAt"], boolCols: ["active"] },
  { name: "ContactMessage", columns: ["id","name","email","subject","message","read","createdAt"], dateCols: ["createdAt"], boolCols: ["read"] },
  { name: "Review", columns: ["id","listingId","authorName","authorEmail","rating","title","body","helpful","status","ipHash","createdAt","updatedAt"], dateCols: ["createdAt","updatedAt"], intCols: ["rating","helpful"] },
  { name: "Listing", columns: ["id","slug","name","tagline","description","address","city","pincode","phone","email","website","rating","reviewCount","images","categories","tags","hours","open","verified","featured","established","priceRange","deliveryAvailable","status","state","citySlug","sponsored","sortOrder","submittedBy","showEmail","googlePlaceId","createdAt","updatedAt"], dateCols: ["createdAt","updatedAt"], boolCols: ["open","verified","featured","deliveryAvailable","sponsored","showEmail"], intCols: ["reviewCount","sortOrder"] },
  // Pinterest tables are new — usually empty in SQLite, but include them for idempotency
  { name: "PinterestAccount", columns: ["id","username","label","accessToken","refreshToken","tokenExpiresAt","defaultBoardId","autoPostEnabled","active","createdAt","updatedAt"], dateCols: ["tokenExpiresAt","createdAt","updatedAt"], boolCols: ["autoPostEnabled","active"] },
  { name: "PinterestImage", columns: ["id","articleId","url","source","prompt","width","height","createdAt"], dateCols: ["createdAt"], intCols: ["width","height"] },
  { name: "PinterestPin", columns: ["id","accountId","articleId","imageId","title","description","hashtags","boardId","pinId","status","scheduledFor","postedAt","attempts","lastError","createdAt","updatedAt"], dateCols: ["scheduledFor","postedAt","createdAt","updatedAt"], intCols: ["attempts"] },
  { name: "PinterestBoardMap", columns: ["id","accountId","category","boardId","boardName"] },
];

function toIso(v: any): Date | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (v instanceof Date) return v;
  return null;
}

function coerce(row: any, table: typeof TABLES[number]): any {
  const out: any = {};
  for (const col of table.columns) {
    let v = row[col];
    if (table.dateCols?.includes(col)) {
      v = toIso(v);
    } else if (table.boolCols?.includes(col)) {
      v = v === 1 || v === true || v === "1" || v === "true";
    } else if (table.intCols?.includes(col)) {
      v = v === null || v === undefined ? null : Number(v);
      if (typeof v === "number" && Number.isNaN(v)) v = null;
    } else if (v === null || v === undefined) {
      v = null;
    }
    out[col] = v;
  }
  return out;
}

async function main() {
  const sqlitePath = path.resolve(process.cwd(), "dev.db");
  if (!fs.existsSync(sqlitePath)) {
    console.error(`SQLite file not found at ${sqlitePath}`);
    process.exit(1);
  }

  const pgUrl = process.env.DATABASE_URL;
  if (!pgUrl || !pgUrl.startsWith("postgres")) {
    console.error("DATABASE_URL must point to Postgres for this migration.");
    process.exit(1);
  }

  console.log(`📦 Reading SQLite: ${sqlitePath}`);
  console.log(`🎯 Writing Postgres: ${pgUrl.replace(/:[^:@/]+@/, ":***@")}`);

  const sqlite = new Database(sqlitePath, { readonly: true });

  const pg = new PrismaClient({
    adapter: new PrismaPg({ connectionString: pgUrl }),
  } as any);

  let grandTotal = 0;
  const skipped: string[] = [];

  for (const table of TABLES) {
    let rows: any[] = [];
    try {
      rows = sqlite.prepare(`SELECT * FROM "${table.name}"`).all() as any[];
    } catch (e: any) {
      console.log(`  ⏭  ${table.name}: table missing in SQLite (${e.message}) — skipping`);
      skipped.push(table.name);
      continue;
    }

    if (rows.length === 0) {
      console.log(`  ⏭  ${table.name}: 0 rows`);
      continue;
    }

    console.log(`  ➜  ${table.name}: ${rows.length} rows`);

    // Clear existing Postgres data for clean re-import (safe because we wrote .env to point at a fresh Neon DB)
    await (pg as any).$executeRawUnsafe(`TRUNCATE TABLE "${table.name}" CASCADE`);

    const placeholders = table.columns.map((_, i) => `$${i + 1}`).join(", ");
    const colsQuoted = table.columns.map((c) => `"${c}"`).join(", ");
    const sql = `INSERT INTO "${table.name}" (${colsQuoted}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

    let inserted = 0;
    for (const raw of rows) {
      const row = coerce(raw, table);
      const values = table.columns.map((c) => row[c] ?? null);
      try {
        await (pg as any).$executeRawUnsafe(sql, ...values);
        inserted++;
      } catch (e: any) {
        console.error(`    ⚠  ${table.name} id=${raw.id ?? raw.key ?? "?"} failed: ${e.message?.slice(0, 200)}`);
      }
    }
    console.log(`     ✓ inserted ${inserted}/${rows.length}`);
    grandTotal += inserted;
  }

  sqlite.close();
  await pg.$disconnect();

  console.log(`\n✅ Migration complete. Total rows inserted: ${grandTotal}`);
  if (skipped.length) console.log(`   Skipped (missing in source): ${skipped.join(", ")}`);
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});
