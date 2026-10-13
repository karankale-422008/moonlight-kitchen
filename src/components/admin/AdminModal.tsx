import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  TrendingUp, 
  ShoppingBag, 
  Coffee, 
  Edit3, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../config/restaurant';
import { useOrder } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { MenuItem } from '../../types/menu';
import { OrderStatus } from '../../types/order';
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

  const filteredOrders = allOrders.filter(o => {
    if (selectedStatusFilter === 'all') return true;
    return o.status === selectedStatusFilter;
  });

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.pricing.finalTotal, 0);
  const totalOrdersCount = allOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const awaitingCount = allOrders.filter(o => o.status === 'Awaiting Kitchen Confirmation').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Kitchen Admin Portal</h2>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Authorized
                </span>
              </div>
              <p className="text-xs text-slate-500">Live order management, stock availability &amp; pricing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Screen */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-sm mx-auto text-center space-y-4 my-auto">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-500">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Enter Owner Passcode</h3>
              <p className="text-xs text-slate-500 mt-1">
                Owner dashboard access (Passcode: moonlight2026)
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                placeholder="Passcode: moonlight2026"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                autoFocus
                className="w-full text-center px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders ({allOrders.length})</span>
                  {awaitingCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {awaitingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('menu')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'menu'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Coffee className="w-4 h-4" />
                  <span>Menu &amp; Prices</span>
                </button>

                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'stats'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
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
                className="p-2 text-slate-500 hover:text-slate-900"
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                          selectedStatusFilter === f.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">
                      No orders found under this status.
                    </div>
                  ) : (
                    filteredOrders.map(order => (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-extrabold text-slate-900">
                                {order.orderReference}
                              </span>
                              <span className="text-xs text-slate-400">• {order.createdAt}</span>
                            </div>
                            <div className="text-xs text-slate-700 mt-0.5">
                              Customer: <strong>{order.customerName}</strong> ({order.customerPhone})
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Status:</span>
                            <select
                              value={order.status}
                              onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                              className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-orange-500"
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

                        <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-slate-700">
                              <span>
                                {it.quantity}x {it.name} {it.selectedVariant ? `(${it.selectedVariant.name})` : ''}
                              </span>
                              <span className="font-semibold">{formatINR(it.unitPrice * it.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 gap-1">
                          <span>
                            Delivery: {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}, {order.deliveryAddress.area}
                          </span>
                          <span className="text-orange-600 font-extrabold">
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
                  <p className="text-xs text-slate-500">
                    Control item stock and live prices directly:
                  </p>

                  <div className="space-y-2">
                    {menuItems.map(item => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {item.name}
                            </h4>
                            <span className="text-[11px] text-slate-500 uppercase font-medium">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {editingPriceItemId === item.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={tempPrice}
                                onChange={e => setTempPrice(Number(e.target.value))}
                                className="w-20 px-2 py-1 rounded bg-white border border-orange-500 text-xs text-slate-900 font-bold"
                              />
                              <button
                                onClick={() => handleSavePrice(item.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-bold"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">
                                {formatINR(item.basePrice)}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingPriceItemId(item.id);
                                  setTempPrice(item.basePrice);
                                }}
                                className="p-1 text-slate-400 hover:text-orange-600"
                                title="Edit price"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                              item.isAvailable
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
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

              {/* TAB 3: STATS */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-xs text-slate-500">Total Recorded Orders</span>
                      <div className="text-2xl font-black text-slate-900">{totalOrdersCount}</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-xs text-slate-500">Gross Revenue</span>
                      <div className="text-2xl font-black text-orange-600">{formatINR(totalRevenue)}</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-xs text-slate-500">Average Order Value (AOV)</span>
                      <div className="text-2xl font-black text-slate-900">{formatINR(avgOrderValue)}</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Restaurant Operational Settings
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                      <div>
                        WhatsApp Line:{' '}
                        <strong className="text-slate-900">{RESTAURANT_CONFIG.displayPhone}</strong>
                      </div>
                      <div>
                        Free Delivery Threshold:{' '}
                        <strong className="text-slate-900">₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</strong>
                      </div>
                      <div>
                        Operating Hours:{' '}
                        <strong className="text-slate-900">{RESTAURANT_CONFIG.operatingHours}</strong>
                      </div>
                      <div>
                        Delivery Fee (&lt;₹299):{' '}
                        <strong className="text-slate-900">₹{RESTAURANT_CONFIG.standardDeliveryFee}</strong>
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
