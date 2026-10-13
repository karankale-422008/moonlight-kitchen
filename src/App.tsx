import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroBanner } from './components/common/HeroBanner';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { CategoryNav } from './components/menu/CategoryNav';
import { SearchAndFilters } from './components/menu/SearchAndFilters';
import { FoodCard } from './components/menu/FoodCard';
import { FoodDetailModal } from './components/menu/FoodDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { DesktopCartPanel } from './components/cart/DesktopCartPanel';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderSuccessModal } from './components/checkout/OrderSuccessModal';
import { PhoneAuthModal } from './components/profile/PhoneAuthModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { OrderHistoryModal } from './components/orders/OrderHistoryModal';
import { AdminPage } from './components/admin/AdminPage';

import { ToastProvider } from './context/ToastContext';
import { CartProvider, useCart } from './context/CartContext';
import { CustomerProvider, useCustomer } from './context/CustomerContext';
import { OrderProvider, useOrder } from './context/OrderContext';

import { MenuItem, DietaryType } from './types/menu';
import { MENU_CATEGORIES } from './data/menu';
import { fetchMenuItems } from './lib/storage';
import { Utensils, Flame } from 'lucide-react';

const CATEGORY_EMOJIS: Record<string, string> = {
  pizza: '🍕', burger: '🍔', sandwich: '🥪', 'jumbo-sandwich': '🥖',
  'fries-bowl': '🍟', maggi: '🍜', 'cold-beverages': '🥤',
  biryani: '🍛', 'special-combo': '🎁', 'pizza-combos': '🍕', 'burger-combos': '🍔',
};

const MainApp: React.FC = () => {
  const { isCartOpen, setIsCartOpen } = useCart();
  const { setIsOrderHistoryOpen } = useOrder();
  const { setIsAuthModalOpen, setIsProfileModalOpen } = useCustomer();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // Default is 'bestsellers' — not 'all'
  const [activeCategory, setActiveCategory] = useState<string>('bestsellers');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryType | 'all'>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [mobilePrimaryTab, setMobilePrimaryTab] = useState<'menu' | 'cart' | 'orders' | 'profile'>('menu');

  const loadMenu = async () => {
    setIsLoadingMenu(true);
    try {
      const items = await fetchMenuItems();
      setMenuItems(items);
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  useEffect(() => { loadMenu(); }, []);

  // '/' key opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    menuItems.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  // Filtered items based on active category, search, dietary
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Category filter
      if (activeCategory === 'bestsellers') {
        if (!item.isBestseller) return false;
      } else if (activeCategory !== 'all') {
        if (item.category !== activeCategory) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = item.name.toLowerCase().includes(q)
          || item.description.toLowerCase().includes(q)
          || item.category.toLowerCase().includes(q)
          || (item.comboItems?.some(c => c.toLowerCase().includes(q)));
        if (!match) return false;
      }

      // Dietary
      if (dietaryFilter !== 'all' && item.dietary !== dietaryFilter) return false;

      return true;
    }).sort((a, b) => {
      // Always bestsellers first
      if (a.isBestseller && !b.isBestseller) return -1;
      if (!a.isBestseller && b.isBestseller) return 1;
      return 0;
    });
  }, [menuItems, activeCategory, searchQuery, dietaryFilter]);

  const hasActiveFilters = searchQuery !== '' || dietaryFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setDietaryFilter('all');
    setActiveCategory('bestsellers');
    setIsSearchOpen(false);
  };

  const handleMobileTabChange = (tab: 'menu' | 'cart' | 'orders' | 'profile') => {
    setMobilePrimaryTab(tab);
    if (tab === 'orders') setIsOrderHistoryOpen(true);
    if (tab === 'profile') setIsProfileModalOpen(true);
  };

  const categoryLabel = activeCategory === 'bestsellers'
    ? '🔥 Bestsellers'
    : activeCategory === 'all'
    ? '✨ All Items'
    : `${CATEGORY_EMOJIS[activeCategory] || '🍽️'} ${MENU_CATEGORIES.find(c => c.id === activeCategory)?.name || activeCategory}`;

  if (isAdminOpen) {
    return (
      <AdminPage
        onClose={() => setIsAdminOpen(false)}
        onMenuUpdated={loadMenu}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCloseSearch={() => setIsSearchOpen(false)}
      />

      {/* Main Layout */}
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-4 sm:px-6 py-6 pb-32 md:pb-12">
        <div className="flex gap-6 items-start">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Hero Banner */}
            <HeroBanner
              onExploreClick={() => {
                document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Menu Section */}
            <div id="menu-section">
              {/* Category Chip Nav */}
              <CategoryNav
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                categoryCounts={categoryCounts}
              />

              {/* Search + Filters */}
              <SearchAndFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                dietaryFilter={dietaryFilter}
                onDietaryChange={setDietaryFilter}
                totalFilteredCount={filteredItems.length}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
              />

              {/* Section heading */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-white">
                  {searchQuery ? `Results for "${searchQuery}"` : categoryLabel}
                </h2>
                <span className="text-xs text-gray-500 font-medium">
                  {isLoadingMenu ? '...' : `${filteredItems.length} items`}
                </span>
              </div>

              {/* Items Grid */}
              {isLoadingMenu ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-44 rounded-2xl skeleton" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="py-16 rounded-2xl bg-gray-800/40 border border-gray-700/60 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-700 flex items-center justify-center mb-4">
                    <Utensils className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-base font-bold text-gray-300">No dishes found</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4">Try a different category or clear filters</p>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs transition-colors"
                  >
                    Show Bestsellers
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredItems.map(item => (
                    <FoodCard
                      key={item.id}
                      item={item}
                      onOpenDetailModal={setSelectedDetailItem}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Cart Panel */}
          <div className="hidden lg:block shrink-0">
            <DesktopCartPanel onOpenCheckout={() => setIsCheckoutOpen(true)} />
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Bottom Bar */}
      <MobileBottomBar
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        activeTab={mobilePrimaryTab}
        onTabChange={handleMobileTabChange}
      />

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <FoodDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      <OrderSuccessModal />
      <PhoneAuthModal />
      <ProfileModal />
      <OrderHistoryModal />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <CustomerProvider>
          <OrderProvider>
            <MainApp />
          </OrderProvider>
        </CustomerProvider>
      </CartProvider>
    </ToastProvider>
  );
}
