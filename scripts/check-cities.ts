import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const dbUrl = process.env.DATABASE_URL!;
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) } as any);

  const cities = await prisma.city.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  // Count listings per city — match by citySlug (preferred) or city name
  const rows: Array<{ name: string; state: string; slug: string; listings: number; approved: number; active: boolean }> = [];
  for (const c of cities) {
    const total = await prisma.listing.count({
      where: {
        OR: [
          { citySlug: c.slug },
          { city: c.name },
        ],
      },
    });
    const approved = await prisma.listing.count({
      where: {
        AND: [
          { OR: [{ citySlug: c.slug }, { city: c.name }] },
          { status: "approved" },
        ],
      },
    });
    rows.push({ name: c.name, state: c.state, slug: c.slug, listings: total, approved, active: c.active });
  }

  rows.sort((a, b) => b.listings - a.listings);

  console.log("CITY".padEnd(22) + "STATE".padEnd(8) + "TOTAL".padStart(7) + "APPROVED".padStart(11) + "  ACTIVE");
  console.log("-".repeat(60));
  for (const r of rows) {
    console.log(r.name.padEnd(22) + r.state.padEnd(8) + String(r.listings).padStart(7) + String(r.approved).padStart(11) + "  " + (r.active ? "✓" : "✗"));
  }

  const totalListings = await prisma.listing.count();
  const approvedListings = await prisma.listing.count({ where: { status: "approved" } });
  const activeCities = await prisma.city.count({ where: { active: true } });
  const orphanListings = await prisma.listing.count({
    where: { AND: [{ citySlug: { not: "" } }, { citySlug: { notIn: cities.map((c) => c.slug) } }] },
  });

  console.log("\n=== TOTALS ===");
  console.log("Total cities:        ", cities.length);
  console.log("Active cities:       ", activeCities);
  console.log("Total listings:      ", totalListings);
  console.log("Approved listings:   ", approvedListings);
  console.log("Orphan listings (citySlug not in any City row):", orphanListings);
  console.log("Cities with 0 listings:", rows.filter((r) => r.listings === 0).length);
  console.log("Cities with 10+ listings:", rows.filter((r) => r.listings >= 10).length);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
