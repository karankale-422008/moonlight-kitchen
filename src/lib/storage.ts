import { supabase, isSupabaseConfigured } from './supabase';
import { CustomerProfile, CustomerAddress } from '../types/customer';
import { OrderRecord, OrderStatus } from '../types/order';
import { MenuItem } from '../types/menu';
import { MENU_ITEMS } from '../data/menu';

const STORAGE_KEYS = {
  PROFILE: 'moonlight_customer_profile',
  ORDERS: 'moonlight_orders_history',
  MENU_OVERRIDE: 'moonlight_menu_override',
  CART: 'moonlight_cart_items',
};

// ====================================================
// MENU MANAGEMENT (Supports DB / Local Owner Overrides)
// ====================================================

export async function fetchMenuItems(): Promise<MenuItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          basePrice: d.base_price,
          description: d.description || '',
          image: d.image_url,
          dietary: d.dietary_type || 'veg',
          variants: d.variants || undefined,
          addons: d.addons || undefined,
          isAvailable: d.is_available,
          isBestseller: d.is_bestseller || false,
          comboItems: d.combo_items || undefined,
        }));
      }
    } catch (err) {
      console.warn('Falling back to local menu state:', err);
    }
  }

  // Fallback to local storage overrides or static MENU_ITEMS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU_OVERRIDE);
    if (raw) {
      const overrides: Record<string, Partial<MenuItem>> = JSON.parse(raw);
      return MENU_ITEMS.map(item => {
        if (overrides[item.id]) {
          return { ...item, ...overrides[item.id] };
        }
        return item;
      });
    }
  } catch (err) {
    console.error('Error reading local menu overrides', err);
  }

  return MENU_ITEMS;
}

export async function updateMenuItemAvailability(itemId: string, isAvailable: boolean): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
        .eq('id', itemId);
      if (!error) return true;
    } catch (err) {
      console.error('Supabase item update failed:', err);
    }
  }

  // Local storage override
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
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ base_price: newPrice, updated_at: new Date().toISOString() })
        .eq('id', itemId);
      if (!error) return true;
    } catch (err) {
      console.error('Supabase price update failed:', err);
    }
  }

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
  if (isSupabaseConfigured && supabase && phone) {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('verified_phone', phone)
        .maybeSingle();

      if (!error && profileData) {
        // Fetch addresses
        const { data: addressesData } = await supabase
          .from('customer_addresses')
          .select('*')
          .eq('customer_id', profileData.id);

        const addresses: CustomerAddress[] = (addressesData || []).map((a: any) => ({
          id: a.id,
          tag: a.tag || 'Home',
          houseNo: a.house_no || '',
          street: a.street || '',
          area: a.area || '',
          city: a.city || '',
          state: a.state || '',
          pincode: a.pincode || '',
          landmark: a.landmark || '',
          deliveryInstructions: a.delivery_instructions || '',
          isDefault: a.is_default || false,
        }));

        return {
          id: profileData.id,
          fullName: profileData.full_name || '',
          phone: profileData.verified_phone,
          email: profileData.email || '',
          addresses,
          defaultAddressId: addresses.find(a => a.isDefault)?.id || addresses[0]?.id,
          isVerified: true,
          verifiedAt: profileData.updated_at,
        };
      }
    } catch (err) {
      console.warn('Supabase profile load fallback:', err);
    }
  }

  // Local storage fallback
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
  // Always update local storage for immediate persistence
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed saving profile locally', err);
  }

  if (isSupabaseConfigured && supabase && profile.isVerified) {
    try {
      // Upsert profile
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          full_name: profile.fullName,
          verified_phone: profile.phone,
          email: profile.email || null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!profError && prof) {
        // Save addresses
        for (const addr of profile.addresses) {
          await supabase.from('customer_addresses').upsert({
            id: addr.id,
            customer_id: prof.id,
            tag: addr.tag,
            house_no: addr.houseNo,
            street: addr.street,
            area: addr.area,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            landmark: addr.landmark || null,
            delivery_instructions: addr.deliveryInstructions || null,
            is_default: addr.isDefault,
          });
        }
      }
    } catch (err) {
      console.warn('Supabase profile upsert error:', err);
    }
  }

  return true;
}

// ====================================================
// ORDERS & ORDER HISTORY
// ====================================================

