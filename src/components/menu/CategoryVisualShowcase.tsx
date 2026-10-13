import React from 'react';
import { MENU_CATEGORIES } from '../../data/menu';

// Curated authentic dish images representing each category
const CATEGORY_THUMBNAILS: Record<string, string> = {
  pizza: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=240&h=240&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=240&h=240&q=80',
  sandwich: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=240&h=240&q=80',
  'jumbo-sandwich': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=240&h=240&q=80',
  'fries-bowl': 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=240&h=240&q=80',
  maggi: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=240&h=240&q=80',
  'cold-beverages': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=240&h=240&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=240&h=240&q=80',
  'special-combo': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=240&h=240&q=80',
  'pizza-combos': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=240&h=240&q=80',
  'burger-combos': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=240&h=240&q=80',
};

interface CategoryVisualShowcaseProps {
  onCategoryClick: (categoryId: string) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryVisualShowcase: React.FC<CategoryVisualShowcaseProps> = ({
  onCategoryClick,
  categoryCounts,
}) => {
  const displayCategories = MENU_CATEGORIES.filter(c => c.id !== 'all');

  return (
    <div className="py-6 border-b border-slate-200/80 bg-white rounded-3xl shadow-xs p-5 sm:p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            What's on your mind?
          </h2>
          <p className="text-xs text-slate-500">
            Explore authentic street bites, artisanal pizzas, and royal dum biryani
          </p>
        </div>
        <span className="text-xs text-orange-600 font-semibold hidden sm:inline">
          Scroll to explore &rarr;
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2 -my-2">
        {displayCategories.map(cat => {
          const count = categoryCounts[cat.id] || 0;
          const thumbnail = CATEGORY_THUMBNAILS[cat.id] || CATEGORY_THUMBNAILS.pizza;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat.id)}
              className="flex flex-col items-center gap-2 group shrink-0 focus:outline-none"
            >
              {/* Image Circle */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden p-1 bg-slate-100 border border-slate-200 group-hover:border-orange-500 group-hover:scale-105 transition-all duration-200 shadow-2xs">
                <img
                  src={thumbnail}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                />
              </div>

              {/* Title & Count */}
              <div className="text-center max-w-[90px]">
                <span className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1 block">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  {count} items
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
