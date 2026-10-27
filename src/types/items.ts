export interface ItemTypeSummary {
  id: string;
  name: string;
  icon: string | null; // Lucide icon name
  color: string | null;
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
