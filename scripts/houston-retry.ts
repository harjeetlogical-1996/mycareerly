import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BASE = "https://places.googleapis.com/v1";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const res = await fetch(`${BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.photos,places.businessStatus",
    },
    body: JSON.stringify({
      textQuery: "flower shops florists in Houston, Texas",
      maxResultCount: 20,
      includedType: "florist",
    }),
  });

  const data = await res.json();
  if (data.error) { console.error(data.error.message); return; }

  const real = (data.places ?? [])
    .filter((p: any) => p.businessStatus === "OPERATIONAL" && p.rating && p.userRatingCount)
    .slice(0, 10);

  const dbListings = await prisma.listing.findMany({
    where: { citySlug: "houston" },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Houston: ${real.length} real shops, ${dbListings.length} in DB`);

  for (let i = 0; i < Math.min(real.length, dbListings.length); i++) {
    const r = real[i];
    const photos = (r.photos ?? []).slice(0, 3).map((ph: any) => `/api/places/photo?name=${encodeURIComponent(ph.name)}`);
    await prisma.listing.update({
      where: { id: dbListings[i].id },
      data: {
        name: r.displayName?.text ?? dbListings[i].name,
        address: r.formattedAddress ?? dbListings[i].address,
        phone: r.nationalPhoneNumber ?? dbListings[i].phone,
        website: r.websiteUri ?? dbListings[i].website,
        rating: Math.round((r.rating ?? 0) * 10) / 10,
        reviewCount: r.userRatingCount ?? 0,
        images: JSON.stringify(photos.length > 0 ? photos : JSON.parse(dbListings[i].images)),
        verified: true,
      },
    });
    console.log(`  ✓ ${r.displayName?.text}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
