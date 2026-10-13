import React, { useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck, 
  LogOut, 
  Home, 
  Briefcase 
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { CustomerAddress } from '../../types/customer';

export const ProfileModal: React.FC = () => {
  const { 
    profile, 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    updateProfile, 
    addAddress, 
    deleteAddress, 
    setDefaultAddress, 
    signOut 
  } = useCustomer();

  const [name, setName] = useState(profile?.fullName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [showAddAddress, setShowAddAddress] = useState(false);

  // New address state
  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Delivery City');
  const [pincode, setPincode] = useState('400001');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  if (!isProfileModalOpen || !profile) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ fullName: name, email });
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNo || !street || !area) return;

    await addAddress({
      tag,
      houseNo,
      street,
      area,
      city,
      state: 'State',
      pincode,
      landmark: landmark || undefined,
      isDefault,
    });

    setShowAddAddress(false);
    setHouseNo('');
    setStreet('');
    setArea('');
    setLandmark('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Customer Account</h2>
              <p className="text-xs text-slate-400">Personal details and delivery address book</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Personal Info Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Personal Information
              </h3>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Phone: +91 {profile.phone}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Save Profile Changes
            </button>
          </form>

          {/* Saved Addresses Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span>Saved Delivery Addresses</span>
              </h3>
              {!showAddAddress && (
                <button
                  type="button"
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-1 text-xs text-orange-400 hover:underline font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
              <form onSubmit={handleCreateAddress} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">New Address Details</span>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        tag === t ? 'bg-orange-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Flat / House / Building *"
                    value={houseNo}
                    onChange={e => setHouseNo(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street / Road *"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Area / Locality *"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-orange-500"
                  />
                  <span>Set as default delivery address</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs"
                >
                  Save Address
                </button>
              </form>
            )}

            {/* List of Addresses */}
            <div className="space-y-2.5">
              {profile.addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition-colors ${
                    addr.isDefault
                      ? 'bg-slate-800/80 border-orange-500/40'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-bold text-white">
                        {addr.tag === 'Home' ? <Home className="w-3.5 h-3.5 text-orange-400" /> : <Briefcase className="w-3.5 h-3.5 text-amber-400" />}
                        {addr.tag}
                      </span>
                      {addr.isDefault && (
                        <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">
                      {addr.houseNo}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                    </p>
                    {addr.landmark && (
                      <p className="text-[11px] text-slate-400">Landmark: {addr.landmark}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[11px] text-slate-400 hover:text-orange-400 px-2 py-1"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer / Sign Out */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              signOut();
              setIsProfileModalOpen(false);
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
