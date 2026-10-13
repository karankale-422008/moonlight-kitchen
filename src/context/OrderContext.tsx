import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { OrderRecord, OrderStatus, PaymentPreference } from '../types/order';
import { CartItem, PricingSummary } from '../types/cart';
import { CustomerAddress } from '../types/customer';
import { saveOrder, fetchCustomerOrders, fetchAllOrdersForAdmin, updateOrderStatus, fetchMenuItems } from '../lib/storage';
import { generateWhatsAppMessage, getWhatsAppOrderUrl } from '../lib/whatsapp';
import { useCustomer } from './CustomerContext';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

interface OrderContextType {
  orders: OrderRecord[];
  allOrders: OrderRecord[];
  activeOrder: OrderRecord | null;
  isLoading: boolean;
  isOrderHistoryOpen: boolean;
  isSuccessModalOpen: boolean;
  lastPlacedOrder: OrderRecord | null;
  setIsOrderHistoryOpen: (open: boolean) => void;
  setIsSuccessModalOpen: (open: boolean) => void;
  createOrder: (
    items: CartItem[],
    pricing: PricingSummary,
    deliveryAddress: CustomerAddress,
    paymentPreference: PaymentPreference,
    deliveryInstructions?: string
  ) => Promise<OrderRecord | null>;
  reorder: (pastOrder: OrderRecord) => Promise<boolean>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
  refreshAdminOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isVerified } = useCustomer();
  const { clearCart, addItem } = useCart();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [allOrders, setAllOrders] = useState<OrderRecord[]>([]);
  const [activeOrder, _setActiveOrder] = useState<OrderRecord | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Load customer orders whenever customer verification or phone changes
  const refreshOrders = useCallback(async () => {
    if (!profile?.phone) {
      setOrders([]);
      return;
    }
    setIsLoading(true);
    try {
      const fetched = await fetchCustomerOrders(profile.phone);
      setOrders(fetched);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.phone]);

  const refreshAdminOrders = useCallback(async () => {
    try {
      const fetched = await fetchAllOrdersForAdmin();
      setAllOrders(fetched);
    } catch (err) {
      console.error('Failed to load admin orders', err);
    }
  }, []);

  useEffect(() => {
    if (isVerified && profile?.phone) {
      refreshOrders();
    }
  }, [isVerified, profile?.phone, refreshOrders]);

  const createOrder = async (
    items: CartItem[],
    pricing: PricingSummary,
    deliveryAddress: CustomerAddress,
    paymentPreference: PaymentPreference,
    deliveryInstructions?: string
  ): Promise<OrderRecord | null> => {
    if (items.length === 0) {
      showToast('Cannot checkout an empty basket', 'error');
      return null;
    }

    // Generate unique human-readable order reference like MK-20261013-8492
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderRef = `MK-${dateStr}-${randomSuffix}`;
    const nowIso = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const newOrder: OrderRecord = {
      id: `ord_${Date.now()}_${randomSuffix}`,
      orderReference: orderRef,
      createdAt: nowIso,
      updatedAt: nowIso,
      customerId: profile?.id,
      customerName: profile?.fullName || 'Customer',
      customerPhone: profile?.phone || '',
      deliveryAddress,
      deliveryInstructions,
      items,
      pricing,
      paymentPreference,
      status: 'Awaiting Kitchen Confirmation',
      whatsappMessage: '',
      whatsappSubmissionStatus: 'opened',
    };

    // Generate accurate message template
    newOrder.whatsappMessage = generateWhatsAppMessage(newOrder);

    // Save to persistent database
    await saveOrder(newOrder);

    // Update in-memory state
    setLastPlacedOrder(newOrder);
    setOrders(prev => [newOrder, ...prev]);
    setAllOrders(prev => [newOrder, ...prev]);

    // Clear cart
    clearCart();

    // Show success modal
    setIsSuccessModalOpen(true);

    // Open WhatsApp
    const waUrl = getWhatsAppOrderUrl(newOrder);
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    showToast('Order saved! Opening WhatsApp...', 'success');
    return newOrder;
  };

  const reorder = async (pastOrder: OrderRecord): Promise<boolean> => {
    setIsLoading(true);
    try {
      const liveMenuItems = await fetchMenuItems();
      let unavailableCount = 0;
      let priceChangedCount = 0;

      for (const orderItem of pastOrder.items) {
        const liveItem = liveMenuItems.find(m => m.id === orderItem.menuItemId);
        if (!liveItem || !liveItem.isAvailable) {
          unavailableCount++;
          continue;
        }

        // Check if price changed
        const currentVariant = orderItem.selectedVariant
          ? liveItem.variants?.find(v => v.id === orderItem.selectedVariant?.id)
          : undefined;

        const expectedPrice = currentVariant ? currentVariant.price : liveItem.basePrice;
        if (expectedPrice !== orderItem.unitPrice) {
          priceChangedCount++;
        }

        // Add to cart with current fresh item definition
        addItem(liveItem, currentVariant, orderItem.selectedAddons, orderItem.specialInstructions);
      }

      if (unavailableCount > 0) {
        showToast(`${unavailableCount} item(s) from past order are currently out of stock`, 'info');
      } else if (priceChangedCount > 0) {
        showToast('Items added to basket with updated menu prices', 'info');
      } else {
        showToast('Items from previous order added to basket!', 'success');
      }

      return true;
    } catch (err) {
      console.error('Reorder error:', err);
      showToast('Failed to reorder items', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    const success = await updateOrderStatus(orderId, status);
    if (success) {
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
      setAllOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
      showToast(`Order status updated to ${status}`, 'success');
      return true;
    }
    showToast('Failed to update status', 'error');
    return false;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        allOrders,
        activeOrder,
        isLoading,
        isOrderHistoryOpen,
        isSuccessModalOpen,
        lastPlacedOrder,
        setIsOrderHistoryOpen,
        setIsSuccessModalOpen,
        createOrder,
        reorder,
        updateStatus,
        refreshOrders,
        refreshAdminOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
};
