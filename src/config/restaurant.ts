export interface RestaurantConfig {
  name: string;
  tagline: string;
  whatsappNumber: string; // digits only with country code, e.g. 917666445477
  displayPhone: string;
  currency: string;
  currencySymbol: string;
  freeDeliveryThreshold: number; // in INR
  standardDeliveryFee: number; // in INR
  packagingFee: number; // in INR
  taxRate: number; // e.g. 0.05 for 5% or 0
  minOrderAmount: number;
  operatingHours: string;
  isOpen: boolean;
  address: string;
  city: string;
  zomatoUrl?: string;
  adminPasscode: string; // For protected admin dashboard verification
}

export const RESTAURANT_CONFIG: RestaurantConfig = {
  name: "Moonlight Kitchen",
  tagline: "GOOD FOOD • BRIGHT MOOD",
  whatsappNumber: "917666445477",
  displayPhone: "+91 76664 45477",
  currency: "INR",
  currencySymbol: "₹",
  freeDeliveryThreshold: 299,
  standardDeliveryFee: 30,
  packagingFee: 0,
  taxRate: 0, // Zero extra tax or included in menu prices
  minOrderAmount: 49,
  operatingHours: "11:00 AM – 11:30 PM (Daily)",
  isOpen: true,
  address: "Shop 4, Ground Floor, Moonlight Kitchen, Near Main Circle",
  city: "City Delivery Zone",
  zomatoUrl: "https://www.zomato.com",
  adminPasscode: "moonlight2026",
};
