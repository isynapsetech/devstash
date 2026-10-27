import { FolderHeart, Folders, Layers, Star, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getItemStats } from "@/lib/dashboard";
import { getCollectionStats } from "@/lib/db/collections";
import { getCurrentUserId } from "@/lib/db/user";

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
}

const GRID_CLASSES = "grid grid-cols-2 gap-4 lg:grid-cols-4";

export default async function StatsCards() {
  const userId = await getCurrentUserId();
  const collectionStats = await getCollectionStats(userId);
  // Item stats still come from mock data until items are moved to the database.
  const itemStats = getItemStats();

  const cards: Stat[] = [
    { label: "Items", value: itemStats.totalItems, icon: Layers },
    { label: "Collections", value: collectionStats.total, icon: Folders },
    { label: "Favorite items", value: itemStats.favoriteItems, icon: Star },
    { label: "Favorite collections", value: collectionStats.favorites, icon: FolderHeart },
  ];

  return (
    <div className={GRID_CLASSES}>
      {cards.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-muted-foreground">{label}</p>
              <p className="text-2xl font-semibold tabular-nums">{value}</p>
            </div>
            <Icon className="size-5 shrink-0 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className={GRID_CLASSES}>
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-19 rounded-xl" />
      ))}
    </div>
  );
}
