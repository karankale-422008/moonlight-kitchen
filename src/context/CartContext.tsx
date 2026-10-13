import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, PricingSummary } from '../types/cart';
import { MenuItem, ItemVariant, ItemAddon } from '../types/menu';
import { calculatePricing, calculateCartItemPrice } from '../lib/pricing';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  pricing: PricingSummary;
  couponCode: string | null;
  isCartOpen: boolean;
  totalItemCount: number;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: MenuItem, variant?: ItemVariant, addons?: ItemAddon[], instructions?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getItemQuantity: (menuItemId: string) => number;
}

const CART_STORAGE_KEY = 'moonlight_kitchen_cart';
const COUPON_STORAGE_KEY = 'moonlight_kitchen_coupon';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState<string | null>(() => {
    try {
      return localStorage.getItem(COUPON_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to sync cart to storage:', err);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (couponCode) {
        localStorage.setItem(COUPON_STORAGE_KEY, couponCode);
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Failed to sync coupon:', err);
    }
  }, [couponCode]);

  const pricing = useMemo(() => {
    return calculatePricing(items, couponCode || undefined);
  }, [items, couponCode]);

  const totalItemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getItemQuantity = (menuItemId: string): number => {
    return items
      .filter(item => item.menuItemId === menuItemId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const addItem = (
    item: MenuItem,
    variant?: ItemVariant,
    addons: ItemAddon[] = [],
    instructions?: string
  ) => {
    if (!item.isAvailable) {
      showToast(`${item.name} is currently out of stock`, 'error');
      return;
    }

    // Generate unique composite key
    const variantKey = variant ? variant.id : 'default';
    const addonsKey = addons.map(a => a.id).sort().join('-');
    const cartItemId = `${item.id}_${variantKey}_${addonsKey}`;

    const unitPrice = calculateCartItemPrice(item.basePrice, variant?.price, addons);

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => i.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          menuItemId: item.id,
          name: item.name,
          image: item.image,
          dietary: item.dietary,
          selectedVariant: variant,
          selectedAddons: addons.length > 0 ? addons : undefined,
          unitPrice,
          quantity: 1,
          specialInstructions: instructions,
        };
        return [...prevItems, newItem];
      }
    });

    const displayName = variant ? `${item.name} (${variant.name})` : item.name;
    showToast(`Added ${displayName} to basket`, 'success');
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems(prevItems => {
      return prevItems
        .map(item => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems(prevItems => {
      const removed = prevItems.find(i => i.id === cartItemId);
      if (removed) {
        showToast(`Removed ${removed.name} from basket`, 'info');
      }
      return prevItems.filter(i => i.id !== cartItemId);
    });
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(null);
    showToast('Basket cleared', 'info');
  };

  const applyCoupon = (code: string): boolean => {
    const formatted = code.trim().toUpperCase();
    if (formatted === 'MOONLIGHT10') {
      if (pricing.subtotal < 199) {
        showToast('MOONLIGHT10 requires minimum order of ₹199', 'error');
        return false;
      }
      setCouponCode('MOONLIGHT10');
      showToast('Coupon MOONLIGHT10 applied! 10% discount', 'success');
      return true;
    } else if (formatted === 'MOONLIGHT50') {
      if (pricing.subtotal < 399) {
        showToast('MOONLIGHT50 requires minimum order of ₹399', 'error');
        return false;
      }
      setCouponCode('MOONLIGHT50');
      showToast('Coupon MOONLIGHT50 applied! Flat ₹50 off', 'success');
      return true;
    } else if (formatted === 'WELCOME20') {
      if (pricing.subtotal < 149) {
        showToast('WELCOME20 requires minimum order of ₹149', 'error');
        return false;
      }
      setCouponCode('WELCOME20');
      showToast('Coupon WELCOME20 applied! Flat ₹20 off', 'success');
      return true;
    } else {
      showToast('Invalid coupon code. Try MOONLIGHT10', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    showToast('Coupon removed', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        pricing,
        couponCode,
        isCartOpen,
        totalItemCount,
        setIsCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
