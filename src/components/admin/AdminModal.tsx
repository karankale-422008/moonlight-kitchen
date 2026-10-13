import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  TrendingUp, 
  ShoppingBag, 
  Coffee, 
  Clock, 
  CheckCircle2, 
  Edit3, 
  IndianRupee, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../config/restaurant';
import { useOrder } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { OrderRecord, OrderStatus } from '../../types/order';
import { MenuItem } from '../../types/menu';
import { fetchMenuItems, updateMenuItemAvailability, updateMenuItemPrice } from '../../lib/storage';
import { formatINR } from '../../lib/pricing';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMenuUpdated: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onMenuUpdated }) => {
  const { allOrders, refreshAdminOrders, updateStatus } = useOrder();
  const { showToast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'stats'>('orders');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refreshAdminOrders();
      loadMenu();
    }
  }, [isOpen, isAuthenticated, refreshAdminOrders]);

  if (!isOpen) return null;

  const loadMenu = async () => {
    const items = await fetchMenuItems();
    setMenuItems(items);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === RESTAURANT_CONFIG.adminPasscode) {
      setIsAuthenticated(true);
      showToast('Admin access granted', 'success');
      refreshAdminOrders();
      loadMenu();
    } else {
      showToast('Invalid owner passcode', 'error');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.isAvailable;
    const ok = await updateMenuItemAvailability(item.id, newStatus);
    if (ok) {
      setMenuItems(prev => prev.map(m => (m.id === item.id ? { ...m, isAvailable: newStatus } : m)));
      onMenuUpdated();
      showToast(`${item.name} is now ${newStatus ? 'IN STOCK' : 'OUT OF STOCK'}`, 'info');
    }
  };

  const handleSavePrice = async (itemId: string) => {
    if (tempPrice <= 0) return;
    const ok = await updateMenuItemPrice(itemId, tempPrice);
    if (ok) {
      setMenuItems(prev => prev.map(m => (m.id === itemId ? { ...m, basePrice: tempPrice } : m)));
      setEditingPriceItemId(null);
      onMenuUpdated();
      showToast('Price updated successfully', 'success');
    }
  };

  // Filter orders
  const filteredOrders = allOrders.filter(o => {
    if (selectedStatusFilter === 'all') return true;
    return o.status === selectedStatusFilter;
  });

  // Calculate stats
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.pricing.finalTotal, 0);
  const totalOrdersCount = allOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const awaitingCount = allOrders.filter(o => o.status === 'Awaiting Kitchen Confirmation').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Owner & Kitchen Portal</h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Authorized
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage orders, menu availability, prices, and kitchen operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Screen if not logged in */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-sm mx-auto text-center space-y-4 my-auto">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800 flex items-center justify-center text-slate-400">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Enter Owner Passcode</h3>
              <p className="text-xs text-slate-400 mt-1">
                Access is restricted to Moonlight Kitchen administration.
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                placeholder="Enter passcode (default: moonlight2026)"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                autoFocus
                className="w-full text-center px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/20"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Dashboard Navigation Tabs */}
            <div className="bg-slate-950 border-b border-slate-800 px-6 py-2 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-orange-500 text-slate-950'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders ({allOrders.length})</span>
                  {awaitingCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                      {awaitingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('menu')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'menu'
                      ? 'bg-orange-500 text-slate-950'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Coffee className="w-4 h-4" />
                  <span>Menu & Prices</span>
                </button>

                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'stats'
                      ? 'bg-orange-500 text-slate-950'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Performance</span>
                </button>
              </div>

              <button
                onClick={() => {
                  refreshAdminOrders();
                  loadMenu();
                  showToast('Refreshed data', 'info');
                }}
                className="p-2 text-slate-400 hover:text-white"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* TAB 1: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Status filter bar */}
                  <div className="flex flex-wrap items-center gap-2 pb-2">
                    {[
                      { id: 'all', label: 'All Orders' },
                      { id: 'Awaiting Kitchen Confirmation', label: 'Awaiting Confirmation' },
                      { id: 'Confirmed', label: 'Confirmed' },
                      { id: 'Preparing', label: 'Preparing' },
                      { id: 'Out for Delivery', label: 'Out for Delivery' },
                      { id: 'Delivered', label: 'Delivered' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedStatusFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          selectedStatusFilter === f.id
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm">
                      No orders found under this status.
                    </div>
                  ) : (
                    filteredOrders.map(order => (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-amber-400">
                                {order.orderReference}
                              </span>
                              <span className="text-xs text-slate-400">• {order.createdAt}</span>
                            </div>
                            <div className="text-xs text-slate-300 mt-0.5">
                              Customer: <strong>{order.customerName}</strong> ({order.customerPhone})
                            </div>
                          </div>

                          {/* Status Dropdown */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Status:</span>
                            <select
                              value={order.status}
                              onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-orange-500"
                            >
                              <option value="Awaiting Kitchen Confirmation">Awaiting Confirmation</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* Order breakdown */}
                        <div className="p-3 rounded-xl bg-slate-900/60 text-xs space-y-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-slate-300">
                              <span>
                                {it.quantity}x {it.name} {it.selectedVariant ? `(${it.selectedVariant.name})` : ''}
                              </span>
                              <span>{formatINR(it.unitPrice * it.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Address & Payment Preference */}
                        <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 gap-1">
                          <span>
                            Delivery to: {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}, {order.deliveryAddress.area}
                          </span>
                          <span className="text-orange-400 font-bold">
                            Total: {formatINR(order.pricing.finalTotal)} ({order.paymentPreference})
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: MENU & PRICES */}
              {activeTab === 'menu' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Toggle dish availability (in stock / out of stock) and adjust live prices directly:
                  </p>

                  <div className="space-y-2">
                    {menuItems.map(item => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 rounded-xl object-cover bg-slate-900 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {item.name}
                            </h4>
                            <span className="text-[11px] text-slate-400 uppercase">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        {/* Price & Edit */}
                        <div className="flex items-center gap-3 shrink-0">
                          {editingPriceItemId === item.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={tempPrice}
                                onChange={e => setTempPrice(Number(e.target.value))}
                                className="w-20 px-2 py-1 rounded bg-slate-900 border border-orange-500 text-xs text-white"
                              />
                              <button
                                onClick={() => handleSavePrice(item.id)}
                                className="px-2 py-1 rounded bg-emerald-600 text-white text-xs font-bold"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">
                                {formatINR(item.basePrice)}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingPriceItemId(item.id);
                                  setTempPrice(item.basePrice);
                                }}
                                className="p-1 text-slate-400 hover:text-orange-400"
                                title="Edit price"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* Toggle In Stock Button */}
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                              item.isAvailable
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-500/50 hover:bg-rose-900'
                            }`}
                          >
                            {item.isAvailable ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>In Stock</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Out of Stock</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: STATS & ANALYTICS */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400">Total Recorded Orders</span>
                      <div className="text-2xl font-black text-white">{totalOrdersCount}</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400">Total Gross Revenue</span>
                      <div className="text-2xl font-black text-orange-400">{formatINR(totalRevenue)}</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400">Average Order Value (AOV)</span>
                      <div className="text-2xl font-black text-amber-400">{formatINR(avgOrderValue)}</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Restaurant Operational Configuration
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                      <div>
                        WhatsApp Line:{' '}
                        <strong className="text-white">{RESTAURANT_CONFIG.displayPhone}</strong>
                      </div>
                      <div>
                        Free Delivery Threshold:{' '}
                        <strong className="text-white">₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</strong>
                      </div>
                      <div>
                        Operating Hours:{' '}
                        <strong className="text-white">{RESTAURANT_CONFIG.operatingHours}</strong>
                      </div>
                      <div>
                        Delivery Fee (&lt;₹299):{' '}
                        <strong className="text-white">₹{RESTAURANT_CONFIG.standardDeliveryFee}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
