import { OrderRecord } from '../types/order';
import { RESTAURANT_CONFIG } from '../config/restaurant';

export function generateWhatsAppMessage(order: OrderRecord): string {
  const lines: string[] = [];

  lines.push("Hello Moonlight Kitchen! I would like to place an order.\n");
  lines.push("ORDER REQUEST — MOONLIGHT KITCHEN\n");
  lines.push(`Order Reference: ${order.orderReference}`);
  lines.push(`Date and Time: ${order.createdAt}\n`);

  lines.push("CUSTOMER DETAILS");
  lines.push(`Name: ${order.customerName}`);
  lines.push(`Phone: ${order.customerPhone}`);
  
  const addr = order.deliveryAddress;
  const addressParts = [
    addr.houseNo,
    addr.street,
    addr.area,
    addr.city,
    addr.state,
    addr.pincode ? `PIN: ${addr.pincode}` : ''
  ].filter(Boolean).join(', ');
  
  lines.push(`Delivery Address: ${addressParts}`);
  if (addr.landmark) {
    lines.push(`Landmark: ${addr.landmark}`);
  }
  if (order.deliveryInstructions || addr.deliveryInstructions) {
    lines.push(`Delivery Instructions: ${order.deliveryInstructions || addr.deliveryInstructions}`);
  }
  lines.push('');

  lines.push("ORDER ITEMS\n");
  order.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name}`);
    if (item.selectedVariant) {
      lines.push(`   Variant: ${item.selectedVariant.name}`);
    }
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      lines.push(`   Add-ons: ${item.selectedAddons.map(a => a.name).join(', ')}`);
    }
    lines.push(`   Quantity: ${item.quantity}`);
    lines.push(`   Unit Price: ₹${item.unitPrice}`);
    lines.push(`   Line Total: ₹${item.unitPrice * item.quantity}\n`);
  });

  lines.push("BILL SUMMARY");
  lines.push(`Item Subtotal: ₹${order.pricing.subtotal}`);
  if (order.pricing.packagingCharge > 0) {
    lines.push(`Packaging: ₹${order.pricing.packagingCharge}`);
  }
  lines.push(`Delivery: ${order.pricing.deliveryCharge === 0 ? 'FREE' : `₹${order.pricing.deliveryCharge}`}`);
  if (order.pricing.tax > 0) {
    lines.push(`Tax: ₹${order.pricing.tax}`);
  }
  if (order.pricing.discount > 0) {
    lines.push(`Discount: -₹${order.pricing.discount}${order.pricing.couponCode ? ` (${order.pricing.couponCode})` : ''}`);
  }
  lines.push(`TOTAL: ₹${order.pricing.finalTotal}\n`);

  lines.push(`Payment Preference: ${order.paymentPreference}\n`);
  lines.push("Please confirm item availability, the final amount, and the expected delivery time.\n");
  lines.push("Thank you!");

  return lines.join('\n');
}

export function getWhatsAppOrderUrl(order: OrderRecord): string {
  const message = order.whatsappMessage || generateWhatsAppMessage(order);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${RESTAURANT_CONFIG.whatsappNumber}?text=${encoded}`;
}
