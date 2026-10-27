import Link from "next/link";
import { Folder, Star } from "lucide-react";
import TypeIcon from "@/components/dashboard/TypeIcon";
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getCurrentUserId } from "@/lib/db/user";
import type { DashboardCollection } from "@/types/collections";

const RECENT_COLLECTIONS_LIMIT = 5;

// Type names are stored singular and lowercase ("snippet"); the sidebar shows "Snippets".
function typeLabel(name: string): string {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}s`;
}

export async function SidebarItemTypes() {
  const userId = await getCurrentUserId();
  const types = await getSidebarItemTypes(userId);

  return (
    <SidebarMenu>
      {types.map((type) => {
        const label = typeLabel(type.name);
        return (
          <SidebarMenuItem key={type.id}>
            <SidebarMenuButton
              tooltip={label}
              render={<Link href={`/items/${encodeURIComponent(type.name)}`} />}
            >
              <TypeIcon icon={type.icon ?? "File"} color={type.color ?? undefined} />
              <span>{label}</span>
            </SidebarMenuButton>
            <SidebarMenuBadge className="text-muted-foreground">{type.itemCount}</SidebarMenuBadge>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function SubLabel({ label }: { label: string }) {
  return (
    <p className="px-2 pt-3 pb-1 text-[0.7rem] font-medium tracking-wider text-sidebar-foreground/50 uppercase group-data-[collapsible=icon]:hidden">
      {label}
    </p>
  );
}

// Favorites: folder icon + star. Recents: dot colored by the most-used item type + item count.
function CollectionLink({ collection }: { collection: DashboardCollection }) {
  // Types are sorted most-used first, so the first one gives the dot its color.
  const dotColor = collection.types[0]?.color ?? undefined;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={collection.name}
        render={<Link href={`/collections/${collection.id}`} />}
      >
        {collection.isFavorite ? (
          <Folder className="text-muted-foreground" />
        ) : (
          <span className="flex size-4 shrink-0 items-center justify-center">
            {/* Color comes from the collection's dominant item type, so it can't be a static class */}
            <span
              className="size-2.5 rounded-full bg-muted-foreground"
              style={{ backgroundColor: dotColor }}
            />
          </span>
        )}
        <span>{collection.name}</span>
      </SidebarMenuButton>
      {collection.isFavorite ? (
        <SidebarMenuBadge>
          <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
        </SidebarMenuBadge>
      ) : (
        <SidebarMenuBadge className="text-muted-foreground">{collection.itemCount}</SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

export async function SidebarCollections() {
  const userId = await getCurrentUserId();
  const { favorites, recents } = await getSidebarCollections(userId, RECENT_COLLECTIONS_LIMIT);

  return (
    <>
      {favorites.length > 0 && (
        <>
          <SubLabel label="Favorites" />
          <SidebarMenu>
            {favorites.map((collection) => (
              <CollectionLink key={collection.id} collection={collection} />
            ))}
          </SidebarMenu>
        </>
      )}
      {recents.length > 0 && (
        <>
          <SubLabel label="Recent" />
          <SidebarMenu>
            {recents.map((collection) => (
              <CollectionLink key={collection.id} collection={collection} />
            ))}
          </SidebarMenu>
        </>
      )}
      <SidebarMenu className="pt-2">
        <SidebarMenuItem>
          <SidebarMenuButton
            size="sm"
            tooltip="View all collections"
            render={<Link href="/collections" />}
            className="text-muted-foreground"
          >
            <span>View all collections</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}

// Fixed widths: shadcn's SidebarMenuSkeleton uses Math.random(), which can't be prerendered.
const SKELETON_WIDTHS = ["w-24", "w-20", "w-28", "w-16", "w-24", "w-20", "w-16"];

export function SidebarMenuListSkeleton({ rows }: { rows: number }) {
  return (
    <SidebarMenu>
      {Array.from({ length: rows }, (_, i) => (
        <SidebarMenuItem key={i} className="flex h-8 items-center gap-2 px-2">
          <Skeleton className="size-4 rounded-md" />
          <Skeleton
            className={`h-4 group-data-[collapsible=icon]:hidden ${SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]}`}
          />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
