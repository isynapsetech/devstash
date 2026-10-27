// Smoke test for the database connection and schema. Run with `npm run db:test`.
// Uses the app's Prisma client (pooled DATABASE_URL via the Neon adapter).

import "dotenv/config";
import { compare } from "bcryptjs";
import { prisma } from "../src/lib/prisma";

// Expected seed data (see prisma/seed.ts and context/features/seed-spec.md).
const DEMO_EMAIL = "demo@devstash.io";
const DEMO_PASSWORD = "12345678";
const SYSTEM_TYPE_NAMES = ["command", "file", "image", "link", "note", "prompt", "snippet"];
const EXPECTED_COLLECTIONS: Record<string, Record<string, number>> = {
  "React Patterns": { snippet: 3 },
  "AI Workflows": { prompt: 3 },
  DevOps: { snippet: 1, command: 1, link: 2 },
  "Terminal Commands": { command: 4 },
  "Design Resources": { link: 4 },
};

async function checkConnection() {
  const [{ version }] = await prisma.$queryRaw<{ version: string }[]>`SELECT version()`;
  console.log(`✔ Connected: ${version.split(",")[0]}`);
}

async function checkTables() {
  // Cast to text: the Neon adapter can't deserialize Postgres's internal `name` type.
  const tables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name::text AS table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name`;
  console.log(`✔ Tables (${tables.length}): ${tables.map((t) => t.table_name).join(", ")}`);
}

async function checkCounts() {
  const counts = {
    users: await prisma.user.count(),
    itemTypes: await prisma.itemType.count(),
    items: await prisma.item.count(),
    collections: await prisma.collection.count(),
    tags: await prisma.tag.count(),
  };
  console.log("✔ Row counts:", counts);
}

function countByType(types: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const type of types) counts[type] = (counts[type] ?? 0) + 1;
  return counts;
}

function sameCounts(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => a[key] === b[key]);
}

async function checkSeedData() {
  const systemTypes = await prisma.itemType.findMany({
    where: { isSystem: true, userId: null },
    orderBy: { name: "asc" },
  });
  const typeNames = systemTypes.map((type) => type.name);
  if (typeNames.join() !== SYSTEM_TYPE_NAMES.join()) {
    throw new Error(`System types are [${typeNames}], expected [${SYSTEM_TYPE_NAMES}]`);
  }
  console.log(`✔ Seed: ${typeNames.length} system item types`);

  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    include: {
      collections: { include: { items: { include: { item: { include: { type: true } } } } } },
    },
  });
  if (!user) throw new Error(`Demo user ${DEMO_EMAIL} not found — run \`npm run db:seed\``);
  if (!user.password || !(await compare(DEMO_PASSWORD, user.password))) {
    throw new Error("Demo user password does not match the seeded password");
  }
  if (user.isPro || !user.emailVerified) {
    throw new Error("Demo user should be a verified free (non-Pro) account");
  }
  console.log(`✔ Seed: demo user ${user.email} (password verified, free plan, email verified)`);

  const collectionNames = user.collections.map((collection) => collection.name).sort();
  const expectedNames = Object.keys(EXPECTED_COLLECTIONS).sort();
  if (collectionNames.join() !== expectedNames.join()) {
    throw new Error(`Collections are [${collectionNames}], expected [${expectedNames}]`);
  }
  for (const collection of user.collections) {
    const actual = countByType(collection.items.map(({ item }) => item.type.name));
    const expected = EXPECTED_COLLECTIONS[collection.name];
    if (!sameCounts(actual, expected)) {
      throw new Error(
        `"${collection.name}" has ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`
      );
    }
    const linksMissingUrl = collection.items.filter(({ item }) => item.type.name === "link" && !item.url);
    if (linksMissingUrl.length > 0) throw new Error(`"${collection.name}" has links without a URL`);
  }
  const itemTotal = user.collections.reduce((sum, collection) => sum + collection.items.length, 0);
  console.log(`✔ Seed: ${user.collections.length} collections with ${itemTotal} items match the spec`);
}

// Creates a throwaway user with related rows, reads them back, then deletes the user
// and confirms the cascade removed everything it owned.
async function checkWriteAndCascade() {
  const email = `test-db-${Date.now()}@devstash.local`;

  const user = await prisma.user.create({
    data: {
      email,
      name: "DB Test",
      itemTypes: { create: { name: "Test Type", icon: "Code", color: "#3b82f6" } },
      tags: { create: { name: "test-tag" } },
      collections: { create: { name: "Test Collection" } },
    },
    include: { itemTypes: true, tags: true, collections: true },
  });

  try {
    const item = await prisma.item.create({
      data: {
        title: "Test Item",
        content: "console.log('hello')",
        language: "typescript",
        userId: user.id,
        typeId: user.itemTypes[0].id,
        tags: { create: { tagId: user.tags[0].id } },
        collections: { create: { collectionId: user.collections[0].id } },
      },
      include: { type: true, tags: { include: { tag: true } }, collections: { include: { collection: true } } },
    });
    console.log(
      `✔ Write/read: "${item.title}" (${item.type.name}) tagged [${item.tags.map((t) => t.tag.name)}] in [${item.collections.map((c) => c.collection.name)}]`
    );
  } finally {
    await prisma.user.delete({ where: { id: user.id } });
  }

  const leftovers =
    (await prisma.item.count({ where: { userId: user.id } })) +
    (await prisma.itemType.count({ where: { userId: user.id } })) +
    (await prisma.tag.count({ where: { userId: user.id } })) +
    (await prisma.collection.count({ where: { userId: user.id } }));
  if (leftovers > 0) throw new Error(`Cascade delete left ${leftovers} rows behind`);
  console.log("✔ Cascade delete: user's items, types, tags and collections removed");
}

async function main() {
  await checkConnection();
  await checkTables();
  await checkCounts();
  await checkSeedData();
  await checkWriteAndCascade();
  console.log("\nAll database checks passed.");
}

main()
  .catch((error) => {
    console.error("✖ Database test failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
