'use client';

import { useState } from 'react';
import { Star, XCircle } from 'lucide-react';

interface RatingScaleProps {
    id: string;
    label: string;
    maxRating: number;
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
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all">
            <p className="text-base font-medium text-gray-900 mb-4 leading-normal break-words">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </p>
            <div className="flex flex-wrap gap-2 items-center">
                {Array.from({ length: maxRating }).map((_, i) => {
                    const rating = i + 1;
                    const isActive = rating <= (hovered !== null ? hovered : value);

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onChange(rating === value ? 0 : rating)}
                            onMouseEnter={() => setHovered(rating)}
                            onMouseLeave={() => setHovered(null)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive
                                ? 'bg-amber-100 text-amber-500 scale-110'
                                : error
                                    ? 'bg-red-50 text-red-400 border border-red-200'
                                    : 'bg-gray-50 text-gray-300 hover:bg-gray-100 border border-gray-100'
                                }`}
                            aria-label={`Rate ${rating} out of ${maxRating}`}
                        >
                            <Star
                                size={20}
                                fill={isActive ? 'currentColor' : 'none'}
                                strokeWidth={isActive ? 0 : 1.5}
                            />
                        </button>
                    );
                })}
                {value > 0 && (
                    <span className="ml-2 text-xs font-bold text-gray-400">{value}/{maxRating}</span>
                )}
            </div>
            {error && (
                <p className="mt-4 text-xs text-red-500 font-medium flex items-center gap-1">
                    <XCircle size={14} />
                    {error}
                </p>
            )}
        </div>
    );
}
