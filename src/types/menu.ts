export type DietaryType = 'veg' | 'non-veg';

export interface ItemVariant {
  id: string;
  name: string; // e.g., 'Half', 'Full', 'Regular', 'Without Oil'
  price: number; // in INR
}

export interface ItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  basePrice: number; // in INR
  image: string;
  description: string;
  dietary: DietaryType;
  variants?: ItemVariant[];
  addons?: ItemAddon[];
  isAvailable: boolean;
  isBestseller?: boolean;
  comboItems?: string[]; // for combo items description
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  itemCount?: number;
  description?: string;
}
