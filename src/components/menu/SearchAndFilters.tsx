import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { DietaryType } from '../../types/menu';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  dietaryFilter: DietaryType | 'all';
  onDietaryChange: (d: DietaryType | 'all') => void;
  totalFilteredCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  dietaryFilter,
  onDietaryChange,
  totalFilteredCount,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Search input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          id="menu-search"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search dishes..."
          className="w-full pl-9 pr-9 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Diet filter */}
      <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1">
        {([
          { id: 'all', label: 'All' },
          { id: 'veg', label: '🟢 Veg' },
          { id: 'non-veg', label: '🔴 Non-Veg' },
        ] as const).map(opt => (
          <button
            key={opt.id}
            onClick={() => onDietaryChange(opt.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              dietaryFilter === opt.id
                ? 'bg-amber-500 text-gray-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-amber-400 hover:border-amber-500/50 transition-all"
          title="Reset filters"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
