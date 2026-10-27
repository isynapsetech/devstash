// Sidebar queries over the mock data. Replace with Prisma queries once the sidebar uses the database.

import { collections, items, type MockCollection } from "@/lib/mock-data";

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
