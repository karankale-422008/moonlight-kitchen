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
  AlertCircle,
  ChevronRight,
  LogOut,
  Flame,
  Clock,
  Truck,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sliders,
  CheckCircle2,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../config/restaurant';
import { useOrder } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { MenuItem, DietaryType } from '../../types/menu';
import { OrderStatus } from '../../types/order';
import { BannerItem } from '../../types/banner';
import { RestaurantSettings } from '../../types/settings';
import { MENU_CATEGORIES } from '../../data/menu';
import {
  fetchMenuItems,
  updateMenuItemAvailability,
  updateMenuItemPrice,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  fetchBanners,
  saveBanners,
  addBanner,
  updateBanner,
  deleteBanner,
  DEFAULT_BANNERS,
  fetchRestaurantSettings,
  saveRestaurantSettings,
  DEFAULT_SETTINGS
} from '../../lib/storage';
import { formatINR } from '../../lib/pricing';

interface AdminPageProps {
  onClose: () => void;
  onMenuUpdated: () => void;
  onSettingsUpdated?: (settings: RestaurantSettings) => void;
  onBannersUpdated?: (banners: BannerItem[]) => void;
}

type AdminTab = 'dashboard' | 'orders' | 'menu' | 'banners' | 'settings' | 'messages';

const STATUS_COLORS: Record<string, string> = {
  'Awaiting Kitchen Confirmation': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Confirmed': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  'Preparing': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Out for Delivery': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Delivered': 'bg-green-500/15 text-green-400 border-green-500/30',
  'Cancelled': 'bg-red-500/15 text-red-400 border-red-500/30',
};

