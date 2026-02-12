'use client';

import {
    Type,
    AlignLeft,
    CircleDot,
    CheckSquare,
    ChevronDown,
    Calendar,
    Upload,
    Star,
    Settings,
    Eye,
    Save,
    Send,
    ArrowLeft,
    X,
    Trash2,
    Plus,
    GripVertical,
    Copy
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { saveForm, FormElement, ElementType } from '@/lib/forms';

// Types are now imported from @/lib/forms

const ELEMENT_ICONS: Record<ElementType, any> = {
    short_answer: Type,
    paragraph: AlignLeft,
    multiple_choice: CircleDot,
    checkboxes: CheckSquare,
    dropdown: ChevronDown,
    date: Calendar,
    file_upload: Upload,
    rating_scale: Star,
};

const ELEMENT_LABELS: Record<ElementType, string> = {
    short_answer: 'Short Answer',
    paragraph: 'Paragraph',
    multiple_choice: 'Multiple Choice',
    checkboxes: 'Checkboxes',
    dropdown: 'Dropdown',
    date: 'Date',
    file_upload: 'File Upload',
    rating_scale: 'Rating Scale',
};

export default function FormBuilder() {
    const [formId, setFormId] = useState<string | null>(null);
    const [title, setTitle] = useState('Untitled Form');
    const [description, setDescription] = useState('Form description (optional)');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isLocalSaved, setIsLocalSaved] = useState(false);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [formElements, setFormElements] = useState<FormElement[]>([
        { id: '1', type: 'short_answer', label: 'Text Input', placeholder: 'Enter your answer', required: false }
    ]);
    const [activeElementId, setActiveElementId] = useState<string | null>('1');

    useEffect(() => {
        setIsMounted(true);
        // Load progress from localStorage on mount
        const savedProgress = localStorage.getItem('formcraft_progress');
        if (savedProgress && !formId) {
            try {
                const { title: st, description: sd, elements: se } = JSON.parse(savedProgress);
                setTitle(st);
                setDescription(sd);
                setFormElements(se);
                if (se.length > 0) setActiveElementId(se[0].id);
            } catch (e) {
                console.error('Failed to load local progress:', e);
            }
        }
    }, [formId]);

    const triggerSave = useCallback(async (currentData: { id: string | null, title: string, description: string, elements: FormElement[], status: 'draft' | 'published' }) => {
        setIsSaving(true);
        try {
            const saved = await saveForm({
                id: currentData.id || undefined,
                title: currentData.title,
                description: currentData.description,
                elements: currentData.elements,
                status: currentData.status
            });
            if (!currentData.id) setFormId(saved.id);
            setLastSaved(new Date());
            setIsLocalSaved(false); // Reset local saved status after backend save
            // Clear local storage progress after successful backend save
            localStorage.removeItem('formcraft_progress');
        } catch (error: any) {
            console.error('Save failed:', error.message || error);
        } finally {
            setIsSaving(false);
        }
    }, []);

    // Local Auto-Save (Frontend Only)
    useEffect(() => {
        if (!isMounted) return;
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

        autoSaveTimerRef.current = setTimeout(() => {
            const progress = { title, description, elements: formElements };
            localStorage.setItem('formcraft_progress', JSON.stringify(progress));
            setIsLocalSaved(true);
        }, 2000);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [title, description, formElements, isMounted]);

    const handleSaveDraft = async () => {
        setStatus('draft');
        await triggerSave({ id: formId, title, description, elements: formElements, status: 'draft' });
        alert('Draft saved successfully!');
    };

    const handleSend = async () => {
        setStatus('published');
        // Ensure form is saved before opening modal
        const saved = await saveForm({
            id: formId || undefined,
            title,
            description,
            elements: formElements,
            status: 'published'
        });
        if (!formId) setFormId(saved.id);
        setLastSaved(new Date());
        setIsSendModalOpen(true);
    };

    const copyLink = () => {
        const shareLink = `${window.location.origin}/view/${formId}`;
        navigator.clipboard.writeText(shareLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const addElement = (type: ElementType) => {
        const newId = Math.random().toString(36).substring(7);
        const hasOptions = ['multiple_choice', 'checkboxes', 'dropdown'].includes(type);

        const newElement: FormElement = {
            id: newId,
            type,
            label: type === 'paragraph' ? 'Long Answer' : ELEMENT_LABELS[type],
            placeholder: type === 'paragraph' ? 'Enter your detailed response' : (type === 'dropdown' ? 'Select an option' : 'Enter your answer'),
            required: false,
            options: hasOptions ? ['Option 1', 'Option 2'] : undefined,
            maxRating: type === 'rating_scale' ? 5 : undefined,
        };
        setFormElements([...formElements, newElement]);
        setActiveElementId(newId);
    };

    const updateElement = (id: string, updates: Partial<FormElement>) => {
        setFormElements(formElements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const removeElement = (id: string) => {
        setFormElements(formElements.filter(el => el.id !== id));
        if (activeElementId === id) setActiveElementId(null);
    };

    const duplicateElement = (id: string) => {
        const index = formElements.findIndex(el => el.id === id);
        if (index === -1) return;

        const original = formElements[index];
        const newId = Math.random().toString(36).substring(7);
        const duplicate: FormElement = {
            ...original,
            id: newId,
        };

        const newElements = [...formElements];
        newElements.splice(index + 1, 0, duplicate);
        setFormElements(newElements);
        setActiveElementId(newId);
    };

    const addOption = (elementId: string) => {
        setFormElements(formElements.map(el => {
            if (el.id === elementId && el.options) {
                return { ...el, options: [...el.options, `Option ${el.options.length + 1}`] };
            }
            return el;
        }));
    };

    const updateOption = (elementId: string, index: number, value: string) => {
        setFormElements(formElements.map(el => {
            if (el.id === elementId && el.options) {
                const newOptions = [...el.options];
                newOptions[index] = value;
                return { ...el, options: newOptions };
            }
            return el;
        }));
    };

    const removeOption = (elementId: string, index: number) => {
        setFormElements(formElements.map(el => {
            if (el.id === elementId && el.options) {
                return { ...el, options: el.options.filter((_, i) => i !== index) };
            }
            return el;
        }));
    };

    const activeElement = formElements.find(el => el.id === activeElementId);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* Top Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 relative z-10">
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={18} />
                    <span className="text-sm font-semibold">Back to Forms</span>
                </Link>

                <div className="flex items-center gap-3">
                    {isSaving && <span className="text-xs text-gray-400 animate-pulse">Saving to cloud...</span>}
                    {!isSaving && isLocalSaved && <span className="text-xs text-blue-400">Progress saved locally</span>}
                    {!isSaving && !isLocalSaved && isMounted && lastSaved && <span className="text-xs text-gray-400">Last saved to cloud: {lastSaved.toLocaleTimeString()}</span>}

                    <button
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group disabled:opacity-50"
                    >
                        <Save size={18} className="group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-semibold">Save Draft</span>
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isSaving}
                        className="flex items-center gap-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
                    >
                        <Send size={18} />
                        <span className="text-sm font-semibold">Send</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Form Elements */}
                <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-6 hidden lg:block">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Form Elements</h2>
                    <div className="space-y-2">
                        {(Object.keys(ELEMENT_LABELS) as ElementType[]).map((type) => {
                            const Icon = ELEMENT_ICONS[type];
                            return (
                                <button
                                    key={type}
                                    onClick={() => addElement(type)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-all group hover:translate-x-1"
                                >
                                    <Icon size={18} className="text-gray-400 group-hover:text-blue-500" />
                                    <span className="text-sm font-medium">{ELEMENT_LABELS[type]}</span>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Canvas */}
                <main className="flex-1 overflow-y-auto p-12 flex justify-center bg-gray-50/50">
                    <div className="w-full max-w-2xl space-y-6 pb-24 text-left">
                        {/* Form Header */}
                        <div className="bg-purple-600 rounded-2xl p-8 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden transition-all duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-2xl font-bold bg-transparent border-none outline-none w-full placeholder:text-purple-200 block transition-all px-3 py-1 -mx-3 rounded-xl hover:bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-white/20"
                                    placeholder="Untitled Form"
                                />
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="text-purple-100 text-base bg-transparent border-none outline-none w-full placeholder:text-purple-200/50 mt-2 block transition-all px-3 py-1 -mx-3 rounded-lg hover:bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-white/20"
                                    placeholder="Form description (optional)"
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20"></div>
                        </div>

                        {/* Rendered Elements */}
                        <div className="space-y-4">
                            {formElements.map((el) => {
                                const Icon = ELEMENT_ICONS[el.type];
                                const isActive = activeElementId === el.id;

                                return (
                                    <div
                                        key={el.id}
                                        onClick={() => setActiveElementId(el.id)}
                                        className={`bg-white rounded-2xl p-6 shadow-sm relative group cursor-pointer border-2 transition-all duration-200 ${isActive ? 'border-blue-500 ring-4 ring-blue-50' : 'border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hidden md:block">
                                            <GripVertical size={20} className="text-gray-300" />
                                        </div>

                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 text-blue-500">
                                                <Icon size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600/70">{ELEMENT_LABELS[el.type]}</span>
                                            </div>
                                            {isActive && (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }}
                                                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Duplicate"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                                                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-base font-semibold text-gray-900 tracking-tight">{el.label}</h3>

                                            {/* Element Type Specific UI */}
                                            {(el.type === 'short_answer' || el.type === 'paragraph') && (
                                                <div className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 flex items-center text-gray-400 text-base ${el.type === 'paragraph' ? 'h-24 py-3 items-start' : 'h-11'}`}>
                                                    {el.placeholder || 'Enter your answer'}
                                                    {el.required && <span className="ml-1 text-red-500">*</span>}
                                                </div>
                                            )}

                                            {(el.type === 'multiple_choice' || el.type === 'checkboxes') && (
                                                <div className="space-y-3">
                                                    {el.options?.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 border-2 border-gray-200 flex items-center justify-center ${el.type === 'multiple_choice' ? 'rounded-full' : 'rounded'}`}>
                                                                {el.type === 'multiple_choice' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full scale-0 transition-transform active:scale-100"></div>}
                                                            </div>
                                                            <span className="text-sm text-gray-600 font-medium">{opt}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {el.type === 'dropdown' && (
                                                <div className="space-y-3">
                                                    <p className="text-base text-gray-400 mb-2">{el.placeholder || 'Select an option'}</p>
                                                    <div className="space-y-2">
                                                        {el.options?.map((opt, i) => (
                                                            <div key={i} className="flex items-center gap-3 pl-2">
                                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                                <span className="text-sm text-gray-500">{opt}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {el.type === 'date' && (
                                                <div className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 flex items-center justify-between text-gray-400 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar size={18} className="text-blue-500" />
                                                        <span className="text-base">{el.placeholder || 'Select date'}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {el.type === 'file_upload' && (
                                                <div className="w-full py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all">
                                                    <Upload size={24} className="text-blue-500" />
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Click or drag file to upload</span>
                                                    <span className="text-[10px] text-gray-400">PDF, JPG, PNG up to 10MB</span>
                                                </div>
                                            )}

                                            {el.type === 'rating_scale' && (
                                                <div className="flex gap-2">
                                                    {Array.from({ length: el.maxRating || 5 }).map((_, i) => (
                                                        <div key={i} className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 hover:text-yellow-400 hover:bg-yellow-50 hover:border-yellow-200 transition-all duration-200">
                                                            <Star size={20} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {isPreview && formElements.length > 0 && (
                                <button className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200/50 active:scale-[0.98] mt-8">
                                    Submit
                                </button>
                            )}

                            {formElements.length === 0 && (
                                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                        <Plus size={32} />
                                    </div>
                                    <p className="font-medium">Click an element on the left to add it to your form</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto hidden xl:block shadow-[-4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300">
                    <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10 p-2 gap-2">
                        <button
                            onClick={() => setIsPreview(false)}
                            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all ${!isPreview ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Settings size={18} />
                            <span>Settings</span>
                        </button>
                        <button
                            onClick={() => setIsPreview(true)}
                            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all ${isPreview ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Eye size={18} />
                            <span>Preview</span>
                        </button>
                    </div>

                    <div className="p-6 space-y-8 pb-32">
                        {!isPreview ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-gray-900">Edit Element</h2>
                                    <button
                                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                        onClick={() => setActiveElementId(null)}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {activeElement ? (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Question</label>
                                            <input
                                                type="text"
                                                value={activeElement.label}
                                                onChange={(e) => updateElement(activeElement.id, { label: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-semibold text-gray-700 shadow-sm"
                                            />
                                        </div>

                                        {!['multiple_choice', 'checkboxes', 'rating_scale', 'file_upload'].includes(activeElement.type) && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Placeholder</label>
                                                <input
                                                    type="text"
                                                    value={activeElement.placeholder}
                                                    onChange={(e) => updateElement(activeElement.id, { placeholder: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-semibold text-gray-700 shadow-sm"
                                                />
                                            </div>
                                        )}

                                        {activeElement.type === 'rating_scale' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Maximum Rating</label>
                                                <input
                                                    type="number"
                                                    min="3"
                                                    max="10"
                                                    value={activeElement.maxRating}
                                                    onChange={(e) => updateElement(activeElement.id, { maxRating: parseInt(e.target.value) || 5 })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-semibold text-gray-700 shadow-sm"
                                                />
                                            </div>
                                        )}

                                        {activeElement.options && (
                                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Options</label>
                                                <div className="space-y-3">
                                                    {activeElement.options.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-2 group">
                                                            <span className="text-xs font-medium text-gray-400 w-4">{i + 1}.</span>
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => updateOption(activeElement.id, i, e.target.value)}
                                                                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-600 shadow-sm"
                                                            />
                                                            <button
                                                                onClick={() => removeOption(activeElement.id, i)}
                                                                className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-lg"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => addOption(activeElement.id)}
                                                    className="w-full py-3 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={16} />
                                                    Add Option
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between py-6 border-t border-gray-100">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-gray-800">Required</p>
                                                <p className="text-xs text-gray-400 font-medium">Make this question mandatory</p>
                                            </div>
                                            <button
                                                onClick={() => updateElement(activeElement.id, { required: !activeElement.required })}
                                                className={`w-12 h-6 rounded-full relative transition-all duration-300 outline-none focus:ring-4 focus:ring-blue-100 ${activeElement.required ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${activeElement.required ? 'left-7 scale-110' : 'left-1'
                                                    }`}></div>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 space-y-6">
                                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center shadow-inner">
                                            <Settings size={40} className="text-gray-200 animate-pulse" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-500">No element selected</p>
                                            <p className="text-xs text-gray-400 max-w-[200px]">Click any field in the canvas to edit its unique properties here</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-blue-500 mb-1">
                                        <Eye size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600/70">Form Preview</span>
                                    </div>
                                    <div className="bg-purple-600 rounded-xl p-4 text-white shadow-md relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                        <div className="relative">
                                            <h3 className="font-bold text-lg leading-tight truncate">{title || 'Untitled Form'}</h3>
                                            <p className="text-purple-100 text-[10px] mt-1 line-clamp-2">{description || 'No description provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {formElements.map((el, i) => (
                                        <div key={el.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">
                                                <span className="text-gray-400 mr-1">{i + 1}.</span>
                                                {el.label}
                                                {el.required && <span className="text-red-500 ml-1">*</span>}
                                            </h4>

                                            {/* Mini Preview UI */}
                                            {['short_answer', 'paragraph'].includes(el.type) && (
                                                <div className={`w-full bg-white border border-gray-200 rounded-lg px-3 flex items-center text-gray-300 text-xs ${el.type === 'paragraph' ? 'h-16 items-start py-2' : 'h-8'}`}>
                                                    {el.placeholder || 'Type your answer here...'}
                                                </div>
                                            )}

                                            {['multiple_choice', 'checkboxes', 'dropdown'].includes(el.type) && (
                                                <div className="space-y-1.5">
                                                    {(el.options || []).slice(0, 3).map((opt, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 border-2 border-gray-200 ${el.type === 'multiple_choice' ? 'rounded-full' : 'rounded-sm'}`}></div>
                                                            <span className="text-[10px] text-gray-500 font-medium">{opt}</span>
                                                        </div>
                                                    ))}
                                                    {(el.options?.length || 0) > 3 && <p className="text-[9px] text-gray-400 pl-5">+{el.options!.length - 3} more options</p>}
                                                </div>
                                            )}

                                            {el.type === 'date' && (
                                                <div className="h-8 bg-white border border-gray-200 rounded-lg px-3 flex items-center gap-2 text-gray-300 text-xs text-left">
                                                    <Calendar size={12} className="text-blue-500" />
                                                    <span>{el.placeholder || 'Select date'}</span>
                                                </div>
                                            )}

                                            {el.type === 'rating_scale' && (
                                                <div className="flex gap-1">
                                                    {Array.from({ length: el.maxRating || 5 }).map((_, ridx) => (
                                                        <div key={ridx} className="w-5 h-5 rounded bg-white border border-gray-100 flex items-center justify-center text-gray-200">
                                                            <Star size={12} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {el.type === 'file_upload' && (
                                                <div className="h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-2 bg-white">
                                                    <Upload size={14} className="text-gray-300" />
                                                    <span className="text-[10px] text-gray-300 font-medium">Upload File</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {formElements.length > 0 && (
                                        <button disabled className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-bold text-xs opacity-50 cursor-not-allowed">
                                            Submit (Preview only)
                                        </button>
                                    )}

                                    {formElements.length === 0 && (
                                        <div className="py-12 text-center text-gray-400 space-y-2">
                                            <Settings size={24} className="mx-auto text-gray-200" />
                                            <p className="text-[10px] font-medium leading-relaxed">Add elements to the canvas to see their preview here</p>
                                        </div>
                                    )}
                                </div>

                                {formId && isMounted && (
                                    <div className="pt-6 border-t border-gray-100 space-y-4 font-sans text-left">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Share Link</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    readOnly
                                                    value={`${window.location.origin}/view/${formId}`}
                                                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-mono text-gray-600 outline-none truncate"
                                                />
                                                <button onClick={copyLink} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Send/Share Modal */}
            {isSendModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsSendModalOpen(false)}
                    ></div>
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Send Form</h2>
                                <button
                                    onClick={() => setIsSendModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Link to Share</label>
                                    <div className="flex items-center gap-3 p-1.5 bg-gray-50 border border-gray-100 rounded-2xl group focus-within:border-blue-200 focus-within:bg-white transition-all">
                                        <input
                                            readOnly
                                            value={`${window.location.origin}/view/${formId}`}
                                            className="flex-1 px-4 py-3 bg-transparent text-sm font-medium text-gray-600 outline-none truncate"
                                        />
                                        <button
                                            onClick={copyLink}
                                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${copySuccess ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            {copySuccess ? (
                                                <>
                                                    <CheckSquare size={18} />
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={18} />
                                                    <span>Copy Link</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                                    <p className="text-sm text-blue-600 font-medium leading-relaxed">
                                        Anyone with this HTTP link will be able to fill out and submit your form. You can track responses in the dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 flex justify-end">
                            <button
                                onClick={() => setIsSendModalOpen(false)}
                                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-sm"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
