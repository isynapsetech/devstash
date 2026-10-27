import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CollectionStats,
  CollectionTypeSummary,
  DashboardCollection,
  SidebarCollections,
} from "@/types/collections";

const COLLECTION_SELECT = {
  id: true,
  name: true,
  description: true,
  isFavorite: true,
  items: {
    select: {
      item: { select: { type: { select: { id: true, name: true, icon: true, color: true } } } },
    },
  },
} satisfies Prisma.CollectionSelect;

type CollectionRow = Prisma.CollectionGetPayload<{ select: typeof COLLECTION_SELECT }>;
type TypeRef = CollectionRow["items"][number]["item"]["type"];

// Tally item types and sort most-used first (ties broken by name for a stable order).
function summarizeTypes(types: TypeRef[]): CollectionTypeSummary[] {
  const byId = new Map<string, CollectionTypeSummary>();
  for (const type of types) {
    const summary = byId.get(type.id) ?? { ...type, itemCount: 0 };
    summary.itemCount += 1;
    byId.set(type.id, summary);
  }
  return [...byId.values()].sort(
    (a, b) => b.itemCount - a.itemCount || a.name.localeCompare(b.name)
  );
}

function toDashboardCollection({ items, ...collection }: CollectionRow): DashboardCollection {
  return {
    ...collection,
    itemCount: items.length,
    types: summarizeTypes(items.map(({ item }) => item.type)),
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
    select: COLLECTION_SELECT,
  });
  return collections.map(toDashboardCollection);
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
      select: COLLECTION_SELECT,
    }),
    prisma.collection.findMany({
      where: { userId, isFavorite: false },
      orderBy: { updatedAt: "desc" },
      take: recentLimit,
      select: COLLECTION_SELECT,
    }),
  ]);
  return {
    favorites: favorites.map(toDashboardCollection),
    recents: recents.map(toDashboardCollection),
  };
}

export async function getCollectionStats(userId: string): Promise<CollectionStats> {
  const [total, favorites] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);
  return { total, favorites };
}
