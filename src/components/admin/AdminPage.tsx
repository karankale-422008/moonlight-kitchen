import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  MessageSquare,
  RefreshCw,
  ArrowLeft,
  Edit3,
  Check,
  X,
  BarChart3,
  Users,
  IndianRupee,
  Package,
  Phone,
  Send,
  AlertCircle,
  ChevronRight,
  LogOut,
  Flame,
  Clock,
  Truck,
} from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../config/restaurant';
import { useOrder } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { MenuItem } from '../../types/menu';
import { OrderStatus } from '../../types/order';
import { fetchMenuItems, updateMenuItemAvailability, updateMenuItemPrice } from '../../lib/storage';
import { formatINR } from '../../lib/pricing';

interface AdminPageProps {
  onClose: () => void;
  onMenuUpdated: () => void;
}

type AdminTab = 'dashboard' | 'orders' | 'menu' | 'messages' | 'settings';

const STATUS_COLORS: Record<string, string> = {
  'Awaiting Kitchen Confirmation': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Confirmed': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Preparing': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Out for Delivery': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'Delivered': 'bg-green-500/10 text-green-400 border-green-500/30',
  'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/30',
};

export const AdminPage: React.FC<AdminPageProps> = ({ onClose, onMenuUpdated }) => {
  const { allOrders, refreshAdminOrders, updateStatus } = useOrder();
  const { showToast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState(0);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [menuSearchQ, setMenuSearchQ] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      refreshAdminOrders();
      loadMenu();
    }
  }, [isAuthenticated]);

  const loadMenu = async () => {
    const items = await fetchMenuItems();
    setMenuItems(items);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === RESTAURANT_CONFIG.adminPasscode) {
      setIsAuthenticated(true);
      showToast('Welcome to Admin Dashboard', 'success');
    } else {
      showToast('Incorrect passcode', 'error');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.isAvailable;
    const ok = await updateMenuItemAvailability(item.id, newStatus);
    if (ok) {
      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: newStatus } : m));
      onMenuUpdated();
      showToast(`${item.name} marked as ${newStatus ? 'In Stock' : 'Out of Stock'}`, 'info');
    }
  };

  const handleSavePrice = async (itemId: string) => {
    if (tempPrice <= 0) return;
    const ok = await updateMenuItemPrice(itemId, tempPrice);
    if (ok) {
      setMenuItems(prev => prev.map(m => m.id === itemId ? { ...m, basePrice: tempPrice } : m));
      setEditingPriceId(null);
      onMenuUpdated();
      showToast('Price updated', 'success');
    }
  };

  // Analytics
  const totalRevenue = allOrders.reduce((s, o) => s + o.pricing.finalTotal, 0);
  const totalOrders = allOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const pendingCount = allOrders.filter(o => o.status === 'Awaiting Kitchen Confirmation').length;
  const deliveredCount = allOrders.filter(o => o.status === 'Delivered').length;

  const popularItems = useMemo(() => {
    const freq: Record<string, { name: string; count: number; revenue: number }> = {};
    allOrders.forEach(order => {
      order.items.forEach(item => {
        if (!freq[item.menuItemId]) freq[item.menuItemId] = { name: item.name, count: 0, revenue: 0 };
        freq[item.menuItemId].count += item.quantity;
        freq[item.menuItemId].revenue += item.unitPrice * item.quantity;
      });
    });
    return Object.values(freq).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [allOrders]);

  const filteredOrders = allOrders.filter(o => statusFilter === 'all' || o.status === statusFilter);

  const uniqueCustomers = useMemo(() => {
    const seen = new Set<string>();
    return allOrders.filter(o => {
      if (seen.has(o.customerPhone)) return false;
      seen.add(o.customerPhone);
      return true;
    });
  }, [allOrders]);

  const filteredMenu = menuItems.filter(item =>
    !menuSearchQ || item.name.toLowerCase().includes(menuSearchQ.toLowerCase()) || item.category.toLowerCase().includes(menuSearchQ.toLowerCase())
  );

  const NAV_TABS: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" />, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'menu', label: 'Menu', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center p-4">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #F59E0B 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl">
            {/* Back button */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to menu
            </button>

            <div className="text-center space-y-4 mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Admin Portal</h1>
                <p className="text-sm text-gray-400 mt-1">Moonlight Kitchen Control Centre</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter admin passcode"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-xl transition-colors"
              >
                Access Dashboard
              </button>
            </form>

            <p className="text-center text-xs text-gray-600 mt-4">
              Demo passcode: <span className="text-amber-500/80 font-mono">moonlight2026</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">Moonlight</div>
              <div className="text-[10px] text-gray-500 font-medium">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              {tab.badge && (
                <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          <button
            onClick={() => { refreshAdminOrders(); loadMenu(); showToast('Data refreshed', 'info'); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
          <button
            onClick={() => { setIsAuthenticated(false); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2 px-4 py-3">
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white flex-1">Admin Dashboard</span>
          <button onClick={() => { refreshAdminOrders(); loadMenu(); }} className="p-1.5 rounded-lg text-gray-400 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar px-3 pb-2 gap-1.5">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-gray-900'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-6 mt-24 md:mt-0">

          {/* ═══════════════ DASHBOARD ═══════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-black text-white">Dashboard</h1>
                <p className="text-sm text-gray-500">Live overview of Moonlight Kitchen</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Orders', value: totalOrders, icon: <ShoppingBag className="w-5 h-5 text-amber-400" />, sub: `${deliveredCount} delivered` },
                  { label: 'Gross Revenue', value: formatINR(totalRevenue), icon: <IndianRupee className="w-5 h-5 text-green-400" />, sub: 'all time' },
                  { label: 'Avg Order Value', value: formatINR(avgOrderValue), icon: <TrendingUp className="w-5 h-5 text-blue-400" />, sub: 'per order' },
                  { label: 'Pending Orders', value: pendingCount, icon: <Clock className="w-5 h-5 text-orange-400" />, sub: 'need action', alert: pendingCount > 0 },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${stat.alert ? 'bg-orange-500/5 border-orange-500/30' : 'bg-gray-800/60 border-gray-700/80'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-gray-700/50">{stat.icon}</div>
                      {stat.alert && <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                    <div className="text-[11px] text-gray-600 mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Popular Items */}
              {popularItems.length > 0 && (
                <div className="bg-gray-800/60 border border-gray-700/80 rounded-xl p-5">
                  <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Top Performing Items
                  </h2>
                  <div className="space-y-3">
                    {popularItems.map((item, i) => {
                      const maxCount = popularItems[0]?.count || 1;
                      const pct = (item.count / maxCount) * 100;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs font-black text-gray-500 w-5">#{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-gray-200 truncate max-w-[60%]">{item.name}</span>
                              <span className="text-xs text-gray-400">{item.count} sold · {formatINR(item.revenue)}</span>
                            </div>
                            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              {allOrders.length > 0 && (
                <div className="bg-gray-800/60 border border-gray-700/80 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white">Recent Orders</h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {allOrders.slice(0, 4).map(order => (
                      <div key={order.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-700/40 border border-gray-700/40">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-200">{order.orderReference}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || 'text-gray-400 bg-gray-700 border-gray-600'}`}>
                              {order.status}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{order.customerName} · {order.items.length} items</span>
                        </div>
                        <span className="text-xs font-extrabold text-amber-400 shrink-0">{formatINR(order.pricing.finalTotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {allOrders.length === 0 && (
                <div className="text-center py-16 text-gray-600">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-40" />
                  <p className="text-sm">No orders yet. Orders placed via WhatsApp will appear here.</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ ORDERS ═══════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-white">Order Management</h1>
                  <p className="text-sm text-gray-500">{allOrders.length} total orders</p>
                </div>
                <button
                  onClick={() => { refreshAdminOrders(); showToast('Orders refreshed', 'info'); }}
                  className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Status filter */}
              <div className="flex flex-wrap gap-2">
                {['all', 'Awaiting Kitchen Confirmation', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      statusFilter === s
                        ? 'bg-amber-500 border-amber-500 text-gray-900'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {s === 'all' ? 'All' : s}
                  </button>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-600">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No orders in this status</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="bg-gray-800/60 border border-gray-700/80 rounded-xl p-4 space-y-3">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-white text-sm">{order.orderReference}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || 'text-gray-400 bg-gray-700 border-gray-600'}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.customerName} · {order.customerPhone} · {order.createdAt}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-gray-700 border border-gray-600 rounded-xl text-xs text-gray-200 px-3 py-2 font-bold focus:outline-none focus:border-amber-500"
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

                      {/* Items */}
                      <div className="bg-gray-700/40 rounded-xl p-3 space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-gray-300">
                            <span>{item.quantity}x {item.name}{item.selectedVariant ? ` (${item.selectedVariant.name})` : ''}</span>
                            <span className="font-semibold text-gray-200">{formatINR(item.unitPrice * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-gray-600" />
                          <span className="truncate">{order.deliveryAddress.houseNo}, {order.deliveryAddress.area}</span>
                        </div>
                        <span className="font-extrabold text-amber-400 text-sm">{formatINR(order.pricing.finalTotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ MENU ═══════════════ */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-black text-white">Menu Management</h1>
                <p className="text-sm text-gray-500">Toggle availability and edit prices live</p>
              </div>

              <input
                type="text"
                placeholder="Search items..."
                value={menuSearchQ}
                onChange={e => setMenuSearchQ(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500"
              />

              <div className="space-y-2">
                {filteredMenu.map(item => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                      item.isAvailable
                        ? 'bg-gray-800/60 border-gray-700/60'
                        : 'bg-gray-900/60 border-gray-800 opacity-60'
                    }`}
                  >
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-100 truncate">{item.name}</h4>
                      <span className="text-[11px] text-gray-500 uppercase font-medium">{item.category}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Price editing */}
                      {editingPriceId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={e => setTempPrice(Number(e.target.value))}
                            className="w-20 px-2 py-1.5 bg-gray-700 border border-amber-500 rounded-lg text-xs text-white font-bold focus:outline-none"
                          />
                          <button onClick={() => handleSavePrice(item.id)} className="p-1.5 rounded-lg bg-green-500 text-white">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingPriceId(null)} className="p-1.5 rounded-lg bg-gray-600 text-white">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingPriceId(item.id); setTempPrice(item.basePrice); }}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-amber-400 px-2 py-1.5 rounded-lg hover:bg-gray-700 transition-all"
                        >
                          <span>{formatINR(item.basePrice)}</span>
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}

                      {/* Toggle Availability */}
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          item.isAvailable
                            ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                        }`}
                      >
                        {item.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════ MESSAGES ═══════════════ */}
          {activeTab === 'messages' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-black text-white">Customer Messaging</h1>
                <p className="text-sm text-gray-500">Send WhatsApp broadcasts to customers who ordered</p>
              </div>

              {/* Broadcast Composer */}
              <div className="bg-gray-800/60 border border-gray-700/80 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-bold text-white">Compose Broadcast Message</h2>
                <textarea
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="Hello! Moonlight Kitchen here. We have exciting new items / offers just for you..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                />
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Opens individual WhatsApp chats — you must send each message manually</span>
                </div>
              </div>

              {/* Customer List */}
              <div className="bg-gray-800/60 border border-gray-700/80 rounded-xl p-5">
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Customers ({uniqueCustomers.length})
                </h2>

                {uniqueCustomers.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-8">No customer data yet. Orders will populate this list.</p>
                ) : (
                  <div className="space-y-2">
                    {uniqueCustomers.map((order, i) => {
                      const customerOrders = allOrders.filter(o => o.customerPhone === order.customerPhone);
                      const totalSpent = customerOrders.reduce((s, o) => s + o.pricing.finalTotal, 0);
                      const waMsg = broadcastMessage.trim()
                        ? `https://wa.me/${order.customerPhone.replace(/\D/g, '').replace(/^0/, '91')}?text=${encodeURIComponent(broadcastMessage)}`
                        : `https://wa.me/${order.customerPhone.replace(/\D/g, '').replace(/^0/, '91')}`;

                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-700/40 border border-gray-700/40">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-black text-amber-400">
                              {order.customerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-200 truncate">{order.customerName}</h4>
                            <p className="text-[11px] text-gray-500">
                              {order.customerPhone} · {customerOrders.length} order{customerOrders.length !== 1 ? 's' : ''} · {formatINR(totalSpent)} spent
                            </p>
                          </div>
                          <a
                            href={waMsg}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ SETTINGS ═══════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-black text-white">Restaurant Settings</h1>
                <p className="text-sm text-gray-500">Current configuration from restaurant.ts</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Restaurant Name', value: RESTAURANT_CONFIG.name },
                  { label: 'Tagline', value: RESTAURANT_CONFIG.tagline },
                  { label: 'WhatsApp Number', value: RESTAURANT_CONFIG.displayPhone },
                  { label: 'Operating Hours', value: RESTAURANT_CONFIG.operatingHours },
                  { label: 'Delivery Fee', value: `₹${RESTAURANT_CONFIG.standardDeliveryFee}` },
                  { label: 'Free Delivery Above', value: `₹${RESTAURANT_CONFIG.freeDeliveryThreshold}` },
                  { label: 'Min Order Amount', value: `₹${RESTAURANT_CONFIG.minOrderAmount}` },
                  { label: 'City', value: RESTAURANT_CONFIG.city },
                ].map((setting, i) => (
                  <div key={i} className="bg-gray-800/60 border border-gray-700/80 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">{setting.label}</p>
                    <p className="text-sm font-bold text-gray-100">{setting.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-300">To edit settings</p>
                  <p className="text-xs text-amber-400/70 mt-0.5">
                    Update the file <code className="font-mono bg-gray-800 px-1.5 py-0.5 rounded text-amber-300">src/config/restaurant.ts</code> and rebuild the app.
                    Future versions will support live editing from this panel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
