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
    XCircle,
    Check
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
            alert(`Please fill in required fields`);
            return;
        }

        setIsSubmitting(true);
        try {
            await saveResponse(id as string, responses);
            setSubmitted(true);
        } catch (err: any) {
            console.error('Error submitting form:', err);
            alert('Failed to submit form');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F0EBF8] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: form?.theme_color || '#2563eb' }} />
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="min-h-screen bg-[#F0EBF8] flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm text-center max-w-sm w-full border border-gray-200 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                    <div className="p-8">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle size={24} />
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 mb-2">Form Not Found</h1>
                        <p className="text-gray-500 text-xs mb-6">{error || 'The link you followed might be broken.'}</p>
                        <a
                            href="/"
                            className="inline-block px-6 py-2 text-white rounded font-medium text-xs transition-colors hover:opacity-90 shadow-sm"
                            style={{ backgroundColor: form?.theme_color || '#2563eb' }}
                        >
                            Go back
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#F0EBF8] flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-lg shadow-sm text-left max-w-2xl w-full border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2.5" style={{ backgroundColor: (!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color }}></div>
                    <h1 className="text-3xl font-medium text-gray-900 mb-4">{form.title}</h1>
                    <p className="text-gray-700 font-normal mb-8 leading-relaxed">Your response has been recorded.</p>
                    <div className="flex flex-col items-start gap-4">
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setResponses({});
                            }}
                            className="text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-all select-none"
                            style={{ color: (!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color }}
                        >
                            Submit another response
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0EBF8] pb-12">
            <div className="max-w-2xl mx-auto pt-6 px-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Google Forms Header Card */}
                    <div className="rounded-2xl shadow-lg border border-transparent relative overflow-hidden mb-4 transition-all"
                        style={{
                            backgroundColor: (!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color,
                            backgroundImage: (!form.theme_color || form.theme_color === '#2563eb')
                                ? 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)'
                                : `linear-gradient(135deg, ${form.theme_color} 0%, ${(form.theme_color)}ee 100%)`
                        }}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                        <div className="p-8 pt-10 text-white">
                            <h1 className="text-3xl font-extrabold mb-3 tracking-tight">{form.title}</h1>
                            {form.description && (
                                <p className="text-sm font-medium text-white/80 leading-relaxed">{form.description}</p>
                            )}
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-1.5 text-xs text-white/60">
                                <span className="text-white/80">*</span> Indicates required question
                            </div>
                        </div>
                    </div>

                    {/* Question Cards (Google Style) */}
                    <div className="space-y-3">
                        {form.elements.map((el) => (
                            <div key={el.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all">
                                <label className="block text-base font-medium text-gray-900 mb-6 leading-normal">
                                    {el.label}
                                    {el.required && <span className="text-red-600 ml-1">*</span>}
                                </label>

                                {el.type === 'short_answer' && (
                                    <div className="group relative">
                                        <input
                                            type="text"
                                            required={el.required}
                                            placeholder="Your answer"
                                            value={responses[el.id] || ''}
                                            onChange={(e) => handleInputChange(el.id, e.target.value)}
                                            className="w-full border-b border-gray-300 py-2 focus:border-b-2 focus:outline-none transition-all text-sm font-normal text-gray-900 placeholder:text-gray-400 bg-transparent"
                                            style={{
                                                borderBottomColor: responses[el.id]
                                                    ? ((!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color)
                                                    : undefined
                                            }}
                                        />
                                    </div>
                                )}

                                {el.type === 'paragraph' && (
                                    <div className="group relative">
                                        <textarea
                                            required={el.required}
                                            placeholder="Your answer"
                                            rows={1}
                                            value={responses[el.id] || ''}
                                            onChange={(e) => handleInputChange(el.id, e.target.value)}
                                            className="w-full border-b border-gray-300 py-2 focus:border-b-2 focus:outline-none transition-all text-sm font-normal text-gray-900 placeholder:text-gray-400 bg-transparent overflow-hidden resize-none min-h-[40px] leading-relaxed"
                                            style={{
                                                borderBottomColor: responses[el.id]
                                                    ? ((!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color)
                                                    : undefined
                                            }}
                                        />
                                    </div>
                                )}

                                {(el.type === 'multiple_choice') && (
                                    <div className="space-y-4">
                                        {el.options?.map((opt, i) => (
                                            <label key={i} className="flex items-center gap-3 cursor-pointer group w-fit">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${responses[el.id] === opt ? '' : 'border-gray-300 group-hover:border-gray-400'
                                                    }`}
                                                    style={{
                                                        borderColor: responses[el.id] === opt
                                                            ? ((!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color)
                                                            : undefined
                                                    }}
                                                >
                                                    {responses[el.id] === opt && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: (!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color }}></div>}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={el.id}
                                                    required={el.required}
                                                    className="hidden"
                                                    checked={responses[el.id] === opt}
                                                    onChange={() => handleInputChange(el.id, opt)}
                                                />
                                                <span className="text-sm font-normal text-gray-800">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {el.type === 'checkboxes' && (
                                    <div className="space-y-4">
                                        {el.options?.map((opt, i) => {
                                            const currentValues = responses[el.id] || [];
                                            const isChecked = currentValues.includes(opt);

                                            return (
                                                <label key={i} className="flex items-center gap-3 cursor-pointer group w-fit">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isChecked ? '' : 'border-gray-300 group-hover:border-gray-400'
                                                        }`}
                                                        style={{
                                                            borderColor: isChecked ? ((!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color) : undefined,
                                                            backgroundColor: isChecked ? ((!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color) : undefined
                                                        }}
                                                    >
                                                        {isChecked && <Check size={14} strokeWidth={4} className="text-white" />}
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
                                                    <span className="text-sm font-normal text-gray-800">{opt}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {el.type === 'dropdown' && (
                                    <div className="relative max-w-xs">
                                        <select
                                            required={el.required}
                                            value={responses[el.id] || ''}
                                            onChange={(e) => handleInputChange(el.id, e.target.value)}
                                            className="w-full pl-3 pr-10 py-3 bg-white border border-gray-300 rounded focus:outline-none appearance-none text-sm font-normal text-gray-800"
                                            style={{
                                                borderColor: responses[el.id]
                                                    ? ((!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color)
                                                    : undefined
                                            }}
                                        >
                                            <option value="" disabled>Choose</option>
                                            {el.options?.map((opt, i) => (
                                                <option key={i} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                                    </div>
                                )}

                                {el.type === 'date' && (
                                    <input
                                        type="date"
                                        required={el.required}
                                        value={responses[el.id] || ''}
                                        onChange={(e) => handleInputChange(el.id, e.target.value)}
                                        className="w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded focus:outline-none text-sm font-normal text-gray-800"
                                        style={{
                                            borderColor: responses[el.id]
                                                ? ((!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color)
                                                : undefined
                                        }}
                                    />
                                )}

                                {el.type === 'rating_scale' && (
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <span className="text-xs text-gray-500">Poor</span>
                                        <div className="flex gap-1">
                                            {Array.from({ length: el.maxRating || 5 }).map((_, i) => {
                                                const rating = i + 1;
                                                const isSelected = responses[el.id] === rating;
                                                return (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => handleInputChange(el.id, rating)}
                                                        className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all ${isSelected ? 'text-white' : 'hover:bg-gray-100 text-gray-600'
                                                            }`}
                                                        style={{
                                                            backgroundColor: isSelected
                                                                ? ((!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color)
                                                                : undefined
                                                        }}
                                                    >
                                                        <span className="text-xs font-medium">{rating}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <span className="text-xs text-gray-500">Excellent</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 flex flex-col items-start gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-white rounded shadow-sm font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 hover:opacity-90 active:scale-95 px-8"
                            style={{
                                backgroundColor: (!form.theme_color || form.theme_color === '#2563eb')
                                    ? 'var(--primary-600)'
                                    : form.theme_color
                            }}
                        >
                            {isSubmitting ? 'Sending...' : 'Submit'}
                        </button>

                        <div className="flex items-center gap-1.5 opacity-50 text-[10px] text-gray-500 font-medium select-none mt-2">
                            <span>Never submit passwords through Formcraft.</span>
                        </div>
                    </div>
                </form>
            </div>

            <footer className="max-w-2xl mx-auto px-4 mt-12 mb-8 text-center opacity-30">
                <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 tracking-tight">Formcraft</span>
                    <span className="text-[10px] font-normal text-gray-500">Forms</span>
                </div>
            </footer>
        </div>
    );
}
