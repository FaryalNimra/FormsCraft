'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface RatingScaleProps {
  id: string;
  label: string;
  maxRating?: number;
  required?: boolean;
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export default function RatingScale({
  id,
  label,
  maxRating = 5,
  required = false,
  value,
  onChange,
  error,
}: RatingScaleProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <Star size={16} className="text-blue-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600/70">
          Rating Scale
        </span>
      </div>
      
      <p className="text-lg font-semibold text-gray-900 mb-4">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      
      <div className="flex gap-2" role="radiogroup" aria-labelledby={`${id}-label`}>
        {Array.from({ length: maxRating }).map((_, index) => {
          const ratingValue = index + 1;
          const isActive = (hoverValue ?? value) >= ratingValue;
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange(ratingValue)}
              onMouseEnter={() => setHoverValue(ratingValue)}
              onMouseLeave={() => setHoverValue(null)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-yellow-50 border-2 border-yellow-400 text-yellow-400'
                  : 'bg-gray-50 border-2 border-gray-100 text-gray-300 hover:border-yellow-200'
              }`}
              aria-label={`Rate ${ratingValue} out of ${maxRating}`}
            >
              <Star
                size={24}
                fill={isActive ? 'currentColor' : 'none'}
              />
            </button>
          );
        })}
      </div>
      
      {value > 0 && (
        <p className="mt-3 text-sm text-gray-500">
          You rated: <span className="font-semibold text-yellow-600">{value}</span> out of {maxRating}
        </p>
      )}
      
      {error && (
        <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
