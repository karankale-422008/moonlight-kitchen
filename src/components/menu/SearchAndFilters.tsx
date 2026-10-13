import React from 'react';
import { Search, X, SlidersHorizontal, Flame } from 'lucide-react';
import { DietaryType } from '../../types/menu';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  dietaryFilter: DietaryType | 'all';
  onDietaryChange: (d: DietaryType | 'all') => void;
  onlyBestsellers: boolean;
  onToggleBestsellers: () => void;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'name';
  onSortChange: (sort: 'popular' | 'price-asc' | 'price-desc' | 'name') => void;
  totalFilteredCount: number;
  onResetFilters: () => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  dietaryFilter,
  onDietaryChange,
  onlyBestsellers,
  onToggleBestsellers,
  sortBy,
  onSortChange,
  totalFilteredCount,
  onResetFilters,
}) => {
  const isFiltered = searchQuery !== '' || dietaryFilter !== 'all' || onlyBestsellers || sortBy !== 'popular';

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 shadow-sm mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Moonlight Kitchen menu (pizza, burger, sandwich, biryani...)"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={e => onSortChange(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500"
          >
            <option value="popular">Recommended / Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Item Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
        <div className="flex flex-wrap items-center gap-2">
          {/* All */}
          <button
            onClick={() => onDietaryChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              dietaryFilter === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Diets
          </button>

          {/* Veg */}
          <button
            onClick={() => onDietaryChange('veg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              dietaryFilter === 'veg'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Pure Veg</span>
          </button>

          {/* Non-Veg */}
          <button
            onClick={() => onDietaryChange('non-veg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              dietaryFilter === 'non-veg'
                ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-rose-400'
            }`}
          >
            <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-rose-500" />
            <span>Non-Veg (Biryani)</span>
          </button>

          {/* Bestseller */}
          <button
            onClick={onToggleBestsellers}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              onlyBestsellers
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-amber-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Bestsellers</span>
          </button>
        </div>

        {/* Count and Reset */}
        <div className="flex items-center gap-3 text-xs text-slate-400 ml-auto">
          <span>
            Showing <strong className="text-white">{totalFilteredCount}</strong> items
          </span>
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-orange-400 hover:underline font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
