import React from 'react';
import { DietaryType } from '../../types/menu';

interface DietaryBadgeProps {
  type: DietaryType;
  showLabel?: boolean;
  className?: string;
}

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({ type, showLabel = false, className = '' }) => {
  const isVeg = type === 'veg';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`w-4 h-4 rounded-sm flex items-center justify-center border ${
          isVeg ? 'border-emerald-500 bg-emerald-950/40' : 'border-rose-600 bg-rose-950/40'
        }`}
        title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      >
        {isVeg ? (
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        ) : (
          <span
            className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-rose-600"
          />
        )}
      </span>
      {showLabel && (
        <span className={`text-xs font-medium ${isVeg ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isVeg ? 'VEG' : 'NON-VEG'}
        </span>
      )}
    </div>
  );
};
