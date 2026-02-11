'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getForm, saveResponse, Form, FormElement } from '@/lib/forms';
import {
    Star,
    Calendar,
    Upload,
    CheckCircle2,
    Loader2
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
            alert('Failed to submit form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Form Not Found</h1>
                    <p className="text-gray-500 mb-6">{error || 'This form might have been deleted or the link is incorrect.'}</p>
                    <a href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Go Home
                    </a>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-3xl shadow-xl shadow-blue-100/50 text-center max-w-xl w-full animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 size={48} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Response Submitted!</h1>
                    <p className="text-gray-500 text-lg mb-10">Your response has been recorded. Thank you for taking the time to fill out this form.</p>
                    <button
                        onClick={() => {
                            setSubmitted(false);
                            setResponses({});
                        }}
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Submit another response
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="max-w-3xl mx-auto pt-12 px-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form Header */}
                    <div className="bg-purple-600 rounded-2xl p-8 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="relative">
                            <h1 className="text-3xl font-bold mb-3">{form.title}</h1>
                            {form.description && <p className="text-purple-100 text-lg">{form.description}</p>}
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20"></div>
                    </div>

                    {/* Form Elements */}
                    <div className="space-y-4">
                        {form.elements.map((el) => (
                            <div key={el.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                <label className="block text-lg font-semibold text-gray-900 mb-4">
                                    {el.label}
                                    {el.required && <span className="text-red-500 ml-1">*</span>}
                                </label>

                                {el.type === 'short_answer' && (
                                    <input
                                        type="text"
                                        required={el.required}
                                        placeholder={el.placeholder}
                                        value={responses[el.id] || ''}
                                        onChange={(e) => handleInputChange(el.id, e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    />
                                )}

                                {el.type === 'paragraph' && (
                                    <textarea
                                        required={el.required}
                                        placeholder={el.placeholder}
                                        rows={4}
                                        value={responses[el.id] || ''}
                                        onChange={(e) => handleInputChange(el.id, e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none"
                                    />
                                )}

                                {(el.type === 'multiple_choice') && (
                                    <div className="space-y-3">
                                        {el.options?.map((opt, i) => (
                                            <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-gray-50 cursor-pointer transition-colors group">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${responses[el.id] === opt ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                                    {responses[el.id] === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={el.id}
                                                    required={el.required}
                                                    className="hidden"
                                                    checked={responses[el.id] === opt}
                                                    onChange={() => handleInputChange(el.id, opt)}
                                                />
                                                <span className={`text-base font-medium transition-colors ${responses[el.id] === opt ? 'text-blue-600' : 'text-gray-600'}`}>
                                                    {opt}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {el.type === 'checkboxes' && (
                                    <div className="space-y-3">
                                        {el.options?.map((opt, i) => {
                                            const currentValues = responses[el.id] || [];
                                            const isChecked = currentValues.includes(opt);

                                            return (
                                                <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-gray-50 cursor-pointer transition-colors group">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isChecked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                                        {isChecked && <div className="w-3 h-3 text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>}
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
                                                    <span className={`text-base font-medium transition-colors ${isChecked ? 'text-blue-600' : 'text-gray-600'}`}>
                                                        {opt}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {el.type === 'dropdown' && (
                                    <select
                                        required={el.required}
                                        value={responses[el.id] || ''}
                                        onChange={(e) => handleInputChange(el.id, e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none"
                                    >
                                        <option value="" disabled>{el.placeholder || 'Select an option'}</option>
                                        {el.options?.map((opt, i) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                )}

                                {el.type === 'date' && (
                                    <div className="relative">
                                        <input
                                            type="date"
                                            required={el.required}
                                            value={responses[el.id] || ''}
                                            onChange={(e) => handleInputChange(el.id, e.target.value)}
                                            className="w-full px-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                        />
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" size={20} />
                                    </div>
                                )}

                                {el.type === 'file_upload' && (
                                    <div className="w-full p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400">
                                        <Upload size={24} className="text-blue-500" />
                                        <div className="text-center">
                                            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-1">Upload functionality</span>
                                            <span className="text-xs text-gray-400">(Saving files coming soon - enter file name for now)</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Enter filename..."
                                            value={responses[el.id] || ''}
                                            onChange={(e) => handleInputChange(el.id, e.target.value)}
                                            className="mt-2 w-full max-w-xs px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                )}

                                {el.type === 'rating_scale' && (
                                    <div className="flex flex-wrap gap-3">
                                        {Array.from({ length: el.maxRating || 5 }).map((_, i) => {
                                            const rating = i + 1;
                                            const isSelected = responses[el.id] >= rating;
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => handleInputChange(el.id, rating)}
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${isSelected
                                                            ? 'bg-yellow-50 text-yellow-500 border-yellow-200 shadow-sm'
                                                            : 'bg-gray-50 text-gray-300 border-gray-100 hover:text-yellow-400 hover:bg-yellow-50'
                                                        } border`}
                                                >
                                                    <Star size={24} fill={isSelected ? 'currentColor' : 'none'} />
                                                </button>
                                            );
                                        })}
                                        {responses[el.id] && (
                                            <span className="ml-2 flex items-center text-sm font-bold text-yellow-600">
                                                {responses[el.id]} / {el.maxRating || 5}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <span>Submit Form</span>
                            )}
                        </button>
                        <p className="text-center text-gray-400 text-sm mt-6">
                            Powered by <span className="font-bold text-gray-600">Formcraft</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
