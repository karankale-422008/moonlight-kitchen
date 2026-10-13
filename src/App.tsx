import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroBanner } from './components/common/HeroBanner';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { MenuCategoryNav } from './components/menu/MenuCategoryNav';
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
import { AdminModal } from './components/admin/AdminModal';

import { ToastProvider } from './context/ToastContext';
import { CartProvider, useCart } from './context/CartContext';
import { CustomerProvider } from './context/CustomerContext';
import { OrderProvider } from './context/OrderContext';

import { MenuItem, DietaryType } from './types/menu';
import { MENU_CATEGORIES } from './data/menu';
import { fetchMenuItems } from './lib/storage';
import { Utensils } from 'lucide-react';

const MainApp: React.FC = () => {
  const { isCartOpen, setIsCartOpen } = useCart();

  // Menu items loaded from storage / database
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // Filter & Search states
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryType | 'all'>('all');
  const [onlyBestsellers, setOnlyBestsellers] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'name'>('popular');

  // Modals state
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const menuSectionRef = useRef<HTMLDivElement>(null);

  // Load menu items
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

  useEffect(() => {
    loadMenu();
  }, []);

  // Keyboard shortcut '/' to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        window.scrollTo({ top: 380, behavior: 'smooth' });
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Category counts based on total menu
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    menuItems.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // 1. Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesCombo = item.comboItems?.some(c => c.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesCombo) {
          return false;
        }
      }

      // 3. Dietary filter
      if (dietaryFilter !== 'all' && item.dietary !== dietaryFilter) {
        return false;
      }

      // 4. Bestseller filter
      if (onlyBestsellers && !item.isBestseller) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // 'popular': bestsellers first
      if (a.isBestseller && !b.isBestseller) return -1;
      if (!a.isBestseller && b.isBestseller) return 1;
      return 0;
    });
  }, [menuItems, activeCategory, searchQuery, dietaryFilter, onlyBestsellers, sortBy]);

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setDietaryFilter('all');
    setOnlyBestsellers(false);
    setSortBy('popular');
  };

  const handleFocusSearch = () => {
    window.scrollTo({ top: 380, behavior: 'smooth' });
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) input.focus();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        onOpenSearch={handleFocusSearch}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Sticky Menu Category Bar */}
      <MenuCategoryNav
        activeCategory={activeCategory}
        onSelectCategory={catId => {
          setActiveCategory(catId);
          if (menuSectionRef.current) {
            menuSectionRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        categoryCounts={categoryCounts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-12">
        <div className="flex gap-8 items-start">
          {/* Main Discovery Column */}
          <div className="flex-1 min-w-0" ref={menuSectionRef}>
            {/* Hero Branding Banner */}
            <HeroBanner
              onExploreClick={() => {
                if (menuSectionRef.current) {
                  menuSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />

            {/* Search and Filters Bar */}
            <SearchAndFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              dietaryFilter={dietaryFilter}
              onDietaryChange={setDietaryFilter}
              onlyBestsellers={onlyBestsellers}
              onToggleBestsellers={() => setOnlyBestsellers(prev => !prev)}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalFilteredCount={filteredItems.length}
              onResetFilters={handleResetFilters}
            />

            {/* Food Grid / Category Sections */}
            {isLoadingMenu ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-16 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800 flex items-center justify-center text-slate-500">
                  <Utensils className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No items found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No food matches your current search or dietary filter. Try resetting your filters to explore our full menu.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            ) : activeCategory === 'all' && !searchQuery ? (
              // Grouped Category View when viewing All items
              <div className="space-y-12">
                {MENU_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                  const catItems = filteredItems.filter(i => i.category === cat.id);
                  if (catItems.length === 0) return null;

                  return (
                    <section key={cat.id} id={cat.id} className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight">
                            {cat.name}
                          </h2>
                          {cat.description && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          {catItems.length} {catItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {catItems.map(item => (
                          <FoodCard
                            key={item.id}
                            item={item}
                            onOpenDetailModal={it => setSelectedDetailItem(it)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              // Flat Filtered Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map(item => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    onOpenDetailModal={it => setSelectedDetailItem(it)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Persistent Desktop Basket Side Panel (Visible on xl screens >= 1280px) */}
          <div className="hidden xl:block shrink-0">
            <DesktopCartPanel onOpenCheckout={() => setIsCheckoutOpen(true)} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Bottom Bar */}
      <MobileBottomBar
        onOpenSearch={handleFocusSearch}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Modals & Drawers */}
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

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onMenuUpdated={loadMenu}
      />
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
