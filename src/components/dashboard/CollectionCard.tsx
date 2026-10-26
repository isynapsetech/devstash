import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import TypeIcon from "@/components/dashboard/TypeIcon";
import { getItemType } from "@/lib/dashboard";
import type { MockCollection } from "@/lib/mock-data";

interface CollectionCardProps {
  collection: MockCollection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const types = collection.typeIds.map(getItemType).filter((type) => type !== undefined);
  const accentColor = types[0]?.color;

  return (
    <Link href={`/collections/${collection.id}`} className="group/collection rounded-xl">
      {/* Accent color comes from the collection's first item type, so it can't be a static class */}
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
            <p className="text-xs text-muted-foreground">{collection.itemCount} items</p>
          </div>
          <p className="line-clamp-2 text-muted-foreground">{collection.description}</p>
          <div className="mt-auto flex gap-2">
            {types.map((type) => (
              <TypeIcon key={type.id} icon={type.icon} color={type.color} className="size-4" />
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
