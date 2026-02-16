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
    placeholder = 'mm/dd/yyyy',
    required = false,
    value,
    onChange,
    error,
}: DatePickerProps) {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all">
            <label htmlFor={id} className="block text-base font-medium text-gray-900 mb-4 leading-normal">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </label>
            <div className="relative max-w-xs">
                <input
                    id={id}
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none"
                    required={required}
                />
                <Calendar
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
}
