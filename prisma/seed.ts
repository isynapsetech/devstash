// Seeds system item types and a demo user with the dashboard mock data.
// Run with `npm run db:seed` (Prisma 7 no longer seeds automatically after migrations).
// Safe to re-run: the demo user is recreated and system types are only added if missing.

import "dotenv/config";
import { collections, currentUser, items } from "../src/lib/mock-data";
import { prisma } from "../src/lib/prisma";

const SYSTEM_TYPES = [
  { mockId: "type_snippet", name: "Snippet", icon: "Code", color: "#3b82f6" },
  { mockId: "type_prompt", name: "Prompt", icon: "Sparkles", color: "#8b5cf6" },
  { mockId: "type_command", name: "Command", icon: "Terminal", color: "#f97316" },
  { mockId: "type_note", name: "Note", icon: "StickyNote", color: "#fde047" },
  { mockId: "type_file", name: "File", icon: "File", color: "#6b7280" },
  { mockId: "type_image", name: "Image", icon: "Image", color: "#ec4899" },
  { mockId: "type_link", name: "Link", icon: "Link", color: "#10b981" },
];

// System types have userId = null, and Postgres treats NULLs as distinct in unique
// constraints, so upsert on [userId, name] isn't possible — look up by name instead.
async function seedSystemTypes(): Promise<Map<string, string>> {
  const typeIds = new Map<string, string>();
  for (const { mockId, ...type } of SYSTEM_TYPES) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, isSystem: true, userId: null },
    });
    const record =
      existing ??
      (await prisma.itemType.create({ data: { ...type, isSystem: true } }));
    typeIds.set(mockId, record.id);
  }
  console.log(`✔ System item types: ${SYSTEM_TYPES.length}`);
  return typeIds;
}

async function seedDemoUser(typeIds: Map<string, string>) {
  // Deleting the user cascades to their items, collections and tags.
  await prisma.user.deleteMany({ where: { email: currentUser.email } });

  const user = await prisma.user.create({
    data: { name: currentUser.name, email: currentUser.email, isPro: currentUser.isPro },
  });

  const collectionIds = new Map<string, string>();
  for (const collection of collections) {
    const record = await prisma.collection.create({
      data: {
        name: collection.name,
        description: collection.description,
        isFavorite: collection.isFavorite,
        isPinned: collection.isPinned,
        userId: user.id,
      },
    });
    collectionIds.set(collection.id, record.id);
  }

  const tagNames = [...new Set(items.flatMap((item) => item.tags))];
  await prisma.tag.createMany({ data: tagNames.map((name) => ({ name, userId: user.id })) });
  const tagIds = new Map(
    (await prisma.tag.findMany({ where: { userId: user.id } })).map((tag) => [tag.name, tag.id])
  );

  for (const item of items) {
    const typeId = typeIds.get(item.typeId);
    if (!typeId) throw new Error(`Unknown item type "${item.typeId}" for item "${item.title}"`);

    await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        contentType: item.contentType,
        content: item.content,
        language: item.language,
        url: item.url,
        fileName: item.fileName,
        fileSize: item.fileSize,
        isFavorite: item.isFavorite,
        isPinned: item.isPinned,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        userId: user.id,
        typeId,
        tags: { create: item.tags.map((name) => ({ tagId: tagIds.get(name)! })) },
        collections: {
          create: item.collectionIds.map((id) => ({ collectionId: collectionIds.get(id)! })),
        },
      },
    });
  }

  console.log(
    `✔ Demo user ${user.email}: ${collections.length} collections, ${items.length} items, ${tagNames.length} tags`
  );
}

async function main() {
  const typeIds = await seedSystemTypes();
  await seedDemoUser(typeIds);
  console.log("\nSeed complete.");
}

main()
  .catch((error) => {
    console.error("✖ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
