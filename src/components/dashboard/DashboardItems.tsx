import { Clock, Pin } from "lucide-react";
import ItemRow from "@/components/dashboard/ItemRow";
import { Skeleton } from "@/components/ui/skeleton";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";
import { getCurrentUserId } from "@/lib/db/user";
import type { DashboardItem } from "@/types/items";

const RECENT_ITEMS_LIMIT = 10;
const HEADING_CLASSES = "flex items-center gap-2 text-lg font-medium text-muted-foreground";

function ItemList({ items }: { items: DashboardItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}

// Renders nothing at all when there are no pinned items.
export async function PinnedItems() {
  const userId = await getCurrentUserId();
  const items = await getPinnedItems(userId);
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className={HEADING_CLASSES}>
        <Pin className="size-4" />
        Pinned
      </h2>
      <ItemList items={items} />
    </section>
  );
}

export async function RecentItems() {
  const userId = await getCurrentUserId();
  const items = await getRecentItems(userId, RECENT_ITEMS_LIMIT);

  return (
    <section className="space-y-4">
      <h2 className={HEADING_CLASSES}>
        <Clock className="size-4" />
        Recent Items
      </h2>
      {items.length > 0 ? (
        <ItemList items={items} />
      ) : (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      )}
    </section>
  );
}

export function RecentItemsSkeleton() {
  return (
    <section className="space-y-4">
      <h2 className={HEADING_CLASSES}>
        <Clock className="size-4" />
        Recent Items
      </h2>
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </section>
  );
}
