import React from 'react';
import { 
  Sparkles, 
  Pizza, 
  UtensilsCrossed, 
  Layers, 
  CookingPot, 
  Soup, 
  CupSoda, 
  Flame, 
  Gift, 
  Award, 
  Star,
  Sandwich as SandwichIcon 
} from 'lucide-react';
import { MENU_CATEGORIES } from '../../data/menu';

interface MenuCategoryNavProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categoryCounts: Record<string, number>;
}

export const MenuCategoryNav: React.FC<MenuCategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Pizza': return <Pizza className="w-4 h-4" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-4 h-4" />;
      case 'Sandwich': return <SandwichIcon className="w-4 h-4" />;
      case 'Layers': return <Layers className="w-4 h-4" />;
      case 'CookingPot': return <CookingPot className="w-4 h-4" />;
      case 'Soup': return <Soup className="w-4 h-4" />;
      case 'CupSoda': return <CupSoda className="w-4 h-4" />;
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'Gift': return <Gift className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'Star': return <Star className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-18 z-30 py-3 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -my-1">
          {MENU_CATEGORIES.map(category => {
            const isActive = activeCategory === category.id;
            const count = category.id === 'all' 
              ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
              : categoryCounts[category.id] || 0;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20 scale-[1.02]'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                <span className={isActive ? 'text-slate-950' : 'text-orange-400'}>
                  {getCategoryIcon(category.icon)}
                </span>
                <span>{category.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
