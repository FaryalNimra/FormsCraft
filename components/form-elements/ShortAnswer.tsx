'use client';

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
    placeholder = 'Your answer',
    required = false,
    value,
    onChange,
    error,
}: ShortAnswerProps) {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all">
            <label htmlFor={id} className="block text-base font-medium text-gray-900 mb-4 leading-normal">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </label>
            <input
                id={id}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border-b border-gray-300 py-2 focus:border-b-2 focus:outline-none transition-all text-sm font-normal text-gray-900 placeholder:text-gray-400 bg-transparent"
                required={required}
            />
            {error && (
                <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
}
