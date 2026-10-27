import { prisma } from "@/lib/prisma";
import type {
  CollectionStats,
  CollectionTypeSummary,
  DashboardCollection,
} from "@/types/collections";

interface TypeRef {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

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

export async function getRecentCollections(
  userId: string,
  limit: number
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      items: {
        select: {
          item: { select: { type: { select: { id: true, name: true, icon: true, color: true } } } },
        },
      },
    },
  });

  return collections.map(({ items, ...collection }) => ({
    ...collection,
    itemCount: items.length,
    types: summarizeTypes(items.map(({ item }) => item.type)),
  }));
}

export async function getCollectionStats(userId: string): Promise<CollectionStats> {
  const [total, favorites] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);
  return { total, favorites };
}
