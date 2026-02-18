
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
}: ShortAnswerProps) {
  const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
  const isOverLimit = wordLimit ? wordCount > wordLimit : false;

  const handleChange = (text: string) => {
    if (wordLimit) {
      const words = text.trim().split(/\s+/);
      if (words.length > wordLimit && text.trim() !== '') {
        // If the new word exceeds the limit, we prevent the update
        // unless the user is deleting characters (which we check by seeing if length decreased, 
        // but here it's cleaner to just check the word count of the resulting string)
        return;
      }
    }
    onChange(text);
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${error ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100'}`}>


      <label htmlFor={id} className="block text-lg font-semibold text-gray-900 mb-4">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-12 px-4 bg-gray-50 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all outline-none placeholder:text-gray-500 ${error ? 'border-red-300 bg-red-50' : isOverLimit ? 'border-red-300' : 'border-gray-200'} text-gray-900 font-medium`}
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
        <p className="mt-4 text-xs text-red-500 font-medium flex items-center gap-1">
          <XCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
