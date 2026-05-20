/**
 * Migrate dev.db (SQLite snapshot from Apr 23) → MongoDB Atlas.
 *
 * Uses the local SQLite file as a stand-in for Neon, since Neon's data
 * transfer quota is currently exhausted. Once Neon resets we'll do an
 * incremental sync of any rows added after Apr 23.
 *
 * Strategy per collection:
 *  1. Read all rows from SQLite (synchronous, in-process — no network).
 *  2. `Model.deleteMany({})` to clear target collection.
 *  3. `Model.insertMany(rows, { ordered: false })` in batches of 500.
 *
 * Boolean/Date coercion handled per-table.
 */
import "dotenv/config";
import Database from "better-sqlite3";
import {
  connectMongo,
} from "../app/lib/mongo";
import {
  Article, Author, Category, City, ScheduledArticle, Setting, AdminUser,
  Subscriber, ContactMessage, Review, PinterestAccount, PinterestPin,
  PinterestImage, PinterestBoardMap, Listing,
} from "../app/models";
import mongoose from "mongoose";

const DB_PATH = "./dev.db";

function toDate(v: any): Date | null {
  if (v === null || v === undefined || v === "") return null;
  // SQLite stores DateTime as ISO string or unix ms
  if (typeof v === "number") return new Date(v);
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function toBool(v: any): boolean {
  return v === 1 || v === true || v === "1" || v === "true";
}

async function importTable<T>(
  name: string,
  rows: any[],
  Model: any,
  transform: (r: any) => any
) {
  console.log(`\n📦 ${name}: ${rows.length} rows`);
  if (rows.length === 0) return;

  await Model.deleteMany({});
  const docs = rows.map(transform);

  // Insert in batches of 500 to stay polite with Atlas M0
  const BATCH = 500;
  for (let i = 0; i < docs.length; i += BATCH) {
    const chunk = docs.slice(i, i + BATCH);
    try {
      await Model.insertMany(chunk, { ordered: false });
      console.log(`   ✓ ${Math.min(i + BATCH, docs.length)}/${docs.length}`);
    } catch (e: any) {
      // ordered: false continues despite individual errors; report any
      const inserted = e.result?.insertedCount ?? 0;
      console.log(`   ⚠️  partial ${inserted}/${chunk.length} (${e.message?.slice(0, 100)})`);
    }
  }
}

async function main() {
  const conn = await connectMongo();
  if (!conn) {
    console.error("❌ MONGODB_URI not set");
    process.exit(1);
  }
  console.log(`✅ Connected to ${mongoose.connection.db?.databaseName}`);

  const db = new Database(DB_PATH, { readonly: true });

  // ── Article ──────────────────────────────────────────────────────────────
  await importTable("Article", db.prepare("SELECT * FROM Article").all(), Article, (r: any) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    content: r.content,
    coverImage: r.coverImage ?? "",
    category: r.category,
    tags: r.tags ?? "[]",
    authorName: r.authorName,
    authorBio: r.authorBio ?? "",
    authorEmail: r.authorEmail ?? "",
    status: r.status ?? "pending",
    featured: toBool(r.featured),
    readTime: r.readTime ?? "5 min read",
    publishedAt: r.publishedAt ?? "",
    metaTitle: r.metaTitle ?? "",
    metaDescription: r.metaDescription ?? "",
    keywords: r.keywords ?? "",
    faqs: r.faqs ?? "[]",
    createdAt: toDate(r.createdAt) ?? new Date(),
    updatedAt: toDate(r.updatedAt) ?? new Date(),
  }));

  // ── Author ───────────────────────────────────────────────────────────────
  await importTable("Author", db.prepare("SELECT * FROM Author").all(), Author, (r: any) => ({
    id: r.id, slug: r.slug, name: r.name,
    bio: r.bio ?? "", avatar: r.avatar ?? "", email: r.email ?? "",
    specialty: r.specialty ?? "", twitter: r.twitter ?? "",
    instagram: r.instagram ?? "", website: r.website ?? "",
    active: toBool(r.active),
    createdAt: toDate(r.createdAt) ?? new Date(),
    updatedAt: toDate(r.updatedAt) ?? new Date(),
  }));

  // ── Category ─────────────────────────────────────────────────────────────
  await importTable("Category", db.prepare("SELECT * FROM Category").all(), Category, (r: any) => ({
    id: r.id, name: r.name, slug: r.slug,
    description: r.description ?? "", color: r.color ?? "#E8705A",
    order: r.order ?? 0, active: toBool(r.active),
    createdAt: toDate(r.createdAt) ?? new Date(),
    updatedAt: toDate(r.updatedAt) ?? new Date(),
  }));

  // ── City ─────────────────────────────────────────────────────────────────
  await importTable("City", db.prepare("SELECT * FROM City").all(), City, (r: any) => ({
    id: r.id, slug: r.slug, name: r.name, state: r.state,
    stateFull: r.stateFull ?? "", coverImage: r.coverImage ?? "",
    heroImage: r.heroImage ?? "", description: r.description ?? "",
    shortDesc: r.shortDesc ?? "", metaTitle: r.metaTitle ?? "",
    metaDescription: r.metaDescription ?? "", keywords: r.keywords ?? "",
    featured: toBool(r.featured), active: toBool(r.active),
    order: r.order ?? 0,
    createdAt: toDate(r.createdAt) ?? new Date(),
    updatedAt: toDate(r.updatedAt) ?? new Date(),
  }));

  // ── ScheduledArticle ─────────────────────────────────────────────────────
  await importTable("ScheduledArticle", db.prepare("SELECT * FROM ScheduledArticle").all(), ScheduledArticle, (r: any) => ({
    id: r.id, title: r.title, reference: r.reference ?? "",
    category: r.category ?? "Care Guide", authorName: r.authorName ?? "MyCareerly Editorial",
    scheduledFor: toDate(r.scheduledFor) ?? new Date(),
    status: r.status ?? "pending",
    generatedArticleId: r.generatedArticleId ?? null,
    errorMessage: r.errorMessage ?? "",
    createdAt: toDate(r.createdAt) ?? new Date(),
    updatedAt: toDate(r.updatedAt) ?? new Date(),
  }));

  // ── Setting ─────────────────────────────────────────────────────────────
  await importTable("Setting", db.prepare("SELECT * FROM Setting").all(), Setting, (r: any) => ({
    key: r.key, value: r.value ?? "",
    updatedAt: toDate(r.updatedAt) ?? new Date(),
  }));

  // ── AdminUser ───────────────────────────────────────────────────────────
  try {
    await importTable("AdminUser", db.prepare("SELECT * FROM AdminUser").all(), AdminUser, (r: any) => ({
      id: r.id, email: r.email, passwordHash: r.passwordHash,
      name: r.name ?? "", role: r.role ?? "editor", active: toBool(r.active),
      lastLoginAt: toDate(r.lastLoginAt),
      createdAt: toDate(r.createdAt) ?? new Date(),
      updatedAt: toDate(r.updatedAt) ?? new Date(),
    }));
  } catch (e: any) { console.log("  (AdminUser table missing, skipping)"); }

  // ── Subscriber ──────────────────────────────────────────────────────────
  try {
    await importTable("Subscriber", db.prepare("SELECT * FROM Subscriber").all(), Subscriber, (r: any) => ({
      id: r.id, email: r.email, name: r.name ?? "",
      source: r.source ?? "newsletter", active: toBool(r.active),
      createdAt: toDate(r.createdAt) ?? new Date(),
    }));
  } catch (e: any) { console.log("  (Subscriber table missing, skipping)"); }

  // ── ContactMessage ──────────────────────────────────────────────────────
  try {
    await importTable("ContactMessage", db.prepare("SELECT * FROM ContactMessage").all(), ContactMessage, (r: any) => ({
      id: r.id, name: r.name, email: r.email,
      subject: r.subject, message: r.message,
      read: toBool(r.read),
      createdAt: toDate(r.createdAt) ?? new Date(),
    }));
  } catch (e: any) { console.log("  (ContactMessage table missing, skipping)"); }

  // ── Review ──────────────────────────────────────────────────────────────
  try {
    await importTable("Review", db.prepare("SELECT * FROM Review").all(), Review, (r: any) => ({
      id: r.id, listingId: r.listingId, authorName: r.authorName,
      authorEmail: r.authorEmail, rating: r.rating,
      title: r.title ?? "", body: r.body, helpful: r.helpful ?? 0,
      status: r.status ?? "pending", ipHash: r.ipHash ?? "",
      createdAt: toDate(r.createdAt) ?? new Date(),
      updatedAt: toDate(r.updatedAt) ?? new Date(),
    }));
  } catch (e: any) { console.log("  (Review table missing, skipping)"); }

  // ── PinterestAccount ────────────────────────────────────────────────────
  try {
    await importTable("PinterestAccount", db.prepare("SELECT * FROM PinterestAccount").all(), PinterestAccount, (r: any) => ({
      id: r.id, username: r.username, label: r.label ?? "",
      accessToken: r.accessToken, refreshToken: r.refreshToken,
      tokenExpiresAt: toDate(r.tokenExpiresAt) ?? new Date(),
      defaultBoardId: r.defaultBoardId ?? "",
      autoPostEnabled: toBool(r.autoPostEnabled),
      active: toBool(r.active),
      createdAt: toDate(r.createdAt) ?? new Date(),
      updatedAt: toDate(r.updatedAt) ?? new Date(),
    }));
  } catch (e: any) { console.log("  (PinterestAccount missing, skipping)"); }

  try {
    await importTable("PinterestPin", db.prepare("SELECT * FROM PinterestPin").all(), PinterestPin, (r: any) => ({
      id: r.id, accountId: r.accountId, articleId: r.articleId,
      imageId: r.imageId ?? null,
      title: r.title, description: r.description ?? "",
      hashtags: r.hashtags ?? "", boardId: r.boardId,
      pinId: r.pinId ?? null, status: r.status ?? "draft",
      scheduledFor: toDate(r.scheduledFor), postedAt: toDate(r.postedAt),
      attempts: r.attempts ?? 0, lastError: r.lastError ?? "",
      createdAt: toDate(r.createdAt) ?? new Date(),
      updatedAt: toDate(r.updatedAt) ?? new Date(),
    }));
  } catch (e: any) { console.log("  (PinterestPin missing, skipping)"); }

  try {
    await importTable("PinterestImage", db.prepare("SELECT * FROM PinterestImage").all(), PinterestImage, (r: any) => ({
      id: r.id, articleId: r.articleId, url: r.url,
      source: r.source ?? "upload", prompt: r.prompt ?? "",
      width: r.width ?? 0, height: r.height ?? 0,
      createdAt: toDate(r.createdAt) ?? new Date(),
    }));
  } catch (e: any) { console.log("  (PinterestImage missing, skipping)"); }

  try {
    await importTable("PinterestBoardMap", db.prepare("SELECT * FROM PinterestBoardMap").all(), PinterestBoardMap, (r: any) => ({
      id: r.id, accountId: r.accountId, category: r.category,
      boardId: r.boardId, boardName: r.boardName ?? "",
    }));
  } catch (e: any) { console.log("  (PinterestBoardMap missing, skipping)"); }

  // ── Listing ─────────────────────────────────────────────────────────────
  await importTable("Listing", db.prepare("SELECT * FROM Listing").all(), Listing, (r: any) => ({
    id: r.id, slug: r.slug, name: r.name,
    tagline: r.tagline ?? "", description: r.description,
    address: r.address, city: r.city, pincode: r.pincode,
    phone: r.phone, email: r.email, website: r.website ?? "",
    rating: r.rating ?? 0, reviewCount: r.reviewCount ?? 0,
    images: r.images ?? "[]", categories: r.categories ?? "[]",
    tags: r.tags ?? "[]", hours: r.hours ?? "[]",
    open: toBool(r.open), verified: toBool(r.verified),
    featured: toBool(r.featured),
    established: r.established ?? "", priceRange: r.priceRange ?? "mid",
    deliveryAvailable: toBool(r.deliveryAvailable),
    status: r.status ?? "pending", state: r.state ?? "",
    citySlug: r.citySlug ?? "",
    sponsored: toBool(r.sponsored), sortOrder: r.sortOrder ?? 0,
    submittedBy: r.submittedBy ?? "admin", showEmail: toBool(r.showEmail),
    googlePlaceId: r.googlePlaceId ?? "",
    createdAt: toDate(r.createdAt) ?? new Date(),
    updatedAt: toDate(r.updatedAt) ?? new Date(),
  }));

  db.close();
  await mongoose.disconnect();
  console.log("\n✅ Migration complete.");
}

main().catch((e) => {
  console.error("\n❌ Failed:", e);
  process.exit(1);
});
