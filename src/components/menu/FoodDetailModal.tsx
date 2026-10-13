import React, { useState, useEffect } from 'react';
import { X, Check, Flame, ShoppingBag, Plus, Minus } from 'lucide-react';
import { MenuItem, ItemVariant, ItemAddon } from '../../types/menu';
import { DietaryBadge } from '../common/DietaryBadge';
import { formatINR, calculateCartItemPrice } from '../../lib/pricing';
import { useCart } from '../../context/CartContext';

interface FoodDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ item, onClose }) => {
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | undefined>(undefined);
  const [selectedAddons, setSelectedAddons] = useState<ItemAddon[]>([]);
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) {
      if (item.variants && item.variants.length > 0) {
        setSelectedVariant(item.variants[0]);
      } else {
        setSelectedVariant(undefined);
      }
      setSelectedAddons([]);
      setInstructions('');
      setQuantity(1);
    }
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const toggleAddon = (addon: ItemAddon) => {
    setSelectedAddons(prev => {
      const exists = prev.some(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const unitPrice = calculateCartItemPrice(
    item.basePrice,
    selectedVariant?.price,
    selectedAddons
  );
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(item, selectedVariant, selectedAddons, instructions.trim() || undefined);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-slate-100 text-slate-700 shadow-sm transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Banner */}
        <div className="relative h-52 w-full bg-slate-100 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <div className="bg-white/95 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
              <DietaryBadge type={item.dietary} showLabel />
            </div>
            {item.isBestseller && (
              <span className="flex items-center gap-1 bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-current" />
                Bestseller
              </span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Title & Description */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {item.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              {item.description}
            </p>
            {item.comboItems && (
              <div className="mt-2.5 p-3 rounded-xl bg-orange-50/80 border border-orange-200/80">
                <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wide block mb-1">
                  Combo Includes:
                </span>
                <ul className="text-xs text-slate-700 list-disc list-inside space-y-0.5">
                  {item.comboItems.map((ci, idx) => (
                    <li key={idx}>{ci}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Variant / Size Options */}
          {item.variants && item.variants.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Portion / Size
                </h4>
                <span className="text-[11px] text-orange-600 font-bold">Required</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {item.variants.map(variant => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-orange-50/80 border-orange-500 text-slate-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-bold">{variant.name}</div>
                        <div className="text-xs text-orange-600 font-extrabold">
                          {formatINR(variant.price)}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          isSelected
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Add-ons */}
          {item.addons && item.addons.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Optional Add-ons
                </h4>
                <span className="text-[11px] text-slate-500">Choose multiple</span>
              </div>
              <div className="space-y-2">
                {item.addons.map(addon => {
                  const isSelected = selectedAddons.some(a => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-orange-50/80 border-orange-500 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold">{addon.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-orange-600">
                          +{formatINR(addon.price)}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? 'bg-orange-600 border-orange-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cooking Instructions Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Special Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, extra crispy, no onion..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden h-10 shadow-2xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 h-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-sm min-w-[28px] text-center text-slate-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 h-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-between px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-600/20 transition-all uppercase tracking-wider"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Basket</span>
            </div>
            <span>{formatINR(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
