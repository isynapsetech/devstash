// Smoke test for the database connection and schema. Run with `npm run db:test`.
// Uses the app's Prisma client (pooled DATABASE_URL via the Neon adapter).

import "dotenv/config";
import { prisma } from "../src/lib/prisma";

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
  await checkWriteAndCascade();
  console.log("\nAll database checks passed.");
}

main()
  .catch((error) => {
    console.error("✖ Database test failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
