export interface CustomerAddress {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  houseNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  addresses: CustomerAddress[];
  defaultAddressId?: string;
  isVerified: boolean;
  verifiedAt?: string;
}
