import React from 'react';
import { Plus, Minus, Flame } from 'lucide-react';
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
      onOpenDetailModal(item);
    }
  };

  return (
    <div
      onClick={() => item.isAvailable && onOpenDetailModal(item)}
      className={`group relative bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex justify-between gap-4 cursor-pointer ${
        !item.isAvailable ? 'opacity-60 bg-slate-50' : ''
      }`}
    >
      {/* Left Column: Details & Pricing */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Dietary & Bestseller tags */}
          <div className="flex items-center gap-2">
            <DietaryBadge type={item.dietary} />
            {item.isBestseller && (
              <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                Bestseller
              </span>
            )}
          </div>

          {/* Dish Name */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
            {item.name}
          </h3>

          {/* Price */}
          <div className="text-sm sm:text-base font-extrabold text-slate-900">
            {item.variants && item.variants.length > 0 ? (
              <span className="flex items-baseline gap-1">
                <span>{formatINR(item.variants[0].price)}</span>
                <span className="text-xs text-slate-400 font-normal">
                  - {formatINR(item.variants[item.variants.length - 1].price)}
                </span>
              </span>
            ) : (
              formatINR(item.basePrice)
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-0.5">
            {item.description}
          </p>

          {/* Combo breakdown tags */}
          {item.comboItems && item.comboItems.length > 0 && (
            <div className="pt-1.5 flex flex-wrap gap-1">
              {item.comboItems.map((ci, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                >
                  + {ci}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Appetizing Food Image with Overlapping ADD Button */}
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex flex-col items-center">
        <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
            }}
          />
        </div>

        {/* Overlapping ADD / Counter Button (Zomato/Swiggy hallmark) */}
        <div 
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 w-24 sm:w-28"
          onClick={e => e.stopPropagation()}
        >
          {item.isAvailable ? (
            currentQuantity > 0 && !hasOptions ? (
              <div className="flex items-center justify-between bg-white text-emerald-600 rounded-xl font-bold text-xs shadow-md border border-emerald-500/50 overflow-hidden h-9">
                <button
                  onClick={handleDecrement}
                  className="px-2.5 h-full hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-extrabold text-xs text-slate-900">
                  {currentQuantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="px-2.5 h-full hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                className="w-full h-9 rounded-xl bg-white hover:bg-emerald-50 active:scale-95 text-emerald-600 font-extrabold text-xs shadow-md border border-slate-200 hover:border-emerald-500 transition-all uppercase tracking-wide flex items-center justify-center gap-1"
              >
                <span>ADD</span>
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )
          ) : (
            <div className="w-full py-1 rounded-lg bg-slate-200 text-slate-500 text-[10px] font-bold text-center border border-slate-300">
              Sold Out
            </div>
          )}

          {hasOptions && item.isAvailable && (
            <span className="text-[10px] text-slate-400 font-medium block text-center mt-1">
              Customisable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
