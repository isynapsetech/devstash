import { Pin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import TypeIcon from "@/components/dashboard/TypeIcon";
import { getItemType } from "@/lib/dashboard";
import type { MockItem } from "@/lib/mock-data";

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

interface ItemRowProps {
  item: MockItem;
}

export default function ItemRow({ item }: ItemRowProps) {
  const type = getItemType(item.typeId);

  return (
    // Type color comes from data (custom types later), so it can't be a static class
    <Card
      className="flex-row items-start gap-4 border-l-4 px-4"
      style={{ borderLeftColor: type?.color }}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <TypeIcon icon={type?.icon ?? "File"} color={type?.color} className="size-5" />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate font-medium">{item.title}</h3>
          {item.isPinned && <Pin className="size-3.5 shrink-0 text-muted-foreground" />}
          {item.isFavorite && <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />}
        </div>
        <p className="line-clamp-1 text-muted-foreground">{item.description}</p>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <time dateTime={item.updatedAt} className="shrink-0 text-xs text-muted-foreground">
        {DATE_FORMAT.format(new Date(item.updatedAt))}
      </time>
    </Card>
  );
}
