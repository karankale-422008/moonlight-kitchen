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

  // Initialize defaults whenever item opens
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

  // Handle ESC key
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Banner */}
        <div className="relative h-52 w-full bg-slate-950 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

          {/* Badges */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <div className="bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 shadow">
              <DietaryBadge type={item.dietary} showLabel />
            </div>
            {item.isBestseller && (
              <span className="flex items-center gap-1 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
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
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {item.name}
            </h2>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              {item.description}
            </p>
            {item.comboItems && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide block mb-1">
                  Combo Includes:
                </span>
                <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
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
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Portion / Size
                </h4>
                <span className="text-[11px] text-amber-400 font-medium">Required</span>
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
                          ? 'bg-orange-500/10 border-orange-500 text-white shadow-sm'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold">{variant.name}</div>
                        <div className="text-xs text-orange-400 font-medium">
                          {formatINR(variant.price)}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          isSelected
                            ? 'bg-orange-500 border-orange-500 text-slate-950'
                            : 'border-slate-600 bg-slate-800'
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
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Optional Add-ons
                </h4>
                <span className="text-[11px] text-slate-400">Choose multiple</span>
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
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-sm font-medium">{addon.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-400">
                          +{formatINR(addon.price)}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-slate-950'
                              : 'border-slate-600 bg-slate-800'
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
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Special Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, extra crispy, no onion..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-sm min-w-[28px] text-center text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-sm shadow-lg shadow-orange-500/25 transition-all"
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
