'use client';

import { useState, useEffect } from 'react';

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
    placeholder = 'Your answer',
    required = false,
    value,
    onChange,
    error,
    wordLimit,
}: ParagraphProps) {
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        if (value) {
            const words = value.trim().split(/\s+/).filter(Boolean);
            setWordCount(words.length);
        } else {
            setWordCount(0);
        }
    }, [value]);

    const handleChange = (newValue: string) => {
        if (wordLimit) {
            const words = newValue.trim().split(/\s+/).filter(Boolean);
            if (words.length > wordLimit) return;
        }
        onChange(newValue);
    };

    const isOverLimit = wordLimit ? wordCount > wordLimit : false;

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all">
            <label htmlFor={id} className="block text-base font-medium text-gray-900 mb-4 leading-normal">
                {label}
                {required && <span className="text-red-600 ml-1">*</span>}
            </label>
            <textarea
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                rows={4}
                className="w-full border-b border-gray-300 py-2 focus:border-b-2 focus:outline-none transition-all text-sm font-normal text-gray-900 placeholder:text-gray-400 bg-transparent resize-none"
                required={required}
            />
            {wordLimit && (
                <div className="flex justify-end mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isOverLimit ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-50'}`}>
                        {wordCount} / {wordLimit} words
                    </span>
                </div>
            )}
            {error && (
                <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
}
