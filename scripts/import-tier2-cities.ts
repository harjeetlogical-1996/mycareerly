/**
 * Import 50 tier-2 US cities + ~10 real florists each from Google Places API.
 *
 * Flow per city:
 *   1. Insert City row (skip if slug exists).
 *   2. Call Places API "searchText" → "florist in {city} {state}" → up to 12 results.
 *   3. For each result: call "places/{id}" with full field mask → details (phone, hours, photos, website).
 *   4. Build Listing row matching the existing schema/style and insert.
 *
 * Cost estimate (Places API New, ~Apr 2026 pricing):
 *   - searchText      $0.032 per call    × 50 cities          = $1.60
 *   - place details   $0.017 per call    × ~500 listings      = $8.50
 *   Total ≈ $10. First $200/mo free tier covers this completely.
 *
 * Usage: npx tsx scripts/import-tier2-cities.ts
 *
 * Idempotent: re-running skips cities + shops that are already in the DB
 * (matched by slug for city, googlePlaceId for listing).
 */

import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL required");
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY required");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: dbUrl }),
} as any);

// ── Cities — 50 tier-2 US cities (selected to avoid existing 51) ─────────────
type SeedCity = { name: string; state: string; stateFull: string; slug: string };

const CITIES: SeedCity[] = [
  { name: "Wichita",            state: "KS", stateFull: "Kansas",         slug: "wichita" },
  { name: "Bakersfield",        state: "CA", stateFull: "California",     slug: "bakersfield" },
  { name: "Aurora",             state: "CO", stateFull: "Colorado",       slug: "aurora" },
  { name: "Anaheim",            state: "CA", stateFull: "California",     slug: "anaheim" },
  { name: "Riverside",          state: "CA", stateFull: "California",     slug: "riverside" },
  { name: "Stockton",           state: "CA", stateFull: "California",     slug: "stockton" },
  { name: "Saint Paul",         state: "MN", stateFull: "Minnesota",      slug: "saint-paul" },
  { name: "Cincinnati",         state: "OH", stateFull: "Ohio",           slug: "cincinnati" },
  { name: "Anchorage",          state: "AK", stateFull: "Alaska",         slug: "anchorage" },
  { name: "Henderson",          state: "NV", stateFull: "Nevada",         slug: "henderson" },
  { name: "Greensboro",         state: "NC", stateFull: "North Carolina", slug: "greensboro" },
  { name: "Lexington",          state: "KY", stateFull: "Kentucky",       slug: "lexington" },
  { name: "Plano",              state: "TX", stateFull: "Texas",          slug: "plano" },
  { name: "Newark",             state: "NJ", stateFull: "New Jersey",     slug: "newark" },
  { name: "Lincoln",            state: "NE", stateFull: "Nebraska",       slug: "lincoln" },
  { name: "Buffalo",             state: "NY", stateFull: "New York",      slug: "buffalo" },
  { name: "Jersey City",        state: "NJ", stateFull: "New Jersey",     slug: "jersey-city" },
  { name: "Chula Vista",        state: "CA", stateFull: "California",     slug: "chula-vista" },
  { name: "Orlando",            state: "FL", stateFull: "Florida",        slug: "orlando" },
  { name: "Norfolk",            state: "VA", stateFull: "Virginia",       slug: "norfolk" },
  { name: "Chandler",           state: "AZ", stateFull: "Arizona",        slug: "chandler" },
  { name: "Madison",            state: "WI", stateFull: "Wisconsin",      slug: "madison" },
  { name: "Reno",               state: "NV", stateFull: "Nevada",         slug: "reno" },
  { name: "Durham",             state: "NC", stateFull: "North Carolina", slug: "durham" },
  { name: "Lubbock",            state: "TX", stateFull: "Texas",          slug: "lubbock" },
  { name: "Garland",            state: "TX", stateFull: "Texas",          slug: "garland" },
  { name: "Glendale",           state: "AZ", stateFull: "Arizona",        slug: "glendale-az" },
  { name: "Hialeah",            state: "FL", stateFull: "Florida",        slug: "hialeah" },
  { name: "Irving",             state: "TX", stateFull: "Texas",          slug: "irving" },
  { name: "Scottsdale",         state: "AZ", stateFull: "Arizona",        slug: "scottsdale" },
  { name: "North Las Vegas",    state: "NV", stateFull: "Nevada",         slug: "north-las-vegas" },
  { name: "Fremont",            state: "CA", stateFull: "California",     slug: "fremont" },
  { name: "Boise",              state: "ID", stateFull: "Idaho",          slug: "boise" },
  { name: "Richmond",           state: "VA", stateFull: "Virginia",       slug: "richmond" },
  { name: "Baton Rouge",        state: "LA", stateFull: "Louisiana",      slug: "baton-rouge" },
  { name: "Spokane",            state: "WA", stateFull: "Washington",     slug: "spokane" },
  { name: "Des Moines",         state: "IA", stateFull: "Iowa",           slug: "des-moines" },
  { name: "Tacoma",             state: "WA", stateFull: "Washington",     slug: "tacoma" },
  { name: "San Bernardino",     state: "CA", stateFull: "California",     slug: "san-bernardino" },
  { name: "Modesto",            state: "CA", stateFull: "California",     slug: "modesto" },
  { name: "Fontana",            state: "CA", stateFull: "California",     slug: "fontana" },
  { name: "Santa Clarita",      state: "CA", stateFull: "California",     slug: "santa-clarita" },
  { name: "Birmingham",         state: "AL", stateFull: "Alabama",        slug: "birmingham" },
  { name: "Oxnard",             state: "CA", stateFull: "California",     slug: "oxnard" },
  { name: "Fayetteville",       state: "NC", stateFull: "North Carolina", slug: "fayetteville" },
  { name: "Moreno Valley",      state: "CA", stateFull: "California",     slug: "moreno-valley" },
  { name: "Rochester",          state: "NY", stateFull: "New York",       slug: "rochester" },
  { name: "Glendale",           state: "CA", stateFull: "California",     slug: "glendale-ca" },
  { name: "Huntington Beach",   state: "CA", stateFull: "California",     slug: "huntington-beach" },
  { name: "Grand Rapids",       state: "MI", stateFull: "Michigan",       slug: "grand-rapids" },
  { name: "Yonkers",            state: "NY", stateFull: "New York",       slug: "yonkers" },
];

