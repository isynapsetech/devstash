import { Suspense } from "react";
import Link from "next/link";
import { PinnedItems, RecentItems, RecentItemsSkeleton } from "@/components/dashboard/DashboardItems";
import RecentCollections, { RecentCollectionsSkeleton } from "@/components/dashboard/RecentCollections";
import StatsCards, { StatsCardsSkeleton } from "@/components/dashboard/StatsCards";

export default function DashboardPage() {
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

      {/* No fallback: the pinned section only appears if there are pinned items */}
      <Suspense fallback={null}>
        <PinnedItems />
      </Suspense>

      <Suspense fallback={<RecentItemsSkeleton />}>
        <RecentItems />
      </Suspense>
    </div>
  );
}
