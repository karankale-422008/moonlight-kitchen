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
      setSelectedVariant(item.variants && item.variants.length > 0 ? item.variants[0] : undefined);
      setSelectedAddons([]);
      setInstructions('');
      setQuantity(1);
    }
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const toggleAddon = (addon: ItemAddon) => {
    setSelectedAddons(prev =>
      prev.some(a => a.id === addon.id) ? prev.filter(a => a.id !== addon.id) : [...prev, addon]
    );
  };

  const unitPrice = calculateCartItemPrice(item.basePrice, selectedVariant?.price, selectedAddons);
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(item, selectedVariant, selectedAddons, instructions.trim() || undefined);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg bg-gray-900 border border-gray-700 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Food Image */}
        <div className="relative h-52 w-full bg-gray-800 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <DietaryBadge type={item.dietary} showLabel />
            {item.isBestseller && (
              <span className="flex items-center gap-1 bg-amber-500 text-gray-900 text-xs font-black px-2.5 py-1 rounded-lg uppercase">
                <Flame className="w-3.5 h-3.5 fill-current" />
                Bestseller
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Title */}
          <div>
            <h2 className="text-xl font-black text-white">{item.name}</h2>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.description}</p>
            {item.comboItems && (
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block mb-1">Combo Includes:</span>
                <ul className="text-xs text-gray-300 list-disc list-inside space-y-0.5">
                  {item.comboItems.map((ci, i) => <li key={i}>{ci}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Variants */}
          {item.variants && item.variants.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Choose Size / Portion</h4>
                <span className="text-[11px] text-amber-400 font-bold">Required</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {item.variants.map(variant => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{variant.name}</div>
                        <div className={`text-xs font-extrabold ${isSelected ? 'text-amber-400' : 'text-gray-400'}`}>
                          {formatINR(variant.price)}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-gray-900' : 'border-gray-500'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {item.addons && item.addons.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Add-ons</h4>
                <span className="text-[11px] text-gray-500">Optional</span>
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
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-xs font-semibold">{addon.name}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-gray-500'}`}>
                          +{formatINR(addon.price)}
                        </span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isSelected ? 'bg-amber-500 border-amber-500 text-gray-900' : 'border-gray-500'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Special Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, extra crispy..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-600 rounded-xl text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="p-4 bg-gray-900 border-t border-gray-700 flex items-center gap-3">
          {/* Quantity */}
          <div className="flex items-center bg-gray-800 border border-gray-600 rounded-xl overflow-hidden h-11">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 h-full text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 font-black text-sm text-white min-w-[28px] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 h-full text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-between px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-extrabold text-sm shadow-lg transition-all active:scale-[0.99]"
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
