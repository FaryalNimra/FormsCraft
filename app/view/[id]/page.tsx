'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getForm, saveResponse, getUserResponse, Form, FormElement } from '@/lib/forms';
import { getCurrentUser, signInWithGoogle } from '@/lib/auth';
import { User } from '@supabase/supabase-js';
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
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [user, setUser] = useState<User | null>(null);
    const [userEmail, setUserEmail] = useState('');
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            if (currentUser?.email) setUserEmail(currentUser.email);
            setIsCheckingAuth(false);
        };
        checkAuth();
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

            // Check if user has already submitted and handle editing
            const currentUser = await getCurrentUser();
            if (currentUser && data.id && currentUser.email) {
                const previousResponse = await getUserResponse(data.id, currentUser.email);
                if (previousResponse) {
                    if (data.allow_response_editing) {
                        setResponses(previousResponse.answers);
                        if (previousResponse.user_email) setUserEmail(previousResponse.user_email);
                        setIsEditing(true);
                    } else if (data.limit_to_one_response) {
                        setAlreadySubmitted(true);
                    }
                }
            }
        } catch (err: any) {
            console.error('Error fetching form details:', {
                message: err.message,
                stack: err.stack,
                id
            });
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
        // Clear error when user interacts
        if (validationErrors[elementId]) {
            setValidationErrors(prev => {
                const next = { ...prev };
                delete next[elementId];
                return next;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        const errors: Record<string, string> = {};
        form?.elements.forEach(el => {
            const val = responses[el.id];
            // Treat undefined, null, empty string, empty array, or 0 (for rating) as empty
            const isEmpty = val === undefined || val === null || val === '' ||
                (Array.isArray(val) && val.length === 0) ||
                (typeof val === 'number' && val === 0);

            if (el.required && isEmpty) {
                errors[el.id] = 'This is a required question';
            }
        });

        if (form?.collect_email && !userEmail) {
            errors['email'] = 'Email address is required';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            // Scroll to first error
            const firstErrorId = Object.keys(errors)[0];
            const element = document.getElementById(`question-${firstErrorId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        if (form?.expires_at && new Date(form.expires_at) < new Date()) {
            alert('Time is up. This form is no longer accepting responses.');
            return;
        }

        setIsSubmitting(true);
        try {
            await saveResponse(id as string, responses, form?.collect_email ? userEmail : undefined, user?.id);
            setSubmitted(true);
        } catch (err: any) {
            console.error('Error submitting form:', err);
            const errorMessage = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
            if (errorMessage === "ALREADY_SUBMITTED") {
                setAlreadySubmitted(true);
            } else {
                alert(`Failed to submit form: ${errorMessage}`);
            }
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
                                setUserEmail('');
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

    if (alreadySubmitted) {
        return (
            <div className="min-h-screen bg-[#F0EBF8] flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm text-center max-w-md w-full border border-gray-200 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
                    <div className="p-8">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle size={24} />
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 mb-2">Already Submitted</h1>
                        <p className="text-gray-500 text-xs mb-6">You have already submitted a response for this form. Responses are limited to one per person.</p>
                        {form.allow_response_editing && (
                            <button
                                onClick={() => setAlreadySubmitted(false)}
                                className="inline-block px-6 py-2 text-white rounded font-medium text-xs transition-colors hover:opacity-90 shadow-sm"
                                style={{ backgroundColor: form?.theme_color || '#2563eb' }}
                            >
                                Edit your response
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if ((form.limit_to_one_response || form.allow_response_editing) && !user) {
        return (
            <div className="min-h-screen bg-[#F0EBF8] flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm text-center max-w-md w-full border border-gray-200 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: form.theme_color || '#2563eb' }}></div>
                    <div className="p-8">
                        <h1 className="text-xl font-bold text-gray-900 mb-2 capitalize">{form.title}</h1>
                        <p className="text-gray-500 text-xs mb-8">Sign in with Google to continue. Your identity will be used to limit responses to one per person.</p>
                        <button
                            onClick={() => signInWithGoogle()}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg font-bold text-xs text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                            Sign in with Google
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0EBF8] pb-12">
            <div className="max-w-2xl mx-auto pt-6 px-4">
                <form onSubmit={handleSubmit} className="space-y-3" noValidate>
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

                    {/* Email Collection Field */}
                    {form.collect_email && (
                        <div
                            id="question-email"
                            className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${validationErrors['email'] ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100'}`}
                        >
                            <label className="block text-base font-medium text-gray-900 mb-4 leading-normal">
                                Email Address <span className="text-red-600 ml-1">*</span>
                                <p className="text-[10px] text-gray-500 font-normal mt-1 uppercase tracking-tight">Your email will be recorded with this response</p>
                            </label>
                            <div className="group relative">
                                <input
                                    type="email"
                                    placeholder="your-email@example.com"
                                    value={userEmail}
                                    onChange={(e) => {
                                        setUserEmail(e.target.value);
                                        if (validationErrors['email']) {
                                            setValidationErrors(prev => {
                                                const next = { ...prev };
                                                delete next['email'];
                                                return next;
                                            });
                                        }
                                    }}
                                    className={`w-full border-b py-2 focus:border-b-2 focus:outline-none transition-all text-sm font-normal text-gray-900 placeholder:text-gray-400 bg-transparent ${validationErrors['email'] ? 'border-red-500' : 'border-gray-300'}`}
                                    style={{
                                        borderBottomColor: validationErrors['email']
                                            ? '#ef4444'
                                            : userEmail
                                                ? ((!form.theme_color || form.theme_color === '#2563eb') ? 'var(--primary-600)' : form.theme_color)
                                                : undefined
                                    }}
                                />
                            </div>
                            {validationErrors['email'] && (
                                <p className="mt-4 text-xs text-red-500 font-medium flex items-center gap-1">
                                    <XCircle size={14} />
                                    {validationErrors['email']}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Question Cards (Google Style) */}
                    <div className="space-y-3">
                        {form.elements.map((el) => (
                            <div key={el.id} id={`question-${el.id}`}>
                                <FormElementRenderer
                                    element={{
                                        ...el,
                                        max_rating: el.maxRating || null,
                                        word_limit: el.wordLimit || null
                                    } as any}
                                    value={responses[el.id] || null}
                                    onChange={(val) => handleInputChange(el.id, val)}
                                    error={validationErrors[el.id]}
                                />
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
                            {isSubmitting ? 'Sending...' : (isEditing ? 'Update Response' : 'Submit')}
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
