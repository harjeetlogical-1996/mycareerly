import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { FLOWERS_BY_LETTER, LETTERS } from "../app/data/flowers-by-letter";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

function buildLetterSection(letter: string): string {
  const letterUpper = letter.toUpperCase();
  const flowers = FLOWERS_BY_LETTER[letter] ?? [];
  const total = flowers.length;

  // Pick up to 8 example flowers for each letter
  const examples = flowers.slice(0, 8);

  if (examples.length === 0) {
    return `
## [${letterUpper} — Flowers Beginning with ${letterUpper}](/flowers/${letter})

Explore our growing collection of flowers that start with the letter ${letterUpper}. [View all ${letterUpper} flowers →](/flowers/${letter})
`;
  }

  const shortIntro =
    examples[0]?.desc ?
      `From ${examples[0].name.replace(/\s*\([^)]*\)/, "")} to ${examples[examples.length - 1].name.replace(/\s*\([^)]*\)/, "")}, the letter ${letterUpper} hosts some of the most beloved blooms in the world.`
      : `Discover all the flowers that begin with the letter ${letterUpper}.`;

  const examplesList = examples
    .map((f) => `- **${f.name}** — ${f.desc}`)
    .join("\n");

  return `
## [${letterUpper} — Flowers Beginning with ${letterUpper}](/flowers/${letter})

${shortIntro} Here are some of the most well-known examples:

${examplesList}

[See all ${total}+ flowers starting with ${letterUpper} →](/flowers/${letter})
`;
}

const INTRO = `

## Browse Flowers by Letter — Jump to Any Section

Every flower name from A to Z, organised into dedicated sections. Click any letter heading or the "See all" link to open that letter's full page in a new tab. Whether you're looking up a specific botanical name or just exploring, start with the letter you want below.
`;

async function main() {
  const article = await prisma.article.findFirst({
    where: { slug: { contains: "a-to-z" } },
  });
  if (!article) { console.log("Not found"); return; }

  // Remove any previously-added section
  let content = article.content;
  const markerRegex = /\n## Browse Flowers by Letter[\s\S]*$/;
  content = content.replace(markerRegex, "");

  // Build all 26 letter sections
  const sections = LETTERS.map(buildLetterSection).join("\n");

  const newContent = content.trimEnd() + "\n" + INTRO + sections;

  await prisma.article.update({
    where: { id: article.id },
    data: { content: newContent },
  });

  const totalFlowers = Object.values(FLOWERS_BY_LETTER).reduce((s, a) => s + a.length, 0);
  console.log(`✓ Updated "${article.title}"`);
  console.log(`  - 26 letter sections with linked H2 headings`);
  console.log(`  - ${totalFlowers} total flowers referenced`);
  console.log(`  - Each section: intro + 8 example flowers + "see all" CTA`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
