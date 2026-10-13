import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroBanner } from './components/common/HeroBanner';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { CategoryVisualShowcase } from './components/menu/CategoryVisualShowcase';
import { StickyCategoryNav } from './components/menu/StickyCategoryNav';
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

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryType | 'all'>('all');
  const [onlyBestsellers, setOnlyBestsellers] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'name'>('popular');

  // Modals state
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const menuContainerRef = useRef<HTMLDivElement>(null);

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

  // Category counts
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
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

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

      if (dietaryFilter !== 'all' && item.dietary !== dietaryFilter) {
        return false;
      }

      if (onlyBestsellers && !item.isBestseller) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (a.isBestseller && !b.isBestseller) return -1;
      if (!a.isBestseller && b.isBestseller) return 1;
      return 0;
    });
  }, [menuItems, activeCategory, searchQuery, dietaryFilter, onlyBestsellers, sortBy]);

  // Top-down smooth scroll to category section
  const handleScrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === 'all') {
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }

    const sectionEl = document.getElementById(`category-section-${categoryId}`);
    if (sectionEl) {
      const yOffset = -140; // account for sticky header & sticky category bar
      const y = sectionEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenSearch={handleFocusSearch}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Sticky Top-Down Category Navigator Bar */}
      <StickyCategoryNav
        activeCategory={activeCategory}
        onSelectCategory={handleScrollToCategory}
        categoryCounts={categoryCounts}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-12" ref={menuContainerRef}>
        <div className="flex gap-8 items-start">
          {/* Main Content Column */}
          <div className="flex-1 min-w-0">
            {/* Restaurant Hero Card */}
            <HeroBanner
              onExploreClick={() => {
                const el = document.getElementById('discovery-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Top Category Visual Showcase ("What's on your mind?") */}
            <CategoryVisualShowcase
              onCategoryClick={handleScrollToCategory}
              categoryCounts={categoryCounts}
            />

            {/* Search, Dietary Filters & Sort */}
            <div id="discovery-section">
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
            </div>

            {/* Food Grid / Top-Down Grouped Category Sections */}
            {isLoadingMenu ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-white border border-slate-200 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-2xs">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Utensils className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No dishes match your filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search query or dietary filters to browse the entire menu.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : activeCategory === 'all' && !searchQuery ? (
              // Top-Down Flow: Dedicated Category Sections with anchors
              <div className="space-y-10">
                {MENU_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                  const catItems = filteredItems.filter(i => i.category === cat.id);
                  if (catItems.length === 0) return null;

                  return (
                    <section
                      key={cat.id}
                      id={`category-section-${cat.id}`}
                      className="space-y-4 pt-4 border-t first:border-t-0 border-slate-200/80"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif">
                            {cat.name}
                          </h2>
                          {cat.description && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                          {catItems.length} {catItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              // Filtered / Search Results View
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Persistent Desktop Basket Side Panel (Visible on screens >= 1280px) */}
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
