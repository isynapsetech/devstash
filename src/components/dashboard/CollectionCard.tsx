import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import TypeIcon from "@/components/dashboard/TypeIcon";
import type { DashboardCollection } from "@/types/collections";

interface CollectionCardProps {
  collection: DashboardCollection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  // Types are sorted most-used first, so the accent comes from the dominant type.
  const accentColor = collection.types[0]?.color ?? undefined;

  return (
    <Link href={`/collections/${collection.id}`} className="group/collection rounded-xl">
      {/* Accent color comes from data, so it can't be a static class */}
      <Card
        className="h-full border-l-4 transition-colors group-hover/collection:bg-accent/50"
        style={{ borderLeftColor: accentColor }}
      >
        <CardContent className="flex h-full flex-col gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-medium">{collection.name}</h3>
              {collection.isFavorite && (
                <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          {collection.description && (
            <p className="line-clamp-2 text-muted-foreground">{collection.description}</p>
          )}
          <div className="mt-auto flex gap-2">
            {collection.types.map((type) => (
              <TypeIcon
                key={type.id}
                icon={type.icon ?? "File"}
                color={type.color ?? undefined}
                className="size-4"
                aria-label={`${type.itemCount} ${type.name}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
