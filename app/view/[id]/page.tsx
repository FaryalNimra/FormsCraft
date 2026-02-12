'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getForm, saveResponse, Form, FormElement } from '@/lib/forms';
import {
    Star,
    Calendar,
    Upload,
    CheckCircle2,
    Loader2,
    ChevronDown,
    ArrowRight,
    XCircle
} from 'lucide-react';

export default function ViewForm() {
    const { id } = useParams();
    const [form, setForm] = useState<Form | null>(null);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchForm();
        }
    }, [id]);

    const fetchForm = async () => {
        try {
            const data = await getForm(id as string);
            setForm(data);
        } catch (err: any) {
            console.error('Error fetching form:', err);
            setError(err.message || 'Failed to load form');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (elementId: string, value: any) => {
        setResponses(prev => ({
            ...prev,
            [elementId]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        const missingRequired = form?.elements.filter(el => el.required && !responses[el.id]);
        if (missingRequired && missingRequired.length > 0) {
            alert(`Please fill in required fields: ${missingRequired.map(el => el.label).join(', ')}`);
            return;
        }

        setIsSubmitting(true);
        try {
            await saveResponse(id as string, responses);
            setSubmitted(true);
        } catch (err: any) {
            console.error('Error submitting form:', err);
            alert('Failed to submit form: ' + (err.message || 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-2xl shadow-sm text-center max-w-sm w-full border border-gray-100">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={32} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Form Not Found</h1>
                    <p className="text-gray-400 text-xs mb-8">{error || 'The link you followed might be broken.'}</p>
                    <a href="/" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all">
                        Return Home
                    </a>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-[2rem] shadow-sm text-center max-w-lg w-full border border-gray-50 animate-in fade-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight mb-2">Success!</h1>
                    <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed">Your response has been securely transmitted.</p>
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setResponses({});
                            }}
                            className="px-10 py-3 bg-blue-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm"
                        >
                            Submit New Response
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            <div className="max-w-2xl mx-auto pt-12 px-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Compact Form Header */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group mb-8">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
                        <div className="relative">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2 uppercase">{form.title}</h1>
                            {form.description && <p className="text-gray-400 text-xs font-medium leading-relaxed">{form.description}</p>}
                        </div>
                    </div>

                    {/* Dynamically Rendered Elements */}
                    <div className="space-y-4">
                        {form.elements.map((el, index) => (
                            <div key={el.id} className="bg-white rounded-xl p-8 shadow-sm border border-gray-50 transition-all hover:bg-gray-50/10">
                                <label className="block text-sm font-bold text-gray-900 mb-6 tracking-tight">
                                    <span className="text-blue-500 mr-2 opacity-40 uppercase">{(index + 1).toString().padStart(2, '0')}.</span>
                                    {el.label}
                                    {el.required && <span className="text-blue-600 ml-1 font-black">*</span>}
                                </label>

                                {el.type === 'short_answer' && (
                                    <input
                                        type="text"
                                        required={el.required}
                                        placeholder={el.placeholder}
                                        value={responses[el.id] || ''}
                                        onChange={(e) => handleInputChange(el.id, e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all outline-none font-semibold text-gray-900 text-sm"
                                    />
                                )}

                                {el.type === 'paragraph' && (
                                    <textarea
                                        required={el.required}
                                        placeholder={el.placeholder}
                                        rows={4}
                                        value={responses[el.id] || ''}
                                        onChange={(e) => handleInputChange(el.id, e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all outline-none resize-none font-semibold text-gray-900 text-sm leading-relaxed"
                                    />
                                )}

                                {(el.type === 'multiple_choice') && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {el.options?.map((opt, i) => (
                                            <label key={i} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${responses[el.id] === opt ? 'bg-blue-50/30 border-blue-600 shadow-sm' : 'bg-gray-50/50 border-gray-50 hover:border-gray-100 hover:bg-gray-50'
                                                }`}>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${responses[el.id] === opt ? 'border-blue-600 bg-blue-600' : 'border-gray-200'
                                                    }`}>
                                                    {responses[el.id] === opt && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={el.id}
                                                    required={el.required}
                                                    className="hidden"
                                                    checked={responses[el.id] === opt}
                                                    onChange={() => handleInputChange(el.id, opt)}
                                                />
                                                <span className={`text-xs font-bold transition-colors ${responses[el.id] === opt ? 'text-blue-600' : 'text-gray-600'}`}>
                                                    {opt}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {el.type === 'checkboxes' && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {el.options?.map((opt, i) => {
                                            const currentValues = responses[el.id] || [];
                                            const isChecked = currentValues.includes(opt);

                                            return (
                                                <label key={i} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${isChecked ? 'bg-blue-50/30 border-blue-600 shadow-sm' : 'bg-gray-50/50 border-gray-50 hover:border-gray-100 hover:bg-gray-50'
                                                    }`}>
                                                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${isChecked ? 'border-blue-600 bg-blue-600' : 'border-gray-200'
                                                        }`}>
                                                        {isChecked && <Check size={10} strokeWidth={4} className="text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            const newValue = e.target.checked
                                                                ? [...currentValues, opt]
                                                                : currentValues.filter((v: string) => v !== opt);
                                                            handleInputChange(el.id, newValue);
                                                        }}
                                                    />
                                                    <span className={`text-xs font-bold transition-colors ${isChecked ? 'text-blue-600' : 'text-gray-600'}`}>
                                                        {opt}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {el.type === 'dropdown' && (
                                    <div className="relative">
                                        <select
                                            required={el.required}
                                            value={responses[el.id] || ''}
                                            onChange={(e) => handleInputChange(el.id, e.target.value)}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all outline-none appearance-none font-bold text-gray-900 text-xs"
                                        >
                                            <option value="" disabled>{el.placeholder || 'Select...'}</option>
                                            {el.options?.map((opt, i) => (
                                                <option key={i} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                )}

                                {el.type === 'date' && (
                                    <input
                                        type="date"
                                        required={el.required}
                                        value={responses[el.id] || ''}
                                        onChange={(e) => handleInputChange(el.id, e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all outline-none font-bold text-gray-900 text-xs"
                                    />
                                )}

                                {el.type === 'rating_scale' && (
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from({ length: el.maxRating || 5 }).map((_, i) => {
                                            const rating = i + 1;
                                            const isSelected = responses[el.id] >= rating;
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => handleInputChange(el.id, rating)}
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isSelected
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'bg-gray-50 text-gray-300 border border-gray-50 hover:text-yellow-400 hover:bg-yellow-50'
                                                        }`}
                                                >
                                                    <Star size={20} fill={isSelected ? 'currentColor' : 'none'} strokeWidth={isSelected ? 0 : 2} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-10 flex flex-col items-center gap-8">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full max-w-xs py-4 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Submit Data</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <div className="flex items-center gap-2 opacity-30 select-none">
                            <div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center text-white text-[8px] font-black">F</div>
                            <span className="text-[10px] font-black text-gray-900 tracking-tighter uppercase">Formcraft</span>
                        </div>
                    </div>
                </form>
            </div>

            {/* Minimal Progress indicator */}
            {form.elements.length > 0 && (
                <div className="fixed bottom-6 right-6 z-[100] hidden md:block">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{Object.keys(responses).length} / {form.elements.length}</span>
                        <div className="w-24 h-1 px bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${(Object.keys(responses).length / form.elements.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Check({ size, strokeWidth, className }: { size: number, strokeWidth: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
