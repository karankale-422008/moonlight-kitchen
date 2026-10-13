import { DietaryType, ItemAddon, ItemVariant } from './menu';

export interface CartItem {
  id: string; // unique cart item id (e.g. itemId + variantId + addonIds)
  menuItemId: string;
  name: string;
  image: string;
  dietary: DietaryType;
  selectedVariant?: ItemVariant;
  selectedAddons?: ItemAddon[];
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
}

export interface PricingSummary {
  subtotal: number;
  packagingCharge: number;
  deliveryCharge: number;
  tax: number;
  discount: number;
  couponCode?: string;
  finalTotal: number;
  isFreeDelivery: boolean;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
}
