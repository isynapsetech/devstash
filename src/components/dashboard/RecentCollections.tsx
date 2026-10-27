import CollectionCard from "@/components/dashboard/CollectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getRecentCollections } from "@/lib/db/collections";
import { getCurrentUserId } from "@/lib/db/user";

const RECENT_COLLECTIONS_LIMIT = 6;
const GRID_CLASSES = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

export default async function RecentCollections() {
  const userId = await getCurrentUserId();
  const collections = await getRecentCollections(userId, RECENT_COLLECTIONS_LIMIT);

  if (collections.length === 0) {
    return <p className="text-sm text-muted-foreground">No collections yet.</p>;
  }

  return (
    <div className={GRID_CLASSES}>
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}

export function RecentCollectionsSkeleton() {
  return (
    <div className={GRID_CLASSES}>
      {Array.from({ length: RECENT_COLLECTIONS_LIMIT }, (_, i) => (
        <Skeleton key={i} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}
