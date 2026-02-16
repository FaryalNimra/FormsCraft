'use client';

import { Calendar } from 'lucide-react';

interface DatePickerProps {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function DatePicker({
  id,
  label,
  placeholder = 'Select a date',
  required = false,
  value,
  onChange,
  error,
}: DatePickerProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">


      <label htmlFor={id} className="block text-lg font-semibold text-gray-900 mb-4">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-12 px-4 pr-10 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all outline-none placeholder:text-gray-500 ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'
            } ${!value ? 'text-gray-500' : 'text-gray-900 font-medium'}`}
        />
        <Calendar
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black pointer-events-none"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
