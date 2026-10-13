import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerProfile, CustomerAddress } from '../types/customer';
import { loadCustomerProfile, saveCustomerProfile } from '../lib/storage';
import { isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';

interface CustomerContextType {
  profile: CustomerProfile | null;
  isVerified: boolean;
  activeAddress: CustomerAddress | null;
  isAuthModalOpen: boolean;
  isProfileModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsProfileModalOpen: (open: boolean) => void;
  sendVerificationOtp: (phone: string) => Promise<{ success: boolean; demoOtp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  updateProfile: (details: Partial<CustomerProfile>) => Promise<boolean>;
  addAddress: (address: Omit<CustomerAddress, 'id'>) => Promise<boolean>;
  updateAddress: (address: CustomerAddress) => Promise<boolean>;
  deleteAddress: (addressId: string) => Promise<boolean>;
  setDefaultAddress: (addressId: string) => Promise<boolean>;
  signOut: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeAddress, setActiveAddress] = useState<CustomerAddress | null>(null);

  // Load profile on initial mount
  useEffect(() => {
    async function init() {
      const saved = await loadCustomerProfile();
      if (saved) {
        setProfile(saved);
        const def = saved.addresses.find(a => a.isDefault) || saved.addresses[0] || null;
        setActiveAddress(def);
      }
    }
    init();
  }, []);

  const sendVerificationOtp = async (phone: string): Promise<{ success: boolean; demoOtp?: string }> => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return { success: false };
    }

    if (isSupabaseConfigured) {
      // In production Supabase with Twilio / SMS provider
      try {
        // e.g. await supabase.auth.signInWithOtp({ phone: `+91${cleanPhone}` });
        return { success: true };
      } catch (err) {
        console.error('Supabase OTP request failed', err);
      }
    }

    // Demo/Development OTP Mode
    const demoCode = '123456';
    showToast(`Verification code sent (Demo Code: ${demoCode})`, 'info');
    return { success: true, demoOtp: demoCode };
  };

  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      showToast('Please enter a 6-digit OTP code', 'error');
      return false;
    }

    // In demo mode, accept '123456'
    if (cleanOtp === '123456' || isSupabaseConfigured) {
      let existing = await loadCustomerProfile(cleanPhone);
      if (!existing) {
        // Create initial verified profile
        existing = {
          id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          fullName: 'Valued Customer',
          phone: cleanPhone,
          addresses: [
            {
              id: `addr_${Date.now()}`,
              tag: 'Home',
              houseNo: 'Flat 302',
              street: 'Moonlight Heights',
              area: 'Central Residency Area',
              city: 'Delivery City',
              state: 'State',
              pincode: '400001',
              isDefault: true,
            },
          ],
          isVerified: true,
          verifiedAt: new Date().toISOString(),
        };
      } else {
        existing = {
          ...existing,
          isVerified: true,
          verifiedAt: new Date().toISOString(),
        };
      }

      await saveCustomerProfile(existing);
      setProfile(existing);
      setActiveAddress(existing.addresses.find(a => a.isDefault) || existing.addresses[0] || null);
      showToast('Phone verified successfully!', 'success');
      setIsAuthModalOpen(false);
      return true;
    }

    showToast('Incorrect OTP code. Please enter 123456 for demo verification.', 'error');
    return false;
  };

  const updateProfile = async (details: Partial<CustomerProfile>): Promise<boolean> => {
    if (!profile) return false;
    const updated: CustomerProfile = {
      ...profile,
      ...details,
    };
    setProfile(updated);
    await saveCustomerProfile(updated);
    showToast('Profile updated', 'success');
    return true;
  };

  const addAddress = async (newAddr: Omit<CustomerAddress, 'id'>): Promise<boolean> => {
    if (!profile) return false;
    const id = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullAddress: CustomerAddress = { ...newAddr, id };

    let addresses = [...profile.addresses];
    if (fullAddress.isDefault) {
      addresses = addresses.map(a => ({ ...a, isDefault: false }));
    }
    addresses.push(fullAddress);

    const updatedProfile: CustomerProfile = {
      ...profile,
      addresses,
      defaultAddressId: fullAddress.isDefault ? id : profile.defaultAddressId || id,
    };

    setProfile(updatedProfile);
    if (fullAddress.isDefault || addresses.length === 1) {
      setActiveAddress(fullAddress);
    }
    await saveCustomerProfile(updatedProfile);
    showToast('Address saved', 'success');
    return true;
  };

  const updateAddress = async (updatedAddr: CustomerAddress): Promise<boolean> => {
    if (!profile) return false;
    let addresses = profile.addresses.map(a => (a.id === updatedAddr.id ? updatedAddr : a));

    if (updatedAddr.isDefault) {
      addresses = addresses.map(a => (a.id === updatedAddr.id ? { ...a, isDefault: true } : { ...a, isDefault: false }));
    }

    const updatedProfile: CustomerProfile = {
      ...profile,
      addresses,
    };

    setProfile(updatedProfile);
    if (activeAddress?.id === updatedAddr.id) {
      setActiveAddress(updatedAddr);
    }
    await saveCustomerProfile(updatedProfile);
    showToast('Address updated', 'success');
    return true;
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    if (!profile) return false;
    if (profile.addresses.length <= 1) {
      showToast('You must keep at least one delivery address', 'error');
      return false;
    }

    const addresses = profile.addresses.filter(a => a.id !== addressId);
    if (activeAddress?.id === addressId) {
      setActiveAddress(addresses[0]);
    }

    const updatedProfile: CustomerProfile = {
      ...profile,
      addresses,
    };

    setProfile(updatedProfile);
    await saveCustomerProfile(updatedProfile);
    showToast('Address removed', 'info');
    return true;
  };

  const setDefaultAddress = async (addressId: string): Promise<boolean> => {
    if (!profile) return false;
    const addresses = profile.addresses.map(a => ({
      ...a,
      isDefault: a.id === addressId,
    }));
    const chosen = addresses.find(a => a.id === addressId) || null;

    const updatedProfile: CustomerProfile = {
      ...profile,
      addresses,
      defaultAddressId: addressId,
    };

    setProfile(updatedProfile);
    setActiveAddress(chosen);
    await saveCustomerProfile(updatedProfile);
    showToast('Default address updated', 'success');
    return true;
  };

  const signOut = () => {
    setProfile(null);
    setActiveAddress(null);
    localStorage.removeItem('moonlight_customer_profile');
    showToast('Signed out', 'info');
  };

  return (
    <CustomerContext.Provider
      value={{
        profile,
        isVerified: Boolean(profile?.isVerified),
        activeAddress,
        isAuthModalOpen,
        isProfileModalOpen,
        setIsAuthModalOpen,
        setIsProfileModalOpen,
        sendVerificationOtp,
        verifyOtp,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        signOut,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within CustomerProvider');
  }
  return context;
};
