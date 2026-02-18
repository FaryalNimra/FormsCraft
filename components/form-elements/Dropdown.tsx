'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, XCircle } from 'lucide-react';

interface DropdownProps {
    id: string;
    label: string;
    placeholder?: string;
    options: string[];
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function Dropdown({
    id,
    label,
    placeholder = 'Select an option',
    options,
    required = false,
    value,
    onChange,
    error,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all">
            <p className="text-base font-medium text-gray-900 mb-4 leading-normal break-words">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </p>
            <div className="relative max-w-sm" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-left flex items-center justify-between transition-all ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                >
                    <span className={`break-words ${value ? 'text-gray-900 font-normal' : 'text-gray-400'}`}>
                        {value || placeholder}
                    </span>
                    <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${value === option
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="break-words">{option}</span>
                                {value === option && <Check size={16} className="text-blue-600" />}
                            </button>
                        ))}
                    </div>
                )}
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
