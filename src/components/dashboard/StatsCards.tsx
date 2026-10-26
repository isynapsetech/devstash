import { FolderHeart, Folders, Layers, Star, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/dashboard";

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
}

export default function StatsCards() {
  const stats = getDashboardStats();
  const cards: Stat[] = [
    { label: "Items", value: stats.totalItems, icon: Layers },
    { label: "Collections", value: stats.totalCollections, icon: Folders },
    { label: "Favorite items", value: stats.favoriteItems, icon: Star },
    { label: "Favorite collections", value: stats.favoriteCollections, icon: FolderHeart },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
