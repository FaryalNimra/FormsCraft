'use client';

import { Check, XCircle } from 'lucide-react';

interface CheckboxesProps {
    id: string;
    label: string;
    options: string[];
    required?: boolean;
    value: string[];
    onChange: (value: string[]) => void;
    error?: string;
}

export default function Checkboxes({
    id,
    label,
    options,
    required = false,
    value,
    onChange,
    error,
}: CheckboxesProps) {
    const toggleOption = (option: string) => {
        if (value.includes(option)) {
            onChange(value.filter((v) => v !== option));
        } else {
            onChange([...value, option]);
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all">
            <p className="text-base font-medium text-gray-900 mb-4 leading-normal break-words">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </p>
            <div className="space-y-3">
                {options.map((option, index) => {
                    const isChecked = value.includes(option);
                    return (
                        <label
                            key={index}
                            className={`flex items-center gap-3 cursor-pointer group p-2 rounded-lg transition-all ${isChecked ? 'bg-blue-50' : error ? 'bg-red-50 hover:bg-red-100/50' : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    name={`${id}-${index}`}
                                    value={option}
                                    checked={isChecked}
                                    onChange={() => toggleOption(option)}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${isChecked
                                        ? 'border-blue-600 bg-blue-600'
                                        : error ? 'border-red-300 group-hover:border-red-400' : 'border-gray-300 group-hover:border-gray-400'
                                        }`}
                                >
                                    {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                                </div>
                            </div>
                            <span className="text-sm font-normal text-gray-800 break-words">{option}</span>
                        </label>
                    );
                })}
            </div>
            {error && (
                <p className="mt-4 text-xs text-red-500 font-medium flex items-center gap-1">
                    <XCircle size={14} />
                    {error}
                </p>
            )}
        </div>
    );
}
