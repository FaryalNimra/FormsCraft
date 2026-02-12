'use client';

import { CheckSquare } from 'lucide-react';

interface CheckboxesProps {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  value: string[]; // Array of selected options
  onChange: (value: string[]) => void;
  error?: string;
}

export default function Checkboxes({
  id,
  label,
  options = [],
  required = false,
  value = [],
  onChange,
  error,
}: CheckboxesProps) {
  const handleChange = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...value, option]);
    } else {
      onChange(value.filter((v) => v !== option));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <CheckSquare size={16} className="text-blue-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600/70">
          Checkboxes
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
              value.includes(option)
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            <input
              type="checkbox"
              name={`${id}-${index}`}
              checked={value.includes(option)}
              onChange={(e) => handleChange(option, e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
