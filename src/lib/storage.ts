import { supabase, isSupabaseConfigured } from './supabase';
import { CustomerProfile, CustomerAddress } from '../types/customer';
import { OrderRecord, OrderStatus } from '../types/order';
import { MenuItem } from '../types/menu';
import { MENU_ITEMS } from '../data/menu';
import { BannerItem } from '../types/banner';
import { RestaurantSettings } from '../types/settings';
import { RESTAURANT_CONFIG } from '../config/restaurant';

const STORAGE_KEYS = {
  PROFILE: 'moonlight_customer_profile',
  ORDERS: 'moonlight_orders_history',
  MENU_OVERRIDE: 'moonlight_menu_override',
  MENU_ADDED: 'moonlight_added_menu_items',
  MENU_DELETED: 'moonlight_deleted_menu_items',
  BANNERS: 'moonlight_banner_slides',
  SETTINGS: 'moonlight_restaurant_settings',
  CART: 'moonlight_cart_items',
};

import { EDITED_PROMO_BANNERS } from '../data/defaultBanners';

// ====================================================
// 5 DEFAULT BANNER SLIDER IMAGES (EDITED PROMO BANNERS)
// ====================================================
export const DEFAULT_BANNERS: BannerItem[] = EDITED_PROMO_BANNERS;

// ====================================================
// BANNER SLIDER MANAGEMENT (EDITABLE FROM ADMIN)
// ====================================================

export async function fetchBanners(): Promise<BannerItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BANNERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading banners from local storage:', err);
  }
  // Initialize with defaults if none saved
  try {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(DEFAULT_BANNERS));
  } catch (err) {
    console.error('Error saving default banners:', err);
  }
  return DEFAULT_BANNERS;
}

export async function saveBanners(banners: BannerItem[]): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    return true;
  } catch (err) {
    console.error('Failed to save banners:', err);
    return false;
  }
}

export async function addBanner(bannerData: Omit<BannerItem, 'id'>): Promise<BannerItem> {
  const current = await fetchBanners();
  const newBanner: BannerItem = {
    ...bannerData,
    id: `banner_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };
  const updated = [...current, newBanner];
  await saveBanners(updated);
  return newBanner;
}

export async function updateBanner(updatedBanner: BannerItem): Promise<boolean> {
  const current = await fetchBanners();
  const updated = current.map(b => (b.id === updatedBanner.id ? updatedBanner : b));
  return saveBanners(updated);
}

export async function deleteBanner(bannerId: string): Promise<boolean> {
  const current = await fetchBanners();
  const updated = current.filter(b => b.id !== bannerId);
  return saveBanners(updated);
}

// ====================================================
// WEBSITE SETTINGS (EDITABLE FROM ADMIN)
// ====================================================

export const DEFAULT_SETTINGS: RestaurantSettings = {
  name: RESTAURANT_CONFIG.name,
  tagline: RESTAURANT_CONFIG.tagline,
  promoBannerText: `FREE delivery on orders above ₹${RESTAURANT_CONFIG.freeDeliveryThreshold} • Use code MOONLIGHT10 for 10% off`,
  contactPhone: RESTAURANT_CONFIG.displayPhone,
  whatsappNumber: RESTAURANT_CONFIG.whatsappNumber,
  operatingHours: RESTAURANT_CONFIG.operatingHours,
  standardDeliveryFee: RESTAURANT_CONFIG.standardDeliveryFee,
  freeDeliveryThreshold: RESTAURANT_CONFIG.freeDeliveryThreshold,
  minOrderAmount: RESTAURANT_CONFIG.minOrderAmount,
  city: RESTAURANT_CONFIG.city,
  address: 'Shop No. 4, Moonlight Kitchen, Near City Center',
};

export async function fetchRestaurantSettings(): Promise<RestaurantSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.error('Error reading settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export async function saveRestaurantSettings(settings: RestaurantSettings): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('Error saving restaurant settings:', err);
    return false;
  }
}

// ====================================================
// MENU MANAGEMENT (EDIT, ADD NEW DISH, DELETE DISH)
// ====================================================

export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const overridesRaw = localStorage.getItem(STORAGE_KEYS.MENU_OVERRIDE);
    const addedRaw = localStorage.getItem(STORAGE_KEYS.MENU_ADDED);
    const deletedRaw = localStorage.getItem(STORAGE_KEYS.MENU_DELETED);

    const overrides: Record<string, Partial<MenuItem>> = overridesRaw ? JSON.parse(overridesRaw) : {};
    const addedItems: MenuItem[] = addedRaw ? JSON.parse(addedRaw) : [];
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

    // Base items with overrides and without deleted ones
    const baseItems = MENU_ITEMS
      .filter(item => !deletedIds.includes(item.id))
      .map(item => {
        if (overrides[item.id]) {
          return { ...item, ...overrides[item.id] };
        }
        return item;
      });

    // Added items with overrides and without deleted ones
    const customItems = addedItems
      .filter(item => !deletedIds.includes(item.id))
      .map(item => {
        if (overrides[item.id]) {
          return { ...item, ...overrides[item.id] };
        }
        return item;
      });

    return [...baseItems, ...customItems];
  } catch (err) {
    console.error('Error fetching menu items:', err);
    return MENU_ITEMS;
  }
}

export async function addMenuItem(itemData: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  const newItem: MenuItem = {
    ...itemData,
    id: `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU_ADDED);
    const existing: MenuItem[] = raw ? JSON.parse(raw) : [];
    const updated = [newItem, ...existing];
    localStorage.setItem(STORAGE_KEYS.MENU_ADDED, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to add custom menu item:', err);
  }

  return newItem;
}

