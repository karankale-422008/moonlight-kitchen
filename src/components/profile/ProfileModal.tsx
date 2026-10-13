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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200 text-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">My Account &amp; Addresses</h2>
              <p className="text-xs text-gray-400">Manage delivery locations and profile details</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Personal Info Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Profile Details
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified: +91 {profile.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-bold text-gray-200 transition-colors"
            >
              Update Profile
            </button>
          </form>

          {/* Saved Addresses Section */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Saved Delivery Addresses
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Saved addresses will be automatically selected during checkout
                </p>
              </div>

              {!showAddAddress && (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
              <form onSubmit={handleCreateAddress} className="p-4 rounded-2xl bg-gray-800/80 border border-gray-700 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                  <span className="text-xs font-bold text-gray-200">New Address</span>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>

                {/* Tag Selection */}
                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors border ${
                        tag === t
                          ? 'bg-amber-500 border-amber-500 text-gray-900'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Flat / House / Building"
                    value={houseNo}
                    onChange={e => setHouseNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street / Road"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Area / Locality"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={e => setIsDefault(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Set as default address</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs shadow-md transition-colors"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards List */}
            <div className="space-y-2.5">
              {profile.addresses.length === 0 ? (
                <div className="p-6 rounded-2xl bg-gray-800/40 border border-gray-800 text-center text-xs text-gray-500">
                  No saved delivery addresses yet. Add one for quick 1-click checkout!
                </div>
              ) : (
                profile.addresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      addr.isDefault
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-gray-800/60 border-gray-700/80 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-gray-800 text-amber-400 mt-0.5">
                        {addr.tag === 'Home' ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{addr.tag}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-amber-500 text-gray-900 font-black px-1.5 py-0.2 rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {addr.houseNo}, {addr.street}, {addr.area}
                          {addr.landmark ? `, Near ${addr.landmark}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-xs text-gray-400 hover:text-amber-400 font-semibold"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="p-1 text-gray-500 hover:text-red-400"
                        title="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="pt-4 border-t border-gray-800 flex justify-end">
            <button
              onClick={() => {
                signOut();
                setIsProfileModalOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