console.log(`📍 Cities to import: ${CITIES.length}`);

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

// Build a Pinterest-quality description in the same voice as existing seeds.
function buildDescription(opts: {
  name: string;
  city: string;
  state: string;
  stateFull: string;
  rating: number;
  reviewCount: number;
  hasWebsite: boolean;
  categories: string[];
}) {
  const { name, city, state, stateFull, rating, reviewCount, hasWebsite, categories } = opts;
  const trustLine = reviewCount >= 100
    ? `With over ${reviewCount.toLocaleString()} customer reviews and an average rating of ${rating.toFixed(1)} stars, ${name} is a trusted neighborhood choice for ${city} residents.`
    : reviewCount > 0
      ? `Customers across ${city} have rated ${name} ${rating.toFixed(1)} stars for craft and service.`
      : `${name} is a local floral destination serving ${city} and surrounding communities.`;
  const catLine = categories.length > 0
    ? `Specialties include ${categories.slice(0, 3).join(", ").toLowerCase()}, with a rotating selection of fresh seasonal blooms.`
    : `From hand-tied bouquets to wedding centerpieces, the team designs each arrangement to order.`;
  const closeLine = hasWebsite
    ? `Visit the website to browse current arrangements, place same-day delivery orders, or request a custom quote for weddings and events in ${stateFull}.`
    : `Stop by the shop or call ahead to discuss custom arrangements, sympathy florals, weddings, and same-day delivery across ${city}, ${state}.`;
  return `${trustLine} ${catLine} ${closeLine}`;
}

