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
    Check,
    FormInput,
    Clock
} from 'lucide-react';
import { FormElementRenderer } from '@/components/form-elements';

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
            console.log('Form fetched. Expiration:', data?.expires_at);
            if (data?.expires_at && new Date(data.expires_at) < new Date()) {
                console.log('Form expired! Current time:', new Date().toISOString(), 'Expires at:', data.expires_at);
                setError('Time is up. This form is no longer accepting responses.');
                return;
            }
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

        if (form?.expires_at && new Date(form.expires_at) < new Date()) {
            alert('Time is up. This form is no longer accepting responses.');
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
                                <p className="text-sm font-medium text-white/80 leading-relaxed whitespace-pre-wrap">{form.description}</p>
                            )}
                            {form.expires_at && (
                                <div className="mt-4 flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-wider bg-black/10 w-fit px-3 py-1 rounded-md border border-white/5">
                                    <Clock size={10} className="text-white/40" />
                                    <span>Deadline: {new Date(form.expires_at).toLocaleString([], {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}</span>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-1.5 text-xs text-white/60">
                                <span className="text-white/80">*</span> Indicates required question
                            </div>
                        </div>
                    </div>

                    {/* Question Cards (Google Style) */}
                    <div className="space-y-3">
                        {form.elements.map((el) => (
                            <FormElementRenderer
                                key={el.id}
                                element={{
                                    ...el,
                                    // Ensure it matches the renderer's expected interface (which uses snake_case for some fields)
                                    max_rating: el.maxRating || null,
                                    word_limit: el.wordLimit || null
                                } as any}
                                value={responses[el.id] || null}
                                onChange={(val) => handleInputChange(el.id, val)}
                            />
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
