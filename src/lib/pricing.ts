import { CartItem, PricingSummary } from '../types/cart';
import { RESTAURANT_CONFIG } from '../config/restaurant';

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function calculateCartItemPrice(
  basePrice: number,
  variantPrice?: number,
  addons: { price: number }[] = []
): number {
  const activePrice = variantPrice !== undefined ? variantPrice : basePrice;
  const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
  return activePrice + addonsTotal;
}

export function calculatePricing(
  items: CartItem[],
  couponCode?: string
): PricingSummary {
  // 1. Calculate subtotal in whole rupees
  const subtotal = items.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity;
  }, 0);

  // 2. Free delivery check
  const threshold = RESTAURANT_CONFIG.freeDeliveryThreshold;
  const isFreeDelivery = subtotal >= threshold || subtotal === 0;
  const deliveryCharge = items.length === 0 ? 0 : isFreeDelivery ? 0 : RESTAURANT_CONFIG.standardDeliveryFee;
  const amountNeededForFreeDelivery = Math.max(0, threshold - subtotal);

  // 3. Packaging fee
  const packagingCharge = items.length === 0 ? 0 : RESTAURANT_CONFIG.packagingFee;

  // 4. Tax
  const tax = Math.round(subtotal * RESTAURANT_CONFIG.taxRate);

  // 5. Discount calculation
  let discount = 0;
  if (couponCode) {
    const code = couponCode.trim().toUpperCase();
    if (code === 'MOONLIGHT10' && subtotal >= 199) {
      discount = Math.round(subtotal * 0.1); // 10% off
    } else if (code === 'MOONLIGHT50' && subtotal >= 399) {
      discount = 50; // flat ₹50 off
    } else if (code === 'WELCOME20' && subtotal >= 149) {
      discount = 20; // flat ₹20 off
    }
  }

  // 6. Final total
  const finalTotal = Math.max(0, subtotal + deliveryCharge + packagingCharge + tax - discount);

  return {
    subtotal,
    packagingCharge,
    deliveryCharge,
    tax,
    discount,
    couponCode,
    finalTotal,
    isFreeDelivery,
    freeDeliveryThreshold: threshold,
    amountNeededForFreeDelivery,
  };
}