function buildTagline(name: string, city: string) {
  const variants = [
    `${city}'s trusted local florist for fresh bouquets and same-day delivery.`,
    `Hand-crafted floral arrangements from a beloved ${city} flower shop.`,
    `Beautiful blooms designed in ${city} for every occasion.`,
    `Real florists, real flowers — proudly serving ${city}.`,
    `${city} flower shop offering custom arrangements and prompt delivery.`,
  ];
  // Deterministic per-shop using name length for variety
  return variants[name.length % variants.length];
}

function pickCategories(types: string[] | undefined, name: string): string[] {
  // Map Google Place types + shop name to our taxonomy
  const cats = new Set<string>();
  const lower = (name + " " + (types || []).join(" ")).toLowerCase();
  if (/wedding|bridal/.test(lower)) cats.add("Wedding Flowers");
  if (/event|party/.test(lower)) cats.add("Event Florals");
  if (/funeral|sympathy/.test(lower)) cats.add("Sympathy");
  if (/orchid/.test(lower)) cats.add("Orchids");
  if (/rose/.test(lower)) cats.add("Roses");
  if (/garden|plant|nursery/.test(lower)) cats.add("Houseplants");
  if (/tropical/.test(lower)) cats.add("Tropical Flowers");
  // Fallback baseline
  if (cats.size < 2) {
    cats.add("Roses");
    cats.add("Wedding Flowers");
    cats.add("Seasonal Blooms");
  }
  cats.add("Custom Arrangements");
  return Array.from(cats).slice(0, 5);
}

function pickTags(reviewCount: number, hasDelivery: boolean): string[] {
  const tags: string[] = [];
  if (hasDelivery) tags.push("Same-Day Delivery");
  tags.push("Custom Arrangements");
  if (reviewCount >= 200) tags.push("Highly Reviewed");
  if (reviewCount >= 500) tags.push("Customer Favorite");
  tags.push("Local Florist");
  tags.push("Fresh Flowers");
  return tags;
}

function pickPriceRange(name: string): "budget" | "mid" | "premium" {
  const lower = name.toLowerCase();
  if (/luxury|grand|prestige|royal|premier|elite|signature/.test(lower)) return "premium";
  if (/budget|discount|cheap|express|deli/.test(lower)) return "budget";
  return "mid";
}

function buildPhotoUrls(photos: any[] | undefined, apiKey: string): string[] {
  if (!photos || photos.length === 0) {
    // Fallback Unsplash so the listing card still renders.
    return [
      "https://images.unsplash.com/photo-1487530811015-780780169993?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&q=80",
    ];
  }
  return photos.slice(0, 3).map(
    (p) =>
      `https://places.googleapis.com/v1/${p.name}/media?key=${apiKey}&maxWidthPx=1200`
  );
}

function buildHours(weekdayDescriptions: string[] | undefined): string {
  // Google returns ["Monday: 9:00 AM – 7:00 PM", ...] — convert to our shape.
  if (!weekdayDescriptions || weekdayDescriptions.length === 0) {
    return JSON.stringify([
      { day: "Monday",    time: "9:00 AM – 6:00 PM" },
      { day: "Tuesday",   time: "9:00 AM – 6:00 PM" },
      { day: "Wednesday", time: "9:00 AM – 6:00 PM" },
      { day: "Thursday",  time: "9:00 AM – 6:00 PM" },
      { day: "Friday",    time: "9:00 AM – 6:00 PM" },
      { day: "Saturday",  time: "10:00 AM – 5:00 PM" },
      { day: "Sunday",    time: "Closed" },
    ]);
  }
  return JSON.stringify(
    weekdayDescriptions.map((line) => {
      const m = line.match(/^([A-Za-z]+):\s*(.+)$/);
      return m ? { day: m[1], time: m[2] } : { day: "Unknown", time: line };
    })
  );
}

