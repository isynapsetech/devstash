export interface ItemTypeSummary {
  id: string;
  name: string;
  icon: string | null; // Lucide icon name
  color: string | null;
}

export interface SidebarItemType extends ItemTypeSummary {
  isSystem: boolean;
  itemCount: number; // the current user's items of this type
}

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  updatedAt: Date;
  type: ItemTypeSummary;
  tags: string[];
}

export interface ItemStats {
  total: number;
  favorites: number;
}
