import { CartItem, PricingSummary } from './cart';
import { CustomerAddress } from './customer';

export type OrderStatus =
  | 'Awaiting Kitchen Confirmation'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentPreference = 'Cash on Delivery' | 'UPI on Delivery' | 'Pay on WhatsApp';

export interface OrderRecord {
  id: string; // Database ID or UUID
  orderReference: string; // Unique reference code e.g. "MK-20261013-4821"
  createdAt: string;
  updatedAt: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: CustomerAddress;
  deliveryInstructions?: string;
  items: CartItem[];
  pricing: PricingSummary;
  paymentPreference: PaymentPreference;
  status: OrderStatus;
  whatsappMessage: string;
  whatsappSubmissionStatus: 'opened' | 'pending' | 'manual_copied';
}