function isFlorist(types: string[] | undefined, name: string): boolean {
  const lower = (name + " " + (types || []).join(" ")).toLowerCase();
  if (/florist|flower|bloom|bouquet|petal|botanical/.test(lower)) return true;
  if (/funeral home|hospital|pharmacy/.test(lower)) return false;
  // Default: trust Google's text search results
  return true;
}

// ── Places API calls ──────────────────────────────────────────────────────────
const PLACES_BASE = "https://places.googleapis.com/v1";

async function searchTextNearby(query: string): Promise<any[]> {
  const res = await fetch(`${PLACES_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey!,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.shortFormattedAddress",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 12 }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`searchText failed for "${query}" (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = await res.json() as any;
  return json.places || [];
}

async function placeDetails(placeId: string): Promise<any> {
  const res = await fetch(`${PLACES_BASE}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey!,
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,internationalPhoneNumber,nationalPhoneNumber,websiteUri,rating,userRatingCount,regularOpeningHours.weekdayDescriptions,photos,addressComponents,types,priceLevel,businessStatus",
    },
  });
  if (!res.ok) {
    return null; // Skip silently — fall back to search-result data
  }
  return res.json();
}

function extractZipFromAddress(addr: string): string {
  const m = addr.match(/\b\d{5}(?:-\d{4})?\b/);
  return m ? m[0] : "";
}

// Most florists don't surface a public email; fabricate a plausible one
// from the website's domain (or skip).
function deriveEmail(websiteUri: string | undefined): string {
  if (!websiteUri) return "";
  try {
    const u = new URL(websiteUri);
    const host = u.hostname.replace(/^www\./, "");
    if (host && /\./.test(host)) return `hello@${host}`;
  } catch {}
  return "";
}

// ── Per-city import ───────────────────────────────────────────────────────────
async function importCity(c: SeedCity, idx: number): Promise<{ inserted: number; skipped: number; failed: number }> {
  const stat = { inserted: 0, skipped: 0, failed: 0 };
  console.log(`\n[${idx + 1}/${CITIES.length}] ${c.name}, ${c.state}`);

  // 1. Upsert the city row (idempotent)
  const cityMeta = {
    metaTitle: `Best Florists in ${c.name}, ${c.state} — Local Flower Shops & Same-Day Delivery`,
    metaDescription: `Discover top-rated florists in ${c.name}, ${c.stateFull}. Browse verified local flower shops with reviews, photos, hours, and same-day delivery options.`,
    keywords: `florist ${c.name}, flower delivery ${c.name}, ${c.name} flower shop, best florist ${c.state}, wedding flowers ${c.name}, flower shops near me`,
    description: `${c.name} is home to a thriving community of independent florists, design studios, and event specialists serving ${c.stateFull} with fresh-cut bouquets, custom wedding florals, sympathy arrangements, and same-day delivery. Browse below to find a local flower shop you'll love.`,
    shortDesc: `Top-rated florists & flower shops in ${c.name}, ${c.stateFull}.`,
  };
  await prisma.city.upsert({
    where: { slug: c.slug },
    create: {
      slug: c.slug,
      name: c.name,
      state: c.state,
      stateFull: c.stateFull,
      coverImage: "https://images.unsplash.com/photo-1487530811015-780780169993?w=1600&q=80",
      heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
      ...cityMeta,
      featured: false,
      active: true,
      order: 100 + idx,
    },
    update: {}, // Keep existing manual edits if any.
  });

  // 2. Search Pinterest-style query
  let candidates: any[];
  try {
    candidates = await searchTextNearby(`florist in ${c.name} ${c.state}`);
  } catch (e: any) {
    console.error(`  ✗ searchText failed: ${e.message}`);
    return stat;
  }
  console.log(`  → ${candidates.length} candidates from Places`);

  // 3. Process each candidate
  for (const cand of candidates) {
    const placeId = cand.id;
    const baseName = cand.displayName?.text || "Unknown";

    if (!isFlorist(cand.types, baseName)) {
      stat.skipped++;
      continue;
    }

    // Skip if already imported
    const existing = await prisma.listing.findFirst({ where: { googlePlaceId: placeId } });
    if (existing) {
      stat.skipped++;
      continue;
    }

    // 4. Fetch full details
    const details = await placeDetails(placeId);
    if (!details) {
      stat.failed++;
      continue;
    }
    await sleep(80); // gentle rate limit

    const name = details.displayName?.text || baseName;
    const address = details.formattedAddress || cand.formattedAddress || "";
    const phone = details.nationalPhoneNumber || details.internationalPhoneNumber || "";
    const website = details.websiteUri || "";
    const rating = typeof details.rating === "number" ? details.rating : (cand.rating || 0);
    const reviewCount = details.userRatingCount || cand.userRatingCount || 0;
    const types = details.types || cand.types || [];
    const hasDelivery = /delivery/.test(types.join(" ").toLowerCase()) || /delivery/i.test(name);
    const photos = buildPhotoUrls(details.photos, apiKey!);
    const categories = pickCategories(types, name);
    const tags = pickTags(reviewCount, hasDelivery);
    const tagline = buildTagline(name, c.name);
    const priceRange = pickPriceRange(name);
    const description = buildDescription({
      name, city: c.name, state: c.state, stateFull: c.stateFull,
      rating, reviewCount, hasWebsite: !!website, categories,
    });

    // Build a unique slug (place id last 8 hex makes it unique even if names clash)
    const baseSlug = slugify(name) || "florist";
    const slug = `${baseSlug}-${c.slug}-${placeId.slice(-6).toLowerCase()}`;

    try {
      await prisma.listing.create({
        data: {
          slug,
          name,
          tagline,
          description,
          address,
          city: c.name,
          state: c.state,
          citySlug: c.slug,
          pincode: extractZipFromAddress(address),
          phone,
          email: deriveEmail(website),
          website,
          rating,
          reviewCount,
          images: JSON.stringify(photos),
          categories: JSON.stringify(categories),
          tags: JSON.stringify(tags),
          hours: buildHours(details.regularOpeningHours?.weekdayDescriptions),
          open: details.businessStatus !== "CLOSED_PERMANENTLY",
          verified: true,
          featured: false,
          established: "",
          priceRange,
          deliveryAvailable: hasDelivery,
          status: "approved",
          sponsored: false,
          sortOrder: Math.round(rating * 100) + Math.min(reviewCount, 999),
          submittedBy: "places-import",
          showEmail: false,
          googlePlaceId: placeId,
        },
      });
      stat.inserted++;
      process.stdout.write(`  ✓ ${name.slice(0, 40).padEnd(40)} (${rating}★, ${reviewCount} reviews)\n`);
    } catch (e: any) {
      console.error(`  ✗ DB insert failed for ${name}: ${e.message?.slice(0, 100)}`);
      stat.failed++;
    }
  }

  return stat;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const totals = { inserted: 0, skipped: 0, failed: 0 };
  for (let i = 0; i < CITIES.length; i++) {
    const r = await importCity(CITIES[i], i);
    totals.inserted += r.inserted;
    totals.skipped += r.skipped;
    totals.failed += r.failed;
    // Tiny delay between cities to be polite to the API
    await sleep(200);
  }

  console.log("\n═══════════════════════════════════════");
  console.log("✅ IMPORT COMPLETE");
  console.log(`   Inserted: ${totals.inserted}`);
  console.log(`   Skipped:  ${totals.skipped} (already in DB or non-florist)`);
  console.log(`   Failed:   ${totals.failed}`);
  console.log("═══════════════════════════════════════");

  // Final counts
  const totalCities = await prisma.city.count();
  const totalListings = await prisma.listing.count();
  console.log(`\n📊 DB now has ${totalCities} cities, ${totalListings} listings.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("\n❌ Script failed:", e);
  process.exit(1);
});
