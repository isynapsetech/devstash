import { Suspense } from "react";
import Link from "next/link";
import { Clock, Pin } from "lucide-react";
import ItemRow from "@/components/dashboard/ItemRow";
import RecentCollections, { RecentCollectionsSkeleton } from "@/components/dashboard/RecentCollections";
import StatsCards, { StatsCardsSkeleton } from "@/components/dashboard/StatsCards";
import { getPinnedItems, getRecentItems } from "@/lib/dashboard";

const RECENT_ITEMS_LIMIT = 10;

export default function DashboardPage() {
  const pinnedItems = getPinnedItems();
  const recentItems = getRecentItems(RECENT_ITEMS_LIMIT);

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your developer knowledge hub</p>
      </div>

      {/* Database-backed sections stream in behind Suspense (required with cacheComponents) */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Collections</h2>
          <Link href="/collections" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <Suspense fallback={<RecentCollectionsSkeleton />}>
          <RecentCollections />
        </Suspense>
      </section>

      {pinnedItems.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
            <Pin className="size-4" />
            Pinned
          </h2>
          <div className="space-y-3">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
          <Clock className="size-4" />
          Recent Items
        </h2>
        <div className="space-y-3">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
