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
  wordLimit?: number;
}

export default function Paragraph({
  id,
  label,
  placeholder = 'Enter your detailed response',
  required = false,
  value,
  onChange,
  error,
  wordLimit,
}: ParagraphProps) {
  const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
  const isOverLimit = wordLimit ? wordCount > wordLimit : false;

  const handleChange = (text: string) => {
    if (wordLimit) {
      const words = text.trim().split(/\s+/);
      if (words.length > wordLimit && text.trim() !== '') {
        return; // block further typing
      }
    }
    onChange(text);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">


      <label htmlFor={id} className="block text-lg font-semibold text-gray-900 mb-4">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <textarea
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all outline-none resize-none placeholder:text-gray-500 ${error ? 'border-red-300 bg-red-50' : isOverLimit ? 'border-red-300' : 'border-gray-200'} text-gray-900 font-medium`}
      />

      {wordLimit && (
        <div className="flex justify-end mt-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${isOverLimit ? 'text-red-500 bg-red-50' : wordCount >= wordLimit * 0.9 ? 'text-amber-500 bg-amber-50' : 'text-gray-400 bg-gray-50'
            }`}>
            {wordCount} / {wordLimit} · {Math.max(0, wordLimit - wordCount)} left
          </span>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
