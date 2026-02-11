'use client';

import { CircleDot } from 'lucide-react';

interface MultipleChoiceProps {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function MultipleChoice({
  id,
  label,
  options = [],
  required = false,
  value,
  onChange,
  error,
}: MultipleChoiceProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <CircleDot size={16} className="text-blue-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600/70">
          Multiple Choice
        </span>
      </div>
      
      <p className="text-lg font-semibold text-gray-900 mb-4">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      
      <div className="space-y-3">
        {options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              value === option
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            <input
              type="radio"
              name={id}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{option}</span>
          </label>
        ))}
      </div>
      
      {error && (
        <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
