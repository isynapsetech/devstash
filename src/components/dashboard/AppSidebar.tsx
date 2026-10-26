import Link from "next/link";
import {
  ChevronDown,
  Code,
  File,
  Folder,
  Image,
  Layers,
  Link as LinkIcon,
  Settings,
  Sparkles,
  Star,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { collections, currentUser, itemTypes, items, type MockCollection } from "@/lib/mock-data";

const TYPE_ICONS: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

const RECENT_COLLECTIONS_LIMIT = 5;

// Collections have no activity timestamp yet, so recency is the latest update among their items.
function getRecentCollections(): MockCollection[] {
  const lastActivity = new Map<string, number>();
  for (const item of items) {
    const updatedAt = Date.parse(item.updatedAt);
    for (const collectionId of item.collectionIds) {
      lastActivity.set(collectionId, Math.max(lastActivity.get(collectionId) ?? 0, updatedAt));
    }
  }

  return collections
    .filter((collection) => !collection.isFavorite)
    .sort((a, b) => (lastActivity.get(b.id) ?? 0) - (lastActivity.get(a.id) ?? 0))
    .slice(0, RECENT_COLLECTIONS_LIMIT);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SectionLabel({ label }: { label: string }) {
  return (
    <SidebarGroupLabel
      render={<CollapsibleTrigger />}
      className="group/trigger w-fit gap-1 hover:text-sidebar-foreground"
    >
      {label}
      <ChevronDown className="-rotate-90 transition-transform group-data-[panel-open]/trigger:rotate-0" />
    </SidebarGroupLabel>
  );
}

function SubLabel({ label }: { label: string }) {
  return (
    <p className="px-2 pt-3 pb-1 text-[0.7rem] font-medium tracking-wider text-sidebar-foreground/50 uppercase group-data-[collapsible=icon]:hidden">
      {label}
    </p>
  );
}

function CollectionLink({ collection }: { collection: MockCollection }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={collection.name}
        render={<Link href={`/collections/${collection.id}`} />}
      >
        <Folder className="text-muted-foreground" />
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

export default function AppSidebar() {
  const favoriteCollections = collections.filter((collection) => collection.isFavorite);
  const recentCollections = getRecentCollections();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="DevStash" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-white">
                <Layers />
              </div>
              <span className="text-base font-semibold">DevStash</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <Collapsible defaultOpen render={<SidebarGroup />}>
          <SectionLabel label="Types" />
          <CollapsibleContent render={<SidebarGroupContent />}>
            <SidebarMenu>
              {itemTypes.map((type) => {
                const Icon = TYPE_ICONS[type.icon] ?? File;
                return (
                  <SidebarMenuItem key={type.id}>
                    <SidebarMenuButton
                      tooltip={type.name}
                      render={<Link href={`/items/${type.slug}`} />}
                    >
                      {/* Type colors come from data (custom types later), so they can't be static classes */}
                      <Icon style={{ color: type.color }} />
                      <span>{type.name}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge className="text-muted-foreground">{type.itemCount}</SidebarMenuBadge>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </CollapsibleContent>
        </Collapsible>

        <SidebarSeparator className="mx-0" />

        <Collapsible defaultOpen render={<SidebarGroup />}>
          <SectionLabel label="Collections" />
          <CollapsibleContent render={<SidebarGroupContent />}>
            <SubLabel label="Favorites" />
            <SidebarMenu>
              {favoriteCollections.map((collection) => (
                <CollectionLink key={collection.id} collection={collection} />
              ))}
            </SidebarMenu>
            <SubLabel label="Recent" />
            <SidebarMenu>
              {recentCollections.map((collection) => (
                <CollectionLink key={collection.id} collection={collection} />
              ))}
            </SidebarMenu>
          </CollapsibleContent>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={currentUser.name}>
              <Avatar>
                {currentUser.image && <AvatarImage src={currentUser.image} alt={currentUser.name} />}
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium">{currentUser.name}</span>
                <span className="truncate text-xs text-muted-foreground">{currentUser.email}</span>
              </div>
              <Settings className="ml-auto text-muted-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
