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
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive
                ? 'bg-gray-100 border-2 border-gray-900 text-gray-900'
                : 'bg-gray-100/50 border-2 border-gray-200 text-gray-400 hover:border-gray-400'
                }`}
              aria-label={`Rate ${ratingValue} out of ${maxRating}`}
            >
              <Star
                size={24}
                fill={isActive ? 'black' : 'none'}
                className={isActive ? 'text-black' : 'text-gray-500'}
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
