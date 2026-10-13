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
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search within Moonlight Kitchen menu (pizza, burger, sandwich, biryani...)"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={e => onSortChange(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 font-medium"
          >
            <option value="popular">Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* All */}
          <button
            onClick={() => onDietaryChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              dietaryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>

          {/* Pure Veg */}
          <button
            onClick={() => onDietaryChange('veg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
              dietaryFilter === 'veg'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Pure Veg</span>
          </button>

          {/* Non-Veg */}
          <button
            onClick={() => onDietaryChange('non-veg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
              dietaryFilter === 'non-veg'
                ? 'bg-rose-50 border-rose-500 text-rose-800'
                : 'bg-white border-slate-200 text-slate-600 hover:border-rose-500 hover:text-rose-700'
            }`}
          >
            <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-rose-600" />
            <span>Non-Veg (Biryani)</span>
          </button>

          {/* Bestseller */}
          <button
            onClick={onToggleBestsellers}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
              onlyBestsellers
                ? 'bg-amber-50 border-amber-500 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Bestsellers</span>
          </button>
        </div>

        {/* Count and Reset */}
        <div className="flex items-center gap-3 text-xs text-slate-500 ml-auto">
          <span>
            <strong className="text-slate-900">{totalFilteredCount}</strong> dishes
          </span>
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-orange-600 hover:underline font-bold"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
