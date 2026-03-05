
import { XCircle } from 'lucide-react';

interface ShortAnswerProps {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  wordLimit?: number;
  charLimit?: number;
}

export default function ShortAnswer({
  id,
  label,
  placeholder = 'Enter your answer',
  required = false,
  value,
  onChange,
  error,
  wordLimit,
  charLimit,
}: ShortAnswerProps) {
  const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
  const isOverLimit = wordLimit ? wordCount > wordLimit : false;

  const handleChange = (text: string) => {
    if (charLimit && text.length > charLimit) {
      return;
    }
    if (wordLimit) {
      const words = text.trim().split(/\s+/);
      if (words.length > wordLimit && text.trim() !== '') {
        return;
      }
    }
    onChange(text);
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${error ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100'}`}>


      <label htmlFor={id} className="block text-base font-semibold text-gray-900 mb-4 break-words">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-12 px-4 bg-gray-50 border-2 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all outline-none placeholder:text-gray-500 ${error ? 'border-red-300 bg-red-50' : isOverLimit ? 'border-red-300' : 'border-gray-200'} text-gray-900 font-medium`}
      />

      {(wordLimit || charLimit) && (
        <div className="flex justify-end mt-1.5 gap-2">
          {charLimit && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md transition-colors ${value.length > charLimit ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-50'}`}>
              {value.length} / {charLimit} chars
            </span>
          )}
          {wordLimit && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md transition-colors ${isOverLimit ? 'text-red-500 bg-red-50' : wordCount >= wordLimit * 0.9 ? 'text-amber-500 bg-amber-50' : 'text-gray-400 bg-gray-50'
              }`}>
              {wordCount} / {wordLimit} words
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500 font-medium flex items-center gap-1">
          <XCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
