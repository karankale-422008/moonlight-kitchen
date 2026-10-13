import React, { useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  LogOut, 
  Home, 
  Briefcase 
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';

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
  const city = 'Delivery City';
  const pincode = '400001';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">My Account &amp; Addresses</h2>
              <p className="text-xs text-slate-500">Manage delivery locations and profile details</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Personal Info Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Personal Information
              </h3>
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Phone: +91 {profile.phone}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Save Changes
            </button>
          </form>

          {/* Saved Addresses Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Saved Delivery Addresses</span>
              </h3>
              {!showAddAddress && (
                <button
                  type="button"
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-1 text-xs text-orange-600 hover:underline font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
              <form onSubmit={handleCreateAddress} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">New Address Details</span>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        tag === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
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
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street / Road *"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Area / Locality *"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Set as default delivery address</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
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
                      ? 'bg-orange-50/50 border-orange-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-900">
                        {addr.tag === 'Home' ? <Home className="w-3.5 h-3.5 text-orange-600" /> : <Briefcase className="w-3.5 h-3.5 text-slate-600" />}
                        {addr.tag}
                      </span>
                      {addr.isDefault && (
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
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
                        className="text-[11px] text-slate-500 hover:text-orange-600 font-medium px-2 py-1"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
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

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              signOut();
              setIsProfileModalOpen(false);
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
