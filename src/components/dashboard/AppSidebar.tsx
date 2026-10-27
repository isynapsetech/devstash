import { Suspense } from "react";
import Link from "next/link";
import { ChevronDown, Layers, Settings } from "lucide-react";
import {
  SidebarCollections,
  SidebarItemTypes,
  SidebarMenuListSkeleton,
} from "@/components/dashboard/SidebarSections";
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { currentUser } from "@/lib/mock-data";

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
      <ChevronDown className="-rotate-90 transition-transform group-data-panel-open/trigger:rotate-0" />
    </SidebarGroupLabel>
  );
}

export default function AppSidebar() {
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
            <Suspense fallback={<SidebarMenuListSkeleton rows={7} />}>
              <SidebarItemTypes />
            </Suspense>
          </CollapsibleContent>
        </Collapsible>

        <SidebarSeparator className="mx-0" />

        <Collapsible defaultOpen render={<SidebarGroup />}>
          <SectionLabel label="Collections" />
          <CollapsibleContent render={<SidebarGroupContent />}>
            <Suspense fallback={<SidebarMenuListSkeleton rows={5} />}>
              <SidebarCollections />
            </Suspense>
          </CollapsibleContent>
        </Collapsible>
      </SidebarContent>

      {/* User area stays on mock data until auth is in place */}
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
