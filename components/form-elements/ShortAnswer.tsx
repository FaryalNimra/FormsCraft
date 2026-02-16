'use client';

import { Type } from 'lucide-react';

interface ShortAnswerProps {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function ShortAnswer({
  id,
  label,
  placeholder = 'Enter your answer',
  required = false,
  value,
  onChange,
  error,
}: ShortAnswerProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">


      <label htmlFor={id} className="block text-lg font-semibold text-gray-900 mb-4">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-12 px-4 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all outline-none placeholder:text-gray-500 ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-gray-900 font-medium`}
      />

      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
