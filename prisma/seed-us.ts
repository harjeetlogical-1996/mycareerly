import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { usListings } from "../app/data/us-listings";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding US city listings...");

  for (const l of usListings) {
    await prisma.listing.upsert({
      where: { slug: l.slug },
      update: {
        name: l.name,
        tagline: l.tagline,
        description: l.description,
        address: l.address,
        city: l.city,
        state: l.state,
        citySlug: l.citySlug,
        pincode: l.pincode,
        phone: l.phone,
        email: l.email,
        website: l.website,
        rating: l.rating,
        reviewCount: l.reviewCount,
        images: JSON.stringify(l.images),
        categories: JSON.stringify(l.categories),
        tags: JSON.stringify(l.tags),
        hours: JSON.stringify(l.hours),
        open: l.open,
        verified: l.verified,
        featured: l.featured,
        established: l.established,
        priceRange: l.priceRange,
        deliveryAvailable: l.deliveryAvailable,
        status: "approved",
      },
      create: {
        slug: l.slug,
        name: l.name,
        tagline: l.tagline,
        description: l.description,
        address: l.address,
        city: l.city,
        state: l.state,
        citySlug: l.citySlug,
        pincode: l.pincode,
        phone: l.phone,
        email: l.email,
        website: l.website,
        rating: l.rating,
        reviewCount: l.reviewCount,
        images: JSON.stringify(l.images),
        categories: JSON.stringify(l.categories),
        tags: JSON.stringify(l.tags),
        hours: JSON.stringify(l.hours),
        open: l.open,
        verified: l.verified,
        featured: l.featured,
        established: l.established,
        priceRange: l.priceRange,
        deliveryAvailable: l.deliveryAvailable,
        status: "approved",
      },
    });
  }

  console.log(`✅ Seeded ${usListings.length} US listings`);
  console.log("🎉 Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
