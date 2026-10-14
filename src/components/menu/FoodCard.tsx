import React from 'react';
import { Plus, Minus, Flame, Star } from 'lucide-react';
import { MenuItem } from '../../types/menu';
import { formatINR } from '../../lib/pricing';
import { useCart } from '../../context/CartContext';
import { FoodImage } from '../common/FoodImage';

interface FoodCardProps {
  item: MenuItem;
  onOpenDetailModal: (item: MenuItem) => void;
}

const DietDot: React.FC<{ type?: string }> = ({ type }) => {
  if (type === 'veg') {
    return (
      <div className="w-4 h-4 rounded-sm border-2 border-green-500 flex items-center justify-center shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
      </div>
    );
  }
  if (type === 'non-veg') {
    return (
      <div className="w-4 h-4 rounded-sm border-2 border-red-500 flex items-center justify-center shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
      </div>
    );
  }
  return null;
};

export const FoodCard: React.FC<FoodCardProps> = ({ item, onOpenDetailModal }) => {
  const { items, addItem, updateQuantity, getItemQuantity } = useCart();

  const hasOptions = Boolean(
    (item.variants && item.variants.length > 0) ||
    (item.addons && item.addons.length > 0)
  );

  const currentQuantity = getItemQuantity(item.id);
  const directCartItem = !hasOptions ? items.find(i => i.menuItemId === item.id) : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isAvailable) return;
    if (hasOptions) onOpenDetailModal(item);
    else addItem(item);
  };

  const handleInc = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasOptions) onOpenDetailModal(item);
    else if (directCartItem) updateQuantity(directCartItem.id, 1);
  };

  const handleDec = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (directCartItem) updateQuantity(directCartItem.id, -1);
    else if (hasOptions) onOpenDetailModal(item);
  };

  return (
    <div
      onClick={() => item.isAvailable && onOpenDetailModal(item)}
      className={`group relative bg-gray-800/60 hover:bg-gray-800 border border-gray-700/80 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer card-hover ${
        !item.isAvailable ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex gap-0 p-4 pb-5">
        {/* LEFT: Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pr-3">
          {/* Top row: diet dot + badges */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <DietDot type={item.dietary} />
              {item.isBestseller && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  Bestseller
                </span>
              )}
            </div>

            {/* Item Name */}
            <h3 className="text-sm sm:text-[15px] font-bold text-gray-100 leading-snug group-hover:text-amber-300 transition-colors">
              {item.name}
            </h3>

            {/* Price */}
            <div className="text-sm font-extrabold text-white">
              {item.variants && item.variants.length > 0 ? (
                <span className="flex items-baseline gap-1">
                  <span>{formatINR(item.variants[0].price)}</span>
                  <span className="text-xs text-gray-500 font-normal">
                    – {formatINR(item.variants[item.variants.length - 1].price)}
                  </span>
                </span>
              ) : (
                formatINR(item.basePrice)
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {item.description}
            </p>

            {/* Combo tags */}
            {item.comboItems && item.comboItems.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {item.comboItems.map((ci, idx) => (
                  <span key={idx} className="text-[10px] bg-gray-700 text-gray-400 px-2 py-0.5 rounded font-medium">
                    + {ci}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Image + ADD button */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
          {/* Image */}
          <div className="w-full h-full rounded-xl overflow-hidden bg-gray-700 food-img">
            <FoodImage
              src={item.image}
              alt={item.name}
              category={item.category}
              className="w-full h-full"
            />
            {/* Sold-out overlay */}
            {!item.isAvailable && (
              <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center rounded-xl z-10">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sold Out</span>
              </div>
            )}
          </div>

          {/* ADD / Counter — overlapping bottom edge */}
          {item.isAvailable && (
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[90%]"
              onClick={e => e.stopPropagation()}
            >
              {currentQuantity > 0 && !hasOptions ? (
                <div className="flex items-center justify-between bg-gray-900 border border-amber-500 rounded-xl shadow-lg shadow-black/50 overflow-hidden h-9">
                  <button
                    onClick={handleDec}
                    className="px-3 h-full flex items-center text-amber-400 hover:bg-gray-800 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-black text-white tabular-nums">{currentQuantity}</span>
                  <button
                    onClick={handleInc}
                    className="px-3 h-full flex items-center text-amber-400 hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className="w-full h-9 rounded-xl bg-gray-900 hover:bg-amber-500 border border-amber-500/70 hover:border-amber-400 text-amber-400 hover:text-gray-900 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1 uppercase tracking-wide"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customisable hint */}
      {hasOptions && item.isAvailable && (
        <div className="px-4 pb-3 -mt-1">
          <span className="text-[10px] text-amber-500/70 font-medium">Customisable ›</span>
        </div>
      )}
    </div>
  );
};
