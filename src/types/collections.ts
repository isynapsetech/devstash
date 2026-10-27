export interface CollectionTypeSummary {
  id: string;
  name: string;
  icon: string | null; // Lucide icon name
  color: string | null;
  itemCount: number;
}

export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  // Item types in the collection, most-used first. The first one drives the card's accent color.
  types: CollectionTypeSummary[];
}

export interface CollectionStats {
  total: number;
  favorites: number;
}
