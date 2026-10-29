import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CollectionStats,
  CollectionTypeSummary,
  DashboardCollection,
  SidebarCollections,
} from "@/types/collections";

// Only the user's own items are counted, matching the type tally below.
function collectionSelect(userId: string) {
  return {
    id: true,
    name: true,
    description: true,
    isFavorite: true,
    _count: { select: { items: { where: { item: { userId } } } } },
  } satisfies Prisma.CollectionSelect;
}

type CollectionRow = Prisma.CollectionGetPayload<{ select: ReturnType<typeof collectionSelect> }>;

interface TypeTallyRow {
  collectionId: string;
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  itemCount: bigint; // Postgres COUNT(*) is a bigint
}

// Item counts per (collection, type) in one grouped query, keyed by collection,
// each list sorted most-used first (ties broken by name for a stable order).
async function getTypeSummaries(
  userId: string,
  collectionIds: string[]
): Promise<Map<string, CollectionTypeSummary[]>> {
  const byCollection = new Map<string, CollectionTypeSummary[]>();
  if (collectionIds.length === 0) return byCollection;

  const rows = await prisma.$queryRaw<TypeTallyRow[]>`
    SELECT ic."collectionId", t."id", t."name", t."icon", t."color", COUNT(*) AS "itemCount"
    FROM "ItemCollection" ic
    JOIN "Item" i ON i."id" = ic."itemId"
    JOIN "ItemType" t ON t."id" = i."typeId"
    WHERE ic."collectionId" IN (${Prisma.join(collectionIds)}) AND i."userId" = ${userId}
    GROUP BY ic."collectionId", t."id"
  `;

  for (const { collectionId, itemCount, ...type } of rows) {
    const summaries = byCollection.get(collectionId) ?? [];
    summaries.push({ ...type, itemCount: Number(itemCount) });
    byCollection.set(collectionId, summaries);
  }
  for (const summaries of byCollection.values()) {
    summaries.sort((a, b) => b.itemCount - a.itemCount || a.name.localeCompare(b.name));
  }
  return byCollection;
}

function toDashboardCollection(
  { _count, ...collection }: CollectionRow,
  typeSummaries: Map<string, CollectionTypeSummary[]>
): DashboardCollection {
  return {
    ...collection,
    itemCount: _count.items,
    types: typeSummaries.get(collection.id) ?? [],
  };
}

export async function getRecentCollections(
  userId: string,
  limit: number
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: collectionSelect(userId),
  });
  const typeSummaries = await getTypeSummaries(
    userId,
    collections.map(({ id }) => id)
  );
  return collections.map((collection) => toDashboardCollection(collection, typeSummaries));
}

// Sidebar lists every favorite, then the most recently updated non-favorites.
export async function getSidebarCollections(
  userId: string,
  recentLimit: number
): Promise<SidebarCollections> {
  const [favorites, recents] = await Promise.all([
    prisma.collection.findMany({
      where: { userId, isFavorite: true },
      orderBy: { updatedAt: "desc" },
      select: collectionSelect(userId),
    }),
    prisma.collection.findMany({
      where: { userId, isFavorite: false },
      orderBy: { updatedAt: "desc" },
      take: recentLimit,
      select: collectionSelect(userId),
    }),
  ]);
  // One tally query covers both lists.
  const typeSummaries = await getTypeSummaries(
    userId,
    [...favorites, ...recents].map(({ id }) => id)
  );
  return {
    favorites: favorites.map((collection) => toDashboardCollection(collection, typeSummaries)),
    recents: recents.map((collection) => toDashboardCollection(collection, typeSummaries)),
  };
}

export async function getCollectionStats(userId: string): Promise<CollectionStats> {
  const [total, favorites] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);
  return { total, favorites };
}
