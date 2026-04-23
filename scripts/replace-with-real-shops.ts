import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BASE = "https://places.googleapis.com/v1";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type PlaceData = {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  photos: string[];
  hours: { day: string; time: string; closed?: boolean }[];
  priceLevel?: number;
  open: boolean;
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function parseHours(regularOpeningHours: any): { day: string; time: string; closed?: boolean }[] {
  const result: { day: string; time: string; closed?: boolean }[] = [];
  const periods = regularOpeningHours?.periods ?? [];

  for (let i = 0; i < 7; i++) {
    const dayName = DAYS[i];
    // Google uses 0=Sunday, so map: Mon=1, Tue=2, ..., Sun=0
    const googleDay = i === 6 ? 0 : i + 1;
    const period = periods.find((p: any) => p.open?.day === googleDay);
    if (!period) {
      result.push({ day: dayName, time: "Closed", closed: true });
    } else {
      const openH = period.open.hour ?? 9;
      const openM = period.open.minute ?? 0;
      const closeH = period.close?.hour ?? 18;
      const closeM = period.close?.minute ?? 0;
      const fmt = (h: number, m: number) => {
        const pm = h >= 12;
        const hh = h % 12 || 12;
        const mm = m.toString().padStart(2, "0");
        return `${hh}:${mm} ${pm ? "PM" : "AM"}`;
      };
      result.push({ day: dayName, time: `${fmt(openH, openM)} – ${fmt(closeH, closeM)}` });
    }
  }
  return result;
}

async function searchFloristsInCity(city: string, state: string): Promise<PlaceData[]> {
  const res = await fetch(`${BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.photos,places.regularOpeningHours,places.priceLevel,places.businessStatus",
    },
    body: JSON.stringify({
      textQuery: `flower shops florists in ${city}, ${state}`,
      maxResultCount: 20,
      includedType: "florist",
    }),
  });

  const data = await res.json();
  if (data.error) {
    console.error(`  ! ${data.error.message}`);
    return [];
  }

  return (data.places ?? [])
    .filter((p: any) => p.businessStatus === "OPERATIONAL" && p.rating && p.userRatingCount)
    .slice(0, 10)
    .map((p: any) => ({
      id: p.id,
      name: p.displayName?.text ?? "Flower Shop",
      address: p.formattedAddress ?? "",
      phone: p.nationalPhoneNumber ?? "",
      website: p.websiteUri ?? "",
      rating: Math.round((p.rating ?? 0) * 10) / 10,
      reviewCount: p.userRatingCount ?? 0,
      photos: (p.photos ?? []).slice(0, 3).map((ph: any) => `/api/places/photo?name=${encodeURIComponent(ph.name)}`),
      hours: parseHours(p.regularOpeningHours),
      priceLevel: p.priceLevel ?? 0,
      open: true,
    }));
}

function priceLevelToRange(level: number): string {
  if (level === 1) return "budget";
  if (level >= 3) return "premium";
  return "mid";
}

async function main() {
  const cities = await prisma.city.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  console.log(`🔍 Fetching real flower shops for ${cities.length} cities...\n`);

  let totalUpdated = 0;
  let citiesWithFull = 0;

  for (const city of cities) {
    const dbListings = await prisma.listing.findMany({
      where: { citySlug: city.slug },
      orderBy: { createdAt: "asc" },
    });

    if (dbListings.length === 0) continue;

    const realShops = await searchFloristsInCity(city.name, city.stateFull || city.state);
    await sleep(200);

    if (realShops.length === 0) {
      console.log(`❌ ${city.name}, ${city.state} — no real shops found`);
      continue;
    }

    const pairCount = Math.min(dbListings.length, realShops.length);
    if (pairCount === 10) citiesWithFull++;

    console.log(`✓ ${city.name}, ${city.state} — replacing ${pairCount}/${dbListings.length} shops with real data`);

    for (let i = 0; i < pairCount; i++) {
      const dbShop = dbListings[i];
      const real = realShops[i];

      await prisma.listing.update({
        where: { id: dbShop.id },
        data: {
          name: real.name,
          address: real.address,
          phone: real.phone || dbShop.phone,
          website: real.website || dbShop.website,
          rating: real.rating,
          reviewCount: real.reviewCount,
          images: JSON.stringify(real.photos.length > 0 ? real.photos : JSON.parse(dbShop.images)),
          hours: real.hours.length === 7 ? JSON.stringify(real.hours) : dbShop.hours,
          priceRange: real.priceLevel ? priceLevelToRange(real.priceLevel) : dbShop.priceRange,
          open: real.open,
          verified: true,
        },
      });
      totalUpdated++;
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   ${totalUpdated} shops updated with real Google Places data`);
  console.log(`   ${citiesWithFull} cities got full 10 real shops`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
