'use client';

import { XCircle } from 'lucide-react';

interface MultipleChoiceProps {
    id: string;
    label: string;
    options: string[];
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function MultipleChoice({
    id,
    label,
    options,
    required = false,
    value,
    onChange,
    error,
}: MultipleChoiceProps) {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all">
            <p className="text-base font-medium text-gray-900 mb-4 leading-normal break-words">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </p>
            <div className="space-y-3">
                {options.map((option, index) => (
                    <label
                        key={index}
                        className={`flex items-center gap-3 cursor-pointer group p-2 rounded-lg transition-all ${value === option ? 'bg-blue-50' : error ? 'bg-red-50 hover:bg-red-100/50' : 'hover:bg-gray-50'
                            }`}
                    >
                        <div className="relative flex items-center justify-center">
                            <input
                                type="radio"
                                name={id}
                                value={option}
                                checked={value === option}
                                onChange={() => onChange(option)}
                                className="sr-only"
                            />
                            <div
                                className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${value === option
                                    ? 'border-blue-600'
                                    : error
                                        ? 'border-red-300 group-hover:border-red-400'
                                        : 'border-gray-300 group-hover:border-gray-400'
                                    }`}
                            >
                                {value === option && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                                )}
                            </div>
                        </div>
                        <span className="text-sm font-normal text-gray-800 break-words">{option}</span>
                    </label>
                ))}
            </div>
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="mt-3 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Clear selection
                </button>
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