const PRESET_DISH_IMAGES = [
  { label: 'Artisanal Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=75' },
  { label: 'Gourmet Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=75' },
  { label: 'Grilled Sandwich', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=75' },
  { label: 'Loaded Fries', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=75' },
  { label: 'Royal Biryani', url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=75' },
  { label: 'Cheese Maggi', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=75' },
  { label: 'Cold Beverage / Shake', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=75' },
  { label: 'Combo Feast', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=75' },
];

export const AdminPage: React.FC<AdminPageProps> = ({
  onClose,
  onMenuUpdated,
  onSettingsUpdated,
  onBannersUpdated,
}) => {
  const { allOrders, refreshAdminOrders, updateStatus } = useOrder();
  const { showToast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('pizza');
  const [menuSearchQ, setMenuSearchQ] = useState('');

  // Add / Edit Dish Modal State
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'pizza',
    basePrice: 199,
    description: '',
    dietary: 'veg' as DietaryType,
    image: PRESET_DISH_IMAGES[0].url,
    isBestseller: false,
    isAvailable: true,
  });

  // Banners State
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    tag: '',
    imageUrl: PRESET_DISH_IMAGES[0].url,
    categoryLink: 'pizza',
    isActive: true,
  });

  // Settings State
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Orders State
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderSearchQ, setOrderSearchQ] = useState('');

  // Messaging State
  const [broadcastMessage, setBroadcastMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      refreshAdminOrders();
      loadAllAdminData();
    }
  }, [isAuthenticated]);

  const loadAllAdminData = async () => {
    const [loadedMenu, loadedBanners, loadedSettings] = await Promise.all([
      fetchMenuItems(),
      fetchBanners(),
      fetchRestaurantSettings(),
    ]);
    setMenuItems(loadedMenu);
    setBanners(loadedBanners);
    setSettings(loadedSettings);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === RESTAURANT_CONFIG.adminPasscode) {
      setIsAuthenticated(true);
      showToast('Welcome to Moonlight Kitchen Admin Panel', 'success');
    } else {
      showToast('Incorrect passcode. Use: moonlight2026', 'error');
    }
  };

  // ----------------------------------------------------
  // MENU OPERATIONS
  // ----------------------------------------------------
  const handleOpenAddDish = (categoryToPreset?: string) => {
    setEditingItem(null);
    setDishForm({
      name: '',
      category: categoryToPreset || selectedCategory || 'pizza',
      basePrice: 199,
      description: '',
      dietary: 'veg',
      image: PRESET_DISH_IMAGES[0].url,
      isBestseller: false,
      isAvailable: true,
    });
    setIsDishModalOpen(true);
  };

  const handleOpenEditDish = (item: MenuItem) => {
    setEditingItem(item);
    setDishForm({
      name: item.name,
      category: item.category,
      basePrice: item.basePrice,
      description: item.description,
      dietary: item.dietary,
      image: item.image,
      isBestseller: item.isBestseller || false,
      isAvailable: item.isAvailable,
    });
    setIsDishModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.name.trim() || dishForm.basePrice <= 0) {
      showToast('Please provide a valid dish name and price', 'error');
      return;
    }

    if (editingItem) {
      // Update existing item
      const updated: MenuItem = {
        ...editingItem,
        name: dishForm.name.trim(),
        category: dishForm.category,
        basePrice: Number(dishForm.basePrice),
        description: dishForm.description.trim(),
        dietary: dishForm.dietary,
        image: dishForm.image.trim(),
        isBestseller: dishForm.isBestseller,
        isAvailable: dishForm.isAvailable,
      };
      await updateMenuItem(updated);
      setMenuItems(prev => prev.map(m => (m.id === updated.id ? updated : m)));
      showToast(`Updated "${updated.name}" successfully`, 'success');
    } else {
      // Add new item
      const created = await addMenuItem({
        name: dishForm.name.trim(),
        category: dishForm.category,
        basePrice: Number(dishForm.basePrice),
        description: dishForm.description.trim(),
        dietary: dishForm.dietary,
        image: dishForm.image.trim(),
        isBestseller: dishForm.isBestseller,
        isAvailable: dishForm.isAvailable,
      });
      setMenuItems(prev => [created, ...prev]);
      showToast(`Added "${created.name}" to ${created.category}`, 'success');
    }

    setIsDishModalOpen(false);
    onMenuUpdated();
  };

  const handleDeleteDish = async (itemId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the menu?`)) {
      await deleteMenuItem(itemId);
      setMenuItems(prev => prev.filter(m => m.id !== itemId));
      onMenuUpdated();
      showToast(`Removed "${name}" from menu`, 'info');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.isAvailable;
    const ok = await updateMenuItemAvailability(item.id, newStatus);
    if (ok) {
      setMenuItems(prev => prev.map(m => (m.id === item.id ? { ...m, isAvailable: newStatus } : m)));
      onMenuUpdated();
      showToast(`${item.name} marked as ${newStatus ? 'In Stock' : 'Sold Out'}`, 'info');
    }
  };

  // ----------------------------------------------------
  // BANNER OPERATIONS
  // ----------------------------------------------------
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerForm({
      title: '',
      subtitle: '',
      tag: 'SPECIAL OFFER',
      imageUrl: PRESET_DISH_IMAGES[0].url,
      categoryLink: 'pizza',
      isActive: true,
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: BannerItem) => {
    setEditingBanner(b);
    setBannerForm({
      title: b.title,
      subtitle: b.subtitle,
      tag: b.tag,
      imageUrl: b.imageUrl,
      categoryLink: b.categoryLink || 'pizza',
      isActive: b.isActive,
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim() || !bannerForm.imageUrl.trim()) {
      showToast('Please provide a banner title and image URL', 'error');
      return;
    }

    if (editingBanner) {
      const updated: BannerItem = {
        ...editingBanner,
        title: bannerForm.title.trim(),
        subtitle: bannerForm.subtitle.trim(),
        tag: bannerForm.tag.trim(),
        imageUrl: bannerForm.imageUrl.trim(),
        categoryLink: bannerForm.categoryLink,
        isActive: bannerForm.isActive,
      };
      await updateBanner(updated);
      setBanners(prev => prev.map(b => (b.id === updated.id ? updated : b)));
      showToast('Banner slide updated', 'success');
      if (onBannersUpdated) onBannersUpdated(banners.map(b => (b.id === updated.id ? updated : b)));
    } else {
      const created = await addBanner({
        title: bannerForm.title.trim(),
        subtitle: bannerForm.subtitle.trim(),
        tag: bannerForm.tag.trim(),
        imageUrl: bannerForm.imageUrl.trim(),
        categoryLink: bannerForm.categoryLink,
        isActive: bannerForm.isActive,
      });
      const newBanners = [...banners, created];
      setBanners(newBanners);
      showToast('New banner added to slider', 'success');
      if (onBannersUpdated) onBannersUpdated(newBanners);
    }

    setIsBannerModalOpen(false);
  };

  const handleDeleteBanner = async (bannerId: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove the banner "${title}"?`)) {
      await deleteBanner(bannerId);
      const updated = banners.filter(b => b.id !== bannerId);
      setBanners(updated);
      showToast('Banner removed from slider', 'info');
      if (onBannersUpdated) onBannersUpdated(updated);
    }
  };

  const handleResetDefaultBanners = async () => {
    if (window.confirm('Reset banner slider to the default 5 images?')) {
      await saveBanners(DEFAULT_BANNERS);
      setBanners(DEFAULT_BANNERS);
      showToast('Reset to 5 default slider banners', 'success');
      if (onBannersUpdated) onBannersUpdated(DEFAULT_BANNERS);
    }
  };

  // ----------------------------------------------------
  // SETTINGS OPERATIONS
  // ----------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await saveRestaurantSettings(settings);
      showToast('Website details updated successfully!', 'success');
      if (onSettingsUpdated) onSettingsUpdated(settings);
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ----------------------------------------------------
  // ANALYTICS & COMPUTED VALUES
  // ----------------------------------------------------
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

  const filteredOrders = useMemo(() => {
    return allOrders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (orderSearchQ.trim()) {
        const q = orderSearchQ.toLowerCase();
        return (
          o.orderReference.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
        );
      }
      return true;
    });
  }, [allOrders, statusFilter, orderSearchQ]);

  const uniqueCustomers = useMemo(() => {
    const seen = new Set<string>();
    return allOrders.filter(o => {
      if (seen.has(o.customerPhone)) return false;
      seen.add(o.customerPhone);
      return true;
    });
  }, [allOrders]);

  // Categories list without 'all'
  const validCategories = useMemo(() => {
    return MENU_CATEGORIES.filter(c => c.id !== 'all');
  }, []);

  // Filtered menu for current category
  const categoryDishes = useMemo(() => {
    return menuItems.filter(item => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (menuSearchQ.trim()) {
        const q = menuSearchQ.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [menuItems, selectedCategory, menuSearchQ]);

  const NAV_TABS: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'orders', label: 'Live Orders', icon: <ShoppingBag className="w-4 h-4" />, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'menu', label: 'Menu & Categories', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'banners', label: 'Banner Slider', icon: <Sliders className="w-4 h-4" /> },
    { id: 'settings', label: 'Store Content', icon: <Settings className="w-4 h-4" /> },
    { id: 'messages', label: 'Customers', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B1120] flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm">
          <div className="bg-gray-900 border border-gray-700/80 rounded-3xl p-8 shadow-2xl text-gray-100">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Moonlight Kitchen
            </button>

            <div className="text-center space-y-3 mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-white">Kitchen Admin</h1>
              <p className="text-xs text-gray-400">Manage Orders, Categories, Dishes &amp; Banners</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter admin passcode"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-900/30"
              >
                Access Admin Portal
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-5">
              Default Passcode: <span className="text-amber-400 font-mono font-bold">moonlight2026</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ADMIN DASHBOARD MAIN VIEW
  // ----------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-[#0B1120] flex overflow-hidden text-gray-100 font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <span className="text-gray-950 font-black text-base">M</span>
            </div>
            <div>
              <div className="text-sm font-black text-white leading-tight">Moonlight Kitchen</div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Control Center</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-gray-950 shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/80'
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

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          <button
            onClick={() => {
              refreshAdminOrders();
              loadAllAdminData();
              showToast('Refreshed data from storage', 'info');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Data</span>
          </button>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-black text-white">Admin Portal</span>
          </div>
          <button
            onClick={() => {
              refreshAdminOrders();
              loadAllAdminData();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Horizontal Tab Pills */}
        <div className="flex overflow-x-auto no-scrollbar px-3 pb-2.5 gap-1.5">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-gray-950'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Admin View Content */}
      <main className="flex-1 overflow-y-auto pt-24 md:pt-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">

          {/* ==================================================== */}
          {/* TAB 1: 📊 DASHBOARD ANALYTICS                        */}
          {/* ==================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-black text-white">Live Business Overview</h1>
                  <p className="text-xs text-gray-400">Real-time performance analytics of Moonlight Kitchen</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>View {allOrders.length} Orders</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Orders', value: totalOrders, icon: <ShoppingBag className="w-5 h-5 text-amber-400" />, sub: `${deliveredCount} Delivered` },
                  { label: 'Gross Revenue', value: formatINR(totalRevenue), icon: <IndianRupee className="w-5 h-5 text-green-400" />, sub: 'All recorded orders' },
                  { label: 'Average Order Value', value: formatINR(avgOrderValue), icon: <TrendingUp className="w-5 h-5 text-blue-400" />, sub: 'Per customer order' },
                  { label: 'Pending Action', value: pendingCount, icon: <Clock className="w-5 h-5 text-orange-400" />, sub: 'Needs kitchen response', alert: pendingCount > 0 },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border ${
                      stat.alert
                        ? 'bg-orange-500/10 border-orange-500/40'
                        : 'bg-gray-900 border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-gray-800 text-gray-300">{stat.icon}</div>
                      {stat.alert && <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping" />}
                    </div>
                    <div className="text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-xs font-bold text-gray-400 mt-1">{stat.label}</div>
                    <div className="text-[11px] text-gray-500">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Popular Dishes */}
              {popularItems.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Top 5 Performing Dishes</span>
                  </h2>
                  <div className="space-y-3">
                    {popularItems.map((item, i) => {
                      const maxCount = popularItems[0]?.count || 1;
                      const pct = Math.round((item.count / maxCount) * 100);
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">#{i + 1} {item.name}</span>
                            <span className="text-amber-400 font-extrabold">{item.count} Sold • {formatINR(item.revenue)}</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: 🔔 LIVE ORDERS MANAGEMENT                     */}
          {/* ==================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-white">Live Customer Orders</h1>
                  <p className="text-xs text-gray-400">Orders placed on website appear here in real time</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search ref or customer..."
                      value={orderSearchQ}
                      onChange={e => setOrderSearchQ(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    onClick={() => { refreshAdminOrders(); showToast('Orders refreshed', 'info'); }}
                    className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {['all', 'Awaiting Kitchen Confirmation', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      statusFilter === s
                        ? 'bg-amber-500 border-amber-500 text-gray-950'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    {s === 'all' ? 'All Orders' : s}
                  </button>
                ))}
              </div>

              {/* Order List */}
              {filteredOrders.length === 0 ? (
                <div className="py-20 text-center rounded-2xl bg-gray-900 border border-gray-800">
                  <Package className="w-12 h-12 mx-auto text-gray-600 mb-2 opacity-50" />
                  <h3 className="text-sm font-bold text-gray-300">No Orders in this Status</h3>
                  <p className="text-xs text-gray-500 mt-1">Orders placed by customers will be recorded here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map(order => (
                    <div
                      key={order.id}
                      className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 hover:border-gray-700 transition-all shadow-md"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-white text-base">
                              {order.orderReference}
                            </span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || 'bg-gray-800 text-gray-300'}`}>
                              {order.status}
                            </span>
                            <span className="text-[11px] text-gray-400">• {order.createdAt}</span>
                          </div>
                          <p className="text-xs text-gray-300 mt-1">
                            Customer: <strong className="text-white font-bold">{order.customerName}</strong> ({order.customerPhone})
                          </p>
                        </div>

                        {/* Status Updater Dropdown */}
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-gray-400 uppercase">Status:</label>
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-gray-800 border border-gray-700 rounded-xl text-xs font-bold text-amber-400 px-3 py-2 focus:outline-none focus:border-amber-500"
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

                      {/* Items Ordered List */}
                      <div className="bg-gray-800/60 rounded-xl p-3.5 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-gray-200">
                            <span>
                              <strong className="text-amber-400">{item.quantity}x</strong> {item.name}
                              {item.selectedVariant && (
                                <span className="text-gray-400 text-[11px] ml-1">({item.selectedVariant.name})</span>
                              )}
                            </span>
                            <span className="font-bold text-white">{formatINR(item.unitPrice * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address & Bill */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-800 text-xs">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate">
                            {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}, {order.deliveryAddress.area}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">{order.paymentPreference}</span>
                          <span className="text-base font-black text-amber-400">{formatINR(order.pricing.finalTotal)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: 🍽️ MENU DIVIDED BY CATEGORIES + ADD DISH     */}
          {/* ==================================================== */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-white">Menu &amp; Categories</h1>
                  <p className="text-xs text-gray-400">Dishes are organized strictly into categories. Add, edit, or remove anytime.</p>
                </div>
                <button
                  onClick={() => handleOpenAddDish(selectedCategory)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-900/30 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Dish to {validCategories.find(c => c.id === selectedCategory)?.name || 'Category'}</span>
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 border-b border-gray-800">
                {validCategories.map(cat => {
                  const count = menuItems.filter(m => m.category === cat.id).length;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-gray-950 shadow-md'
                          : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected ? 'bg-gray-950/20 text-gray-950' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar for Current Category */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search dishes in ${validCategories.find(c => c.id === selectedCategory)?.name || 'category'}...`}
                  value={menuSearchQ}
                  onChange={e => setMenuSearchQ(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Dishes List */}
              <div className="space-y-3">
                {categoryDishes.length === 0 ? (
                  <div className="py-16 text-center rounded-2xl bg-gray-900 border border-gray-800">
                    <UtensilsCrossed className="w-10 h-10 mx-auto text-gray-600 mb-2 opacity-50" />
                    <p className="text-sm font-bold text-gray-300">No dishes found in this category</p>
                    <button
                      onClick={() => handleOpenAddDish(selectedCategory)}
                      className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-gray-950 font-bold text-xs"
                    >
                      Add First Dish
                    </button>
                  </div>
                ) : (
                  categoryDishes.map(item => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.isAvailable
                          ? 'bg-gray-900 border-gray-800 hover:border-gray-700'
                          : 'bg-gray-950/60 border-gray-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover bg-gray-800 shrink-0"
                          onError={e => {
                            (e.target as HTMLImageElement).src = PRESET_DISH_IMAGES[0].url;
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                            {item.isBestseller && (
                              <span className="flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                <Flame className="w-3 h-3 fill-current" />
                                BESTSELLER
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              item.dietary === 'veg'
                                ? 'border-green-500/40 text-green-400 bg-green-500/10'
                                : 'border-red-500/40 text-red-400 bg-red-500/10'
                            }`}>
                              {item.dietary === 'veg' ? 'VEG' : 'NON-VEG'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 truncate max-w-md mt-0.5">{item.description}</p>
                          <div className="text-xs font-black text-amber-400 mt-1">{formatINR(item.basePrice)}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* In-Stock Toggle */}
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                            item.isAvailable
                              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                              : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          {item.isAvailable ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditDish(item)}
                          className="flex items-center gap-1 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
                          title="Edit Dish"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteDish(item.id, item.name)}
                          className="p-2 rounded-xl bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: 🖼️ BANNER SLIDER MANAGEMENT (5 SLIDERS)       */}
          {/* ==================================================== */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-white">Banner Slider Management</h1>
                  <p className="text-xs text-gray-400">Control the 5 interactive rotating promo banners shown on the customer homepage.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetDefaultBanners}
                    className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold"
                  >
                    Reset Defaults (5)
                  </button>
                  <button
                    onClick={handleOpenAddBanner}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-900/30"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add New Banner</span>
                  </button>
                </div>
              </div>

              {/* Banners Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b, index) => (
                  <div
                    key={b.id}
                    className="relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 group shadow-md"
                  >
                    <div className="relative h-44 w-full bg-gray-950">
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src = PRESET_DISH_IMAGES[0].url;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 text-white font-mono text-[10px] font-bold">
                          Slide #{index + 1}
                        </span>
                        {b.tag && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-gray-950 font-black text-[10px] uppercase">
                            {b.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-white truncate">{b.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-1">{b.subtitle}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                        <span className="text-[11px] text-amber-400 font-semibold">
                          Links to: {b.categoryLink || 'All Categories'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditBanner(b)}
                            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
                            title="Edit Banner"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(b.id, b.title)}
                            className="p-2 rounded-xl bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                            title="Remove Banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: ⚙️ WEBSITE CONTENT & STORE SETTINGS           */}
          {/* ==================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white">Website Content &amp; Store Settings</h1>
                <p className="text-xs text-gray-400">Everything edited here is saved persistently and updates the customer website live.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Restaurant Name</label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={e => setSettings({ ...settings, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Brand Tagline</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Top Announcement Bar Text</label>
                  <input
                    type="text"
                    value={settings.promoBannerText}
                    onChange={e => setSettings({ ...settings, promoBannerText: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Kitchen Contact Phone</label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Operating Hours</label>
                    <input
                      type="text"
                      value={settings.operatingHours}
                      onChange={e => setSettings({ ...settings, operatingHours: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Standard Delivery Fee (₹)</label>
                    <input
                      type="number"
                      value={settings.standardDeliveryFee}
                      onChange={e => setSettings({ ...settings, standardDeliveryFee: Number(e.target.value) })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Free Delivery Above (₹)</label>
                    <input
                      type="number"
                      value={settings.freeDeliveryThreshold}
                      onChange={e => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Minimum Order Amount (₹)</label>
                    <input
                      type="number"
                      value={settings.minOrderAmount}
                      onChange={e => setSettings({ ...settings, minOrderAmount: Number(e.target.value) })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-900/30 transition-all"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isSavingSettings ? 'Saving...' : 'Save & Update Website Content'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: 💬 CUSTOMER BROADCAST & CRM                   */}
          {/* ==================================================== */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-white">Customer Database</h1>
                <p className="text-xs text-gray-400">Total {uniqueCustomers.length} registered customers who placed orders</p>
              </div>

              {/* Broadcast Composer */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-white">Compose Promotional WhatsApp Broadcast</h3>
                <textarea
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="Hey from Moonlight Kitchen! Enjoy 20% OFF today on all Artisanal Pizzas & Combos with code MOONLIGHT20..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-gray-500">
                  Clicking the WhatsApp button next to any customer below will launch their chat with this text pre-filled.
                </p>
              </div>

              {/* Customer List */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-3">
                {uniqueCustomers.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-8">No customer orders recorded yet.</p>
                ) : (
                  uniqueCustomers.map((cust, i) => {
                    const custOrders = allOrders.filter(o => o.customerPhone === cust.customerPhone);
                    const totalSpent = custOrders.reduce((s, o) => s + o.pricing.finalTotal, 0);
                    const waLink = broadcastMessage.trim()
                      ? `https://wa.me/${cust.customerPhone.replace(/\D/g, '').replace(/^0/, '91')}?text=${encodeURIComponent(broadcastMessage)}`
                      : `https://wa.me/${cust.customerPhone.replace(/\D/g, '').replace(/^0/, '91')}`;

                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-gray-800/60 border border-gray-700/60 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 font-black flex items-center justify-center">
                            {cust.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white">{cust.customerName}</div>
                            <div className="text-[11px] text-gray-400">{cust.customerPhone} • {custOrders.length} orders ({formatINR(totalSpent)})</div>
                          </div>
                        </div>

                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 font-bold hover:bg-green-500/20"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </a>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT DISH                               */}
      {/* ==================================================== */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-3xl p-6 space-y-4 my-8 text-gray-100">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-black text-white">
                {editingItem ? 'Edit Dish Details' : `Add New Dish to ${dishForm.category}`}
              </h3>
              <button
                onClick={() => setIsDishModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Moonlight Supreme Cheese Pizza"
                  value={dishForm.name}
                  onChange={e => setDishForm({ ...dishForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Category *</label>
                  <select
                    value={dishForm.category}
                    onChange={e => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500 text-xs font-semibold"
                  >
                    {validCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={dishForm.basePrice}
                    onChange={e => setDishForm({ ...dishForm, basePrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Fresh ingredients, house secret spices..."
                  value={dishForm.description}
                  onChange={e => setDishForm({ ...dishForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Dietary selection */}
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1.5">Dietary Indicator</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDishForm({ ...dishForm, dietary: 'veg' })}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                      dishForm.dietary === 'veg'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    🟢 Vegetarian
                  </button>
                  <button
                    type="button"
                    onClick={() => setDishForm({ ...dishForm, dietary: 'non-veg' })}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                      dishForm.dietary === 'non-veg'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    🔴 Non-Vegetarian
                  </button>
                </div>
              </div>

              {/* Image URL & Presets */}
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Dish Image URL</label>
                <input
                  type="text"
                  value={dishForm.image}
                  onChange={e => setDishForm({ ...dishForm, image: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-xs font-mono"
                />

                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-gray-400 font-semibold block">Or choose a quick preset image:</span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_DISH_IMAGES.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDishForm({ ...dishForm, image: p.url })}
                        className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-300"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bestseller check */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dishBestseller"
                  checked={dishForm.isBestseller}
                  onChange={e => setDishForm({ ...dishForm, isBestseller: e.target.checked })}
                  className="rounded accent-amber-500"
                />
                <label htmlFor="dishBestseller" className="text-gray-300 font-semibold cursor-pointer">
                  Feature as <strong>Kitchen Bestseller</strong> on homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black uppercase tracking-wider"
                >
                  {editingItem ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT BANNER SLIDER                      */}
      {/* ==================================================== */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-3xl p-6 space-y-4 my-8 text-gray-100">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-black text-white">
                {editingBanner ? 'Edit Slider Banner' : 'Add New Slider Banner'}
              </h3>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artisanal Handcrafted Pizzas"
                  value={bannerForm.title}
                  onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. 100% Real Mozzarella & Rich Herbs"
                  value={bannerForm.subtitle}
                  onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Offer Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. FLAT 10% OFF"
                    value={bannerForm.tag}
                    onChange={e => setBannerForm({ ...bannerForm, tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-xs font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Target Category Link</label>
                  <select
                    value={bannerForm.categoryLink}
                    onChange={e => setBannerForm({ ...bannerForm, categoryLink: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500 text-xs font-semibold"
                  >
                    {validCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.imageUrl}
                  onChange={e => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-xs font-mono"
                />

                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-gray-400 font-semibold block">Quick preset banner photo:</span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_DISH_IMAGES.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setBannerForm({ ...bannerForm, imageUrl: p.url })}
                        className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-300"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black uppercase tracking-wider"
                >
                  {editingBanner ? 'Save Changes' : 'Add Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
