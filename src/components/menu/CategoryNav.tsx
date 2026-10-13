import React, { useRef } from 'react';
import { Flame, Sparkles, Pizza, Sandwich, CupSoda, ShoppingBag } from 'lucide-react';
import { MENU_CATEGORIES } from '../../data/menu';

interface CategoryNavProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  categoryCounts: Record<string, number>;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  all: '✨',
  bestsellers: '🔥',
  pizza: '🍕',
  burger: '🍔',
  sandwich: '🥪',
  'jumbo-sandwich': '🥖',
  'fries-bowl': '🍟',
  maggi: '🍜',
  'cold-beverages': '🥤',
  biryani: '🍛',
  'special-combo': '🎁',
  'pizza-combos': '🍕',
  'burger-combos': '🍔',
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const bestsellerCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="mb-6">
      {/* Horizontal scrollable chip row — Swiggy style */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        {/* Bestsellers chip — always first */}
        <button
          onClick={() => onSelectCategory('bestsellers')}
          className={`flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
            activeCategory === 'bestsellers'
              ? 'bg-amber-500 border-amber-500 text-gray-900 shadow-lg shadow-amber-900/30'
              : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-amber-500/50 hover:text-amber-300'
          }`}
        >
          <span>🔥</span>
          <span>Bestsellers</span>
        </button>

        {/* Real categories */}
        {MENU_CATEGORIES.filter(c => c.id !== 'all').map(category => {
          const count = categoryCounts[category.id] || 0;
          if (count === 0) return null;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                isActive
                  ? 'bg-amber-500 border-amber-500 text-gray-900 shadow-lg shadow-amber-900/30'
                  : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-amber-500/50 hover:text-amber-300'
              }`}
            >
              <span>{CATEGORY_EMOJIS[category.id] || '🍽️'}</span>
              <span>{category.name}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-gray-900/20 text-gray-900' : 'bg-gray-700 text-gray-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
