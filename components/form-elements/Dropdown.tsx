'use client';

import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  id: string;
  label: string;
  placeholder?: string;
  options: string[];
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function Dropdown({
  id,
  label,
  placeholder = 'Select an option',
  options = [],
  required = false,
  value,
  onChange,
  error,
}: DropdownProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">


      <label htmlFor={id} className="block text-lg font-semibold text-gray-900 mb-4">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-12 px-4 pr-10 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer placeholder:text-gray-500 ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'} ${!value ? 'text-gray-500' : 'text-gray-900 font-medium'}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={20}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black pointer-events-none"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
