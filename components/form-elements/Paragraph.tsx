'use client';

import { AlignLeft } from 'lucide-react';

interface ParagraphProps {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function Paragraph({
  id,
  label,
  placeholder = 'Enter your detailed response',
  required = false,
  value,
  onChange,
  error,
}: ParagraphProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <AlignLeft size={16} className="text-blue-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600/70">
          Paragraph
        </span>
      </div>
      
      <label htmlFor={id} className="block text-lg font-semibold text-gray-900 mb-4">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all outline-none resize-none ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
