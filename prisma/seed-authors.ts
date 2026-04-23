import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const authors = [
  {
    name: "Sarah Mitchell",
    bio: "Professional florist with 12 years of experience. Founder of Bloom Studio, New York.",
    specialty: "Cut Flower Care & Arrangements",
  },
  {
    name: "James Harper",
    bio: "Horticulturist and garden writer based in Portland, Oregon. Writes about botanical trends and seasonal floristry.",
    specialty: "Horticulture & Seasonal Flowers",
  },
  {
    name: "Emily Carter",
    bio: "Interior stylist and floral designer. Teaches flower arrangement workshops in New York.",
    specialty: "DIY Arrangements & Floral Design",
  },
  {
    name: "Jessica Romano",
    bio: "Wedding planner and floral stylist with 15 years of experience. Based in New York.",
    specialty: "Wedding Floristry",
  },
  {
    name: "Dr. Mark Reynolds",
    bio: "Horticulturist and rose specialist. 20+ years of experience in floriculture research.",
    specialty: "Botanical Research & Medicinal Flowers",
  },
];

async function main() {
  console.log("Seeding authors...");
  for (const author of authors) {
    await prisma.author.upsert({
      where: { slug: toSlug(author.name) },
      update: { name: author.name, bio: author.bio, specialty: author.specialty },
      create: {
        name: author.name,
        slug: toSlug(author.name),
        bio: author.bio,
        specialty: author.specialty,
        active: true,
      },
    });
    console.log(`  ✓ ${author.name}`);
  }
  console.log("Done.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
