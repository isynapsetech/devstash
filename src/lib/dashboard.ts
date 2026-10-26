// Dashboard queries over the mock data. Replace with Prisma queries once the database is in place.

import {
  collections,
  itemTypes,
  items,
  type MockCollection,
  type MockItem,
  type MockItemType,
} from "@/lib/mock-data";

export function getItemType(typeId: string): MockItemType | undefined {
  return itemTypes.find((type) => type.id === typeId);
}

function byUpdatedAtDesc(a: MockItem, b: MockItem): number {
  return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
}

// Collections have no activity timestamp yet, so recency is the latest update among their items.
export function getCollectionsByRecent(): MockCollection[] {
  const lastActivity = new Map<string, number>();
  for (const item of items) {
    const updatedAt = Date.parse(item.updatedAt);
    for (const collectionId of item.collectionIds) {
      lastActivity.set(collectionId, Math.max(lastActivity.get(collectionId) ?? 0, updatedAt));
    }
  }

  return [...collections].sort(
    (a, b) => (lastActivity.get(b.id) ?? 0) - (lastActivity.get(a.id) ?? 0)
  );
}

export function getPinnedItems(): MockItem[] {
  return items.filter((item) => item.isPinned).sort(byUpdatedAtDesc);
}

export function getRecentItems(limit: number): MockItem[] {
  return [...items].sort(byUpdatedAtDesc).slice(0, limit);
}

export function getDashboardStats() {
  return {
    // Per-type counts are the source of truth for totals; the mock item list is only a sample.
    totalItems: itemTypes.reduce((sum, type) => sum + type.itemCount, 0),
    totalCollections: collections.length,
    favoriteItems: items.filter((item) => item.isFavorite).length,
    favoriteCollections: collections.filter((collection) => collection.isFavorite).length,
  };
}
