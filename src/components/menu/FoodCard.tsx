import React from 'react';
import { Plus, Minus, Flame, Sparkles } from 'lucide-react';
import { MenuItem } from '../../types/menu';
import { DietaryBadge } from '../common/DietaryBadge';
import { formatINR } from '../../lib/pricing';
import { useCart } from '../../context/CartContext';

interface FoodCardProps {
  item: MenuItem;
  onOpenDetailModal: (item: MenuItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onOpenDetailModal }) => {
  const { items, addItem, updateQuantity, getItemQuantity } = useCart();

  const hasOptions = Boolean((item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0));
  const currentQuantity = getItemQuantity(item.id);

  // If item is simple (no variants/addons), find its specific cart item ID
  const directCartItem = !hasOptions
    ? items.find(i => i.menuItemId === item.id)
    : null;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isAvailable) return;

    if (hasOptions) {
      onOpenDetailModal(item);
    } else {
      addItem(item);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasOptions) {
      // Opening detail modal lets them customize or repeat
      onOpenDetailModal(item);
    } else if (directCartItem) {
      updateQuantity(directCartItem.id, 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (directCartItem) {
      updateQuantity(directCartItem.id, -1);
    } else if (hasOptions) {
      // If multiple variants might be in cart, open modal or notify
      onOpenDetailModal(item);
    }
  };

  return (
    <div
      onClick={() => item.isAvailable && onOpenDetailModal(item)}
      className={`group relative bg-slate-900/90 rounded-2xl border border-slate-800/80 overflow-hidden hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-950/20 transition-all duration-300 flex flex-col cursor-pointer ${
        !item.isAvailable ? 'opacity-60 grayscale' : ''
      }`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // High-grade fallback placeholder
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Dietary and Bestseller Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <div className="bg-slate-950/80 backdrop-blur-md p-1 rounded-md shadow">
            <DietaryBadge type={item.dietary} />
          </div>
          {item.isBestseller && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
              <Flame className="w-3 h-3 fill-current" />
              Bestseller
            </span>
          )}
        </div>

        {/* Customisable indicator */}
        {hasOptions && item.isAvailable && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="flex items-center gap-1 bg-slate-900/90 text-amber-300 border border-amber-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5" />
              Customisable
            </span>
          </div>
        )}

        {/* Out of Stock Ribbon */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-rose-900/90 text-rose-200 border border-rose-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
              {item.name}
            </h3>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {item.comboItems && item.comboItems.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1">
              {item.comboItems.map((ci, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60"
                >
                  + {ci}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Price & Add Action */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-black text-white">
              {item.variants && item.variants.length > 0 ? (
                <div className="flex items-baseline gap-1">
                  <span>{formatINR(item.variants[0].price)}</span>
                  <span className="text-xs text-slate-400 font-normal">/ {formatINR(item.variants[item.variants.length - 1].price)}</span>
                </div>
              ) : (
                formatINR(item.basePrice)
              )}
            </div>
            {item.variants && item.variants.length > 0 && (
              <span className="text-[10px] text-slate-400 block -mt-0.5">Half / Full sizes</span>
            )}
          </div>

          {/* Action button */}
          {item.isAvailable && (
            <div onClick={e => e.stopPropagation()}>
              {currentQuantity > 0 && !hasOptions ? (
                <div className="flex items-center bg-orange-500 text-slate-950 rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 overflow-hidden">
                  <button
                    onClick={handleDecrement}
                    className="p-2 hover:bg-orange-600 active:scale-95 transition-all"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-black text-xs min-w-[20px] text-center">
                    {currentQuantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="p-2 hover:bg-orange-600 active:scale-95 transition-all"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddClick}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 transition-all uppercase tracking-wide"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>ADD</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