export async function saveOrder(order: OrderRecord): Promise<boolean> {
  // 1. Save to local storage list
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const existingOrders: OrderRecord[] = raw ? JSON.parse(raw) : [];
    // Prepend new order
    const updated = [order, ...existingOrders.filter(o => o.id !== order.id)];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed saving order locally', err);
  }

  // 2. Save to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { error: orderError } = await supabase.from('orders').insert({
        id: order.id,
        order_reference: order.orderReference,
        customer_id: order.customerId || null,
        customer_name_snapshot: order.customerName,
        customer_phone_snapshot: order.customerPhone,
        delivery_address_snapshot: order.deliveryAddress,
        delivery_instructions: order.deliveryInstructions || null,
        subtotal: order.pricing.subtotal,
        additional_charges: order.pricing.deliveryCharge + order.pricing.packagingCharge,
        discount: order.pricing.discount,
        total: order.pricing.finalTotal,
        payment_preference: order.paymentPreference,
        status: order.status,
        whatsapp_submission_status: order.whatsappSubmissionStatus,
        created_at: order.createdAt,
      });

      if (!orderError) {
        // Insert order items
        const orderItemInserts = order.items.map(item => ({
          order_id: order.id,
          menu_item_id: item.menuItemId,
          item_name_snapshot: item.name,
          selected_variant: item.selectedVariant || null,
          selected_addons: item.selectedAddons || null,
          quantity: item.quantity,
          unit_price_snapshot: item.unitPrice,
          line_total: item.unitPrice * item.quantity,
        }));

        await supabase.from('order_items').insert(orderItemInserts);
      }
    } catch (err) {
      console.warn('Supabase saveOrder error:', err);
    }
  }

  return true;
}

export async function fetchCustomerOrders(phone?: string): Promise<OrderRecord[]> {
  // If Supabase configured and phone provided
  if (isSupabaseConfigured && supabase && phone) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('customer_phone_snapshot', phone)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((o: any) => ({
          id: o.id,
          orderReference: o.order_reference,
          createdAt: o.created_at,
          updatedAt: o.updated_at || o.created_at,
          customerId: o.customer_id,
          customerName: o.customer_name_snapshot,
          customerPhone: o.customer_phone_snapshot,
          deliveryAddress: o.delivery_address_snapshot,
          deliveryInstructions: o.delivery_instructions,
          items: (o.order_items || []).map((oi: any) => ({
            id: oi.id,
            menuItemId: oi.menu_item_id,
            name: oi.item_name_snapshot,
            image: '',
            dietary: 'veg',
            selectedVariant: oi.selected_variant,
            selectedAddons: oi.selected_addons,
            unitPrice: oi.unit_price_snapshot,
            quantity: oi.quantity,
          })),
          pricing: {
            subtotal: o.subtotal,
            packagingCharge: 0,
            deliveryCharge: o.additional_charges,
            tax: 0,
            discount: o.discount || 0,
            finalTotal: o.total,
            isFreeDelivery: o.additional_charges === 0,
            freeDeliveryThreshold: 299,
            amountNeededForFreeDelivery: 0,
          },
          paymentPreference: o.payment_preference || 'Cash on Delivery',
          status: o.status as OrderStatus,
          whatsappMessage: '',
          whatsappSubmissionStatus: o.whatsapp_submission_status || 'opened',
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch orders fallback:', err);
    }
  }

  // Local storage fallback
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
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((o: any) => ({
          id: o.id,
          orderReference: o.order_reference,
          createdAt: o.created_at,
          updatedAt: o.updated_at || o.created_at,
          customerId: o.customer_id,
          customerName: o.customer_name_snapshot,
          customerPhone: o.customer_phone_snapshot,
          deliveryAddress: o.delivery_address_snapshot,
          deliveryInstructions: o.delivery_instructions,
          items: (o.order_items || []).map((oi: any) => ({
            id: oi.id,
            menuItemId: oi.menu_item_id,
            name: oi.item_name_snapshot,
            image: '',
            dietary: 'veg',
            selectedVariant: oi.selected_variant,
            selectedAddons: oi.selected_addons,
            unitPrice: oi.unit_price_snapshot,
            quantity: oi.quantity,
          })),
          pricing: {
            subtotal: o.subtotal,
            packagingCharge: 0,
            deliveryCharge: o.additional_charges,
            tax: 0,
            discount: o.discount || 0,
            finalTotal: o.total,
            isFreeDelivery: o.additional_charges === 0,
            freeDeliveryThreshold: 299,
            amountNeededForFreeDelivery: 0,
          },
          paymentPreference: o.payment_preference || 'Cash on Delivery',
          status: o.status as OrderStatus,
          whatsappMessage: '',
          whatsappSubmissionStatus: o.whatsapp_submission_status || 'opened',
        }));
      }
    } catch (err) {
      console.warn('Admin fetch orders fallback:', err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (!error) return true;
    } catch (err) {
      console.error('Supabase update order status error:', err);
    }
  }

  // Local storage update
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) {
      const orders = JSON.parse(raw) as OrderRecord[];
      const updated = orders.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      return true;
    }
  } catch (err) {
    console.error('Failed to update local order status', err);
  }

  return false;
}
