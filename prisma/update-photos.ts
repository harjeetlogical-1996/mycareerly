/**
 * One-time script: fetch real Google Places photos for every approved listing
 * and update the `images` column in the DB with proxy URLs.
 */
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BASE = "https://places.googleapis.com/v1";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter } as any);

async function getPlaceId(name: string, address: string, city: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({
        textQuery: `${name} ${address} ${city}`,
        maxResultCount: 1,
      }),
    });
    const data = await res.json();
    return data.places?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function getPhotoProxyUrls(placeId: string): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "photos",
      },
    });
    const data = await res.json();
    return (data.photos ?? [])
      .slice(0, 3)
      .map(
        (p: any) =>
          `/api/places/photo?name=${encodeURIComponent(p.name)}`
      );
  } catch {
    return [];
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const listings = await prisma.listing.findMany({
    where: { status: "approved" },
    select: { id: true, name: true, address: true, city: true },
  });

  console.log(`\n📸 Updating photos for ${listings.length} listings...\n`);

  let updated = 0;
  let skipped = 0;

  for (const listing of listings) {
    process.stdout.write(`  ${listing.name} (${listing.city}) ... `);

    const placeId = await getPlaceId(listing.name, listing.address, listing.city);
    if (!placeId) {
      console.log("✗ place not found");
      skipped++;
      await sleep(300);
      continue;
    }

    const photos = await getPhotoProxyUrls(placeId);
    if (photos.length === 0) {
      console.log("✗ no photos");
      skipped++;
      await sleep(300);
      continue;
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: { images: JSON.stringify(photos) },
    });

    console.log(`✓ ${photos.length} photos`);
    updated++;
    await sleep(300); // avoid hitting rate limits
  }

  console.log(`\n✅ Done — ${updated} updated, ${skipped} skipped\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