export async function updateMenuItem(updatedItem: MenuItem): Promise<boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU_OVERRIDE);
    const overrides: Record<string, Partial<MenuItem>> = raw ? JSON.parse(raw) : {};
    overrides[updatedItem.id] = { ...overrides[updatedItem.id], ...updatedItem };
    localStorage.setItem(STORAGE_KEYS.MENU_OVERRIDE, JSON.stringify(overrides));
    return true;
  } catch (err) {
    console.error('Failed to update menu item:', err);
    return false;
  }
}

export async function deleteMenuItem(itemId: string): Promise<boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU_DELETED);
    const deletedIds: string[] = raw ? JSON.parse(raw) : [];
    if (!deletedIds.includes(itemId)) {
      deletedIds.push(itemId);
      localStorage.setItem(STORAGE_KEYS.MENU_DELETED, JSON.stringify(deletedIds));
    }
    return true;
  } catch (err) {
    console.error('Failed to delete menu item:', err);
    return false;
  }
}

export async function updateMenuItemAvailability(itemId: string, isAvailable: boolean): Promise<boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU_OVERRIDE);
    const overrides: Record<string, Partial<MenuItem>> = raw ? JSON.parse(raw) : {};
    overrides[itemId] = { ...overrides[itemId], isAvailable };
    localStorage.setItem(STORAGE_KEYS.MENU_OVERRIDE, JSON.stringify(overrides));
    return true;
  } catch (err) {
    console.error('Local item override failed:', err);
    return false;
  }
}

export async function updateMenuItemPrice(itemId: string, newPrice: number): Promise<boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU_OVERRIDE);
    const overrides: Record<string, Partial<MenuItem>> = raw ? JSON.parse(raw) : {};
    overrides[itemId] = { ...overrides[itemId], basePrice: newPrice };
    localStorage.setItem(STORAGE_KEYS.MENU_OVERRIDE, JSON.stringify(overrides));
    return true;
  } catch (err) {
    console.error('Local price override failed:', err);
    return false;
  }
}

// ====================================================
// CUSTOMER PROFILE & ADDRESSES
// ====================================================

export async function loadCustomerProfile(phone?: string): Promise<CustomerProfile | null> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const profile = JSON.parse(raw) as CustomerProfile;
      if (!phone || profile.phone === phone) {
        return profile;
      }
    }
  } catch (err) {
    console.error('Failed reading local profile', err);
  }
  return null;
}

export async function saveCustomerProfile(profile: CustomerProfile): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    return true;
  } catch (err) {
    console.error('Failed saving profile locally', err);
    return false;
  }
}

// ====================================================
// ORDERS & REAL-TIME ADMIN ORDER DASHBOARD
// ====================================================

export async function saveOrder(order: OrderRecord): Promise<boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const existingOrders: OrderRecord[] = raw ? JSON.parse(raw) : [];
    const updated = [order, ...existingOrders.filter(o => o.id !== order.id)];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed saving order locally', err);
    return false;
  }
}

export async function fetchCustomerOrders(phone?: string): Promise<OrderRecord[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) {
      const orders = JSON.parse(raw) as OrderRecord[];
      if (!phone) return orders;
      return orders.filter(o => o.customerPhone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
    }
  } catch (err) {
    console.error('Failed reading local orders', err);
  }
  return [];
}

export async function fetchAllOrdersForAdmin(): Promise<OrderRecord[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed reading admin orders', err);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) {
      const orders = JSON.parse(raw) as OrderRecord[];
      const updated = orders.map(o => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      return true;
    }
  } catch (err) {
    console.error('Failed to update local order status', err);
  }
  return false;
}
