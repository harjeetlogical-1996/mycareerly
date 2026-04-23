import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BASE = "https://places.googleapis.com/v1";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function searchFlorist(city: string, address: string): Promise<string | null> {
  // Search for real flower shops near the address — guarantees flower-related photos
  try {
    const res = await fetch(`${BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({
        textQuery: `flower shop florist near ${address} ${city}`,
        maxResultCount: 5,
      }),
    });
    const data = await res.json();
    if (data.error) {
      console.error("  ! API error:", data.error.message);
      return null;
    }
    // Pick first result (most relevant)
    return data.places?.[0]?.id ?? null;
  } catch (e: any) {
    console.error("  ! fetch error:", e.message);
    return null;
  }
}

async function getPhotos(placeId: string): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}/places/${placeId}`, {
      headers: { "X-Goog-Api-Key": API_KEY, "X-Goog-FieldMask": "photos" },
    });
    const data = await res.json();
    return (data.photos ?? [])
      .slice(0, 3)
      .map((p: any) => `/api/places/photo?name=${encodeURIComponent(p.name)}`);
  } catch {
    return [];
  }
}

// Cache: one placeId per city+neighborhood area → reuse photos for similar-location shops
const locationCache: Map<string, string[]> = new Map();

async function main() {
  const listings = await prisma.listing.findMany({
    select: { id: true, slug: true, name: true, city: true, address: true },
  });

  console.log(`📸 Fetching Google Places photos for ${listings.length} shops...\n`);

  let withPhotos = 0;
  let skipped = 0;
  let fallback = 0;

  for (let i = 0; i < listings.length; i++) {
    const l = listings[i];
    const progress = `[${(i + 1).toString().padStart(3)}/${listings.length}]`;

    // Use first part of address (street number + first word) as cache key
    const addrKey = l.address.split(" ").slice(0, 2).join(" ");
    const cacheKey = `${l.city}:${addrKey}`;

    let photos: string[] = [];

    if (locationCache.has(cacheKey)) {
      photos = locationCache.get(cacheKey)!;
      console.log(`${progress} ${l.name} → cached (${photos.length} photos)`);
    } else {
      const placeId = await searchFlorist(l.city, l.address);
      await sleep(120);

      if (placeId) {
        photos = await getPhotos(placeId);
        locationCache.set(cacheKey, photos);
        await sleep(120);
      } else {
        skipped++;
      }

      console.log(`${progress} ${l.name}, ${l.city} → ${photos.length} photos`);
    }

    if (photos.length > 0) {
      await prisma.listing.update({
        where: { id: l.id },
        data: { images: JSON.stringify(photos) },
      });
      withPhotos++;
    } else {
      fallback++;
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   ${withPhotos} shops updated with Google photos`);
  console.log(`   ${fallback} shops kept Unsplash fallback`);
  console.log(`   ${skipped} shops had no Google match`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
