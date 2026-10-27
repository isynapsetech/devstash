import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { DashboardItem, ItemStats, SidebarItemType } from "@/types/items";

// The schema has no ordering column, so system types follow this display order; custom types go after.
const SYSTEM_TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

function typeRank(type: SidebarItemType): number {
  const index = SYSTEM_TYPE_ORDER.indexOf(type.name);
  return type.isSystem && index !== -1 ? index : SYSTEM_TYPE_ORDER.length;
}

const DASHBOARD_ITEM_SELECT = {
  id: true,
  title: true,
  description: true,
  isPinned: true,
  isFavorite: true,
  updatedAt: true,
  type: { select: { id: true, name: true, icon: true, color: true } },
  tags: { select: { tag: { select: { name: true } } }, orderBy: { tag: { name: "asc" } } },
} satisfies Prisma.ItemSelect;

type DashboardItemRow = Prisma.ItemGetPayload<{ select: typeof DASHBOARD_ITEM_SELECT }>;

function toDashboardItem({ tags, ...item }: DashboardItemRow): DashboardItem {
  return { ...item, tags: tags.map(({ tag }) => tag.name) };
}

export async function getPinnedItems(userId: string): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    select: DASHBOARD_ITEM_SELECT,
  });
  return items.map(toDashboardItem);
}

export async function getRecentItems(userId: string, limit: number): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: DASHBOARD_ITEM_SELECT,
  });
  return items.map(toDashboardItem);
}

// System types plus the user's custom types, each with the user's item count.
export async function getSidebarItemTypes(userId: string): Promise<SidebarItemType[]> {
  const types = await prisma.itemType.findMany({
    where: { OR: [{ isSystem: true }, { userId }] },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      isSystem: true,
      _count: { select: { items: { where: { userId } } } },
    },
  });

  return types
    .map(({ _count, ...type }) => ({ ...type, itemCount: _count.items }))
    .sort((a, b) => typeRank(a) - typeRank(b) || a.name.localeCompare(b.name));
}

export async function getItemStats(userId: string): Promise<ItemStats> {
  const [total, favorites] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);
  return { total, favorites };
}
