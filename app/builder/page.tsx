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
    Copy,
    Check
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { saveForm, getForm, FormElement, ElementType } from '@/lib/forms';

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
    paragraph: 'Long Paragraph',
    multiple_choice: 'Single Choice',
    checkboxes: 'Multiple Choice',
    dropdown: 'Dropdown Select',
    date: 'Date Picker',
    file_upload: 'File Upload',
    rating_scale: 'Rating Scale',
};

export default function FormBuilderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FormBuilder />
        </Suspense>
    );
}

function FormBuilder() {
    const [formId, setFormId] = useState<string | null>(null);
    const [title, setTitle] = useState('Untitled Form');
    const [description, setDescription] = useState('Collect valuable feedback with ease.');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [themeColor, setThemeColor] = useState('#2563eb');
    const [collectEmail, setCollectEmail] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isLocalSaved, setIsLocalSaved] = useState(false);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [formElements, setFormElements] = useState<FormElement[]>([
        { id: '1', type: 'short_answer', label: 'What is your name?', placeholder: 'e.g. John Doe', required: true }
    ]);
    const [activeElementId, setActiveElementId] = useState<string | null>('1');

    // EFF: User requested "always empty form" on new creation.
    // Disabling auto-restore of drafts.
    /*
    useEffect(() => {
        setIsMounted(true);
        const savedProgress = localStorage.getItem('formcraft_progress');
        // Only load draft if we are NOT in edit mode (no editId) and no formId is set yet
        if (savedProgress && !formId && !editId) {
            try {
                const { title: st, description: sd, elements: se, themeColor: stc } = JSON.parse(savedProgress);
                setTitle(st);
                setDescription(sd);
                setFormElements(se);
                if (stc) setThemeColor(stc);
                if (se.length > 0) setActiveElementId(se[0].id);
            } catch (e) {
                console.error('Failed to load local progress:', e);
            }
        }
    }, [formId, editId]);
    */
    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (editId) {
            const fetchForm = async () => {
                setFormId(editId);
                try {
                    const form = await getForm(editId);
                    setTitle(form.title);
                    setDescription(form.description || '');
                    setFormElements(form.elements);
                    setStatus(form.status);
                    if (form.theme_color) setThemeColor(form.theme_color);
                    if (form.collect_email !== undefined) setCollectEmail(form.collect_email);
                    if (form.elements.length > 0) setActiveElementId(form.elements[0].id);
                } catch (error) {
                    console.error("Failed to load form", error);
                }
            };
            fetchForm();
        }
    }, [editId]);

    const triggerSave = useCallback(async (currentData: { id: string | null, title: string, description: string, elements: FormElement[], status: 'draft' | 'published', collect_email?: boolean }) => {
        setIsSaving(true);
        try {
            const saved = await saveForm({
                id: currentData.id || undefined,
                title: currentData.title,
                description: currentData.description,
                elements: currentData.elements,
                status: currentData.status,
                theme_color: themeColor,
                collect_email: collectEmail
            });
            if (!currentData.id) setFormId(saved.id ?? null);
            setLastSaved(new Date());
            setIsLocalSaved(false);
            localStorage.removeItem('formcraft_progress');
        } catch (error: any) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

        // If we are editing an existing form (formId is present), DO NOT overwrite the "new form" draft in localStorage.
        // We only use localStorage for completely new, unsaved forms.
        if (formId) return;

        autoSaveTimerRef.current = setTimeout(() => {
            const progress = { title, description, elements: formElements, themeColor, collectEmail };
            localStorage.setItem('formcraft_progress', JSON.stringify(progress));
            setIsLocalSaved(true);
        }, 2000);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [title, description, formElements, isMounted, formId, collectEmail]);

    const clearDraft = () => {
        localStorage.removeItem('formcraft_progress');
        setTitle('Untitled Form');
        setDescription('Collect valuable feedback with ease.');
        setFormElements([{ id: '1', type: 'short_answer', label: 'What is your name?', placeholder: 'e.g. John Doe', required: true }]);
        setActiveElementId('1');
        setIsLocalSaved(false);
    };

    const handleSaveDraft = async () => {
        setStatus('draft');
        await triggerSave({ id: formId, title, description, elements: formElements, status: 'draft', collect_email: collectEmail });
    };

    const handleSend = async () => {
        setIsSaving(true);
        setStatus('published');
        try {
            const saved = await saveForm({
                id: formId || undefined,
                title,
                description,
                elements: formElements,
                status: 'published',
                theme_color: themeColor,
                collect_email: collectEmail
            });
            if (!formId) setFormId(saved.id ?? null);
            setLastSaved(new Date());
            setIsLocalSaved(false);
            localStorage.removeItem('formcraft_progress');
            setIsSendModalOpen(true);
        } catch (error: any) {
            console.error('Publish failed:', error);
            alert(`Publish failed: ${error.message || 'Unknown error'}. Check console for details.`);
        } finally {
            setIsSaving(false);
        }
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
            label: type === 'paragraph' ? 'Tell us more about yourself' : ELEMENT_LABELS[type],
            placeholder: type === 'paragraph' ? 'Write response...' : (type === 'dropdown' ? 'Select...' : 'Enter answer'),
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
        const duplicate: FormElement = { ...original, id: newId };

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
        <div className="h-screen bg-[#FDFDFF] flex flex-col font-sans overflow-hidden text-sm">
            {/* Compact App Header */}
            <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 relative z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <ArrowLeft size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-widest hidden sm:block">Exit</span>
                    </Link>
                    <div className="h-3 w-px bg-gray-100"></div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${status === 'published' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                            {status}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        {isSaving ? (
                            <span className="text-[9px] font-bold text-blue-500 animate-pulse uppercase tracking-wider">Syncing...</span>
                        ) : isLocalSaved ? (
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Draft saved</span>
                        ) : null}
                    </div>

                    <div className="flex items-center bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-3 py-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded-md transition-all disabled:opacity-50 text-[10px] font-bold uppercase"
                        >
                            <Save size={14} />
                            Save
                        </button>
                        {!formId && (
                            <button
                                onClick={clearDraft}
                                className="flex items-center gap-1.5 px-3 py-1 text-gray-400 hover:text-red-600 hover:bg-white rounded-md transition-all disabled:opacity-50 text-[10px] font-bold uppercase"
                                title="Clear Draft / Reset"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                        <button
                            onClick={handleSend}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all ml-0.5 disabled:opacity-50 text-[10px] font-bold uppercase"
                        >
                            <Send size={14} />
                            Publish
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Dense Elements Sidebar */}
                <aside className="w-60 bg-white border-r border-gray-100 overflow-y-auto p-4 hidden lg:flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Components</h2>
                        <div className="grid grid-cols-1 gap-1">
                            {(Object.keys(ELEMENT_LABELS) as ElementType[]).map((type) => {
                                const Icon = ELEMENT_ICONS[type];
                                return (
                                    <button
                                        key={type}
                                        onClick={() => addElement(type)}
                                        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all group"
                                    >
                                        <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100">
                                            <Icon size={14} />
                                        </div>
                                        <span className="text-xs font-semibold">{ELEMENT_LABELS[type]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Compact Canvas Area */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 flex justify-center bg-[#F8FAFC]">
                    <div className="w-full max-w-xl space-y-6 pb-24">
                        {/* Interactive Form Header */}
                        <div
                            className="rounded-2xl shadow-lg border border-transparent relative overflow-hidden group transition-all"
                            style={{
                                backgroundColor: themeColor === '#2563eb' ? 'var(--primary-600)' : themeColor,
                                backgroundImage: themeColor === '#2563eb'
                                    ? 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)'
                                    : `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}ee 100%)`
                            }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                            <div className="p-8 pb-10">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-3xl font-extrabold text-white bg-transparent border-none outline-none w-full placeholder:text-white/40 block transition-all tracking-tight leading-tight"
                                    placeholder="Untitled Form"
                                />
                                <div className="mt-3 relative group/desc">
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="text-white/80 text-sm font-medium bg-transparent border-none outline-none w-full placeholder:text-white/40 block resize-none min-h-[24px] leading-relaxed"
                                        placeholder="Add a description..."
                                        rows={1}
                                    />
                                    <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-white/10 group-hover/desc:bg-white/30 transition-colors"></div>
                                </div>
                            </div>
                        </div>

                        {/* List of Form Elements */}
                        <div className="space-y-4">
                            {formElements.map((el, index) => {
                                const Icon = ELEMENT_ICONS[el.type];
                                const isActive = activeElementId === el.id;

                                if (isPreview) {
                                    return (
                                        <div key={el.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all">
                                            <label className="block text-base font-medium text-gray-900 mb-6 leading-normal">
                                                {el.label}
                                                {el.required && <span className="text-red-600 ml-1">*</span>}
                                            </label>

                                            {el.type === 'short_answer' && (
                                                <input
                                                    disabled
                                                    placeholder="Short answer text"
                                                    className="w-full border-b border-gray-300 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
                                                />
                                            )}

                                            {el.type === 'multiple_choice' && (
                                                <div className="space-y-4">
                                                    {el.options?.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                                            <span className="text-sm font-normal text-gray-800">{opt}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {el.type === 'paragraph' && (
                                                <textarea
                                                    disabled
                                                    placeholder="Long answer text"
                                                    className="w-full border-b border-gray-300 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent resize-none"
                                                />
                                            )}

                                            {el.type === 'checkboxes' && (
                                                <div className="space-y-4">
                                                    {el.options?.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div className="w-5 h-5 rounded border-2 border-gray-300 transition-all"></div>
                                                            <span className="text-sm font-normal text-gray-800">{opt}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {el.type === 'dropdown' && (
                                                <div className="relative max-w-xs">
                                                    <div className="w-full px-3 py-3 bg-white border border-gray-300 rounded text-sm text-gray-400 flex items-center justify-between">
                                                        <span>Select option</span>
                                                        <ChevronDown size={18} />
                                                    </div>
                                                </div>
                                            )}

                                            {el.type === 'date' && (
                                                <div className="w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-400 flex items-center justify-between">
                                                    <span>mm/dd/yyyy</span>
                                                    <Calendar size={16} />
                                                </div>
                                            )}

                                            {el.type === 'rating_scale' && (
                                                <div className="flex flex-wrap gap-4 items-center">
                                                    <div className="flex gap-1">
                                                        {Array.from({ length: el.maxRating || 5 }).map((_, i) => (
                                                            <div key={i} className="w-10 h-10 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-300">
                                                                <span className="text-xs font-bold">{i + 1}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={el.id}
                                        onClick={() => setActiveElementId(el.id)}
                                        className={`bg-white rounded-xl p-6 shadow-sm relative group cursor-pointer border transition-all ${isActive
                                            ? 'border-[var(--primary-600)] ring-4 ring-[var(--primary-50)]'
                                            : 'border-transparent hover:border-gray-100'
                                            }`}
                                    >
                                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all cursor-grab hidden md:flex text-gray-300">
                                            <GripVertical size={16} />
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                                                    }`}
                                                    style={isActive ? { backgroundColor: 'var(--primary-600)' } : {}}
                                                >
                                                    <Icon size={14} />
                                                </div>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? '' : 'text-gray-400'}`}
                                                    style={isActive ? { color: 'var(--primary-600)' } : {}}
                                                >
                                                    {ELEMENT_LABELS[el.type]}
                                                </span>
                                            </div>

                                            {isActive && (
                                                <div className="flex items-center gap-1 animate-in fade-in duration-300">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-gray-900 tracking-tight leading-snug">
                                                {el.label}
                                                {el.required && <span className="text-red-500 ml-1">*</span>}
                                            </h3>

                                            {(el.type === 'short_answer' || el.type === 'paragraph') && (
                                                <div className={`w-full bg-gray-50 border border-gray-100 rounded-lg px-4 flex items-center text-gray-300 text-xs italic ${el.type === 'paragraph' ? 'h-20 py-3 items-start' : 'h-10'}`}>
                                                    {el.placeholder || 'Answer...'}
                                                </div>
                                            )}

                                            {(el.type === 'multiple_choice' || el.type === 'checkboxes') && (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {el.options?.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50/30 border border-gray-50">
                                                            <div className={`w-3.5 h-3.5 border border-gray-200 ${el.type === 'multiple_choice' ? 'rounded-full' : 'rounded-sm'}`}></div>
                                                            <span className="text-xs text-gray-600 font-medium">{opt}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {el.type === 'rating_scale' && (
                                                <div className="flex gap-2">
                                                    {Array.from({ length: el.maxRating || 5 }).map((_, i) => (
                                                        <div key={i} className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-50 flex items-center justify-center text-gray-200">
                                                            <Star size={16} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>

                {/* Intelligent Settings Sidebar */}
                <aside className="w-72 bg-white border-l border-gray-100 overflow-y-auto hidden xl:flex flex-col">
                    <div className="p-2 border-b border-gray-50 flex gap-0.5 sticky top-0 bg-white z-20">
                        <button
                            onClick={() => setIsPreview(false)}
                            className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${!isPreview ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                        >
                            Build
                        </button>
                        <button
                            onClick={() => setIsPreview(true)}
                            className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${isPreview ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                        >
                            Preview
                        </button>
                    </div>

                    <div className="p-5 space-y-6">
                        {!isPreview ? (
                            activeElement ? (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Configuration</h2>
                                        <button onClick={() => setActiveElementId(null)} className="p-1.5 text-gray-300 hover:text-gray-900 transition-colors"><X size={16} /></button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Field Label</label>
                                            <input
                                                type="text"
                                                value={activeElement.label}
                                                onChange={(e) => updateElement(activeElement.id, { label: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-900 focus:ring-1 focus:ring-blue-600 focus:bg-white outline-none"
                                            />
                                        </div>

                                        {activeElement.options && (
                                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Options</label>
                                                <div className="space-y-2">
                                                    {activeElement.options.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => updateOption(activeElement.id, i, e.target.value)}
                                                                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-md text-xs font-semibold text-gray-900 outline-none"
                                                            />
                                                            <button
                                                                onClick={() => removeOption(activeElement.id, i)}
                                                                className="text-gray-200 hover:text-red-500 p-1"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => addOption(activeElement.id)}
                                                    className="w-full py-2 border border-dashed border-gray-100 rounded-lg text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Plus size={12} />
                                                    Add Option
                                                </button>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-gray-50">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Required</span>
                                                <button
                                                    onClick={() => updateElement(activeElement.id, { required: !activeElement.required })}
                                                    className={`w-8 h-4 rounded-full relative transition-all ${activeElement.required ? 'bg-blue-600' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${activeElement.required ? 'left-4.5' : 'left-0.5'}`}></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="space-y-4">
                                        <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Global Style</h2>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Theme Color</label>
                                            <div className="grid grid-cols-6 gap-2">
                                                {['#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#16a34a', '#0891b2', '#18181b'].map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setThemeColor(color)}
                                                        className={`w-8 h-8 rounded-full border-2 transition-all ${themeColor === color ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                                                            }`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                                <div className="relative group">
                                                    <input
                                                        type="color"
                                                        value={themeColor}
                                                        onChange={(e) => setThemeColor(e.target.value)}
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                    />
                                                    <div
                                                        className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center bg-white text-gray-400 group-hover:bg-gray-50 bg-gradient-to-br from-gray-50 to-white"
                                                    >
                                                        <Plus size={12} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 flex flex-col gap-4">
                                        <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Form Settings</h2>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Collect Email</span>
                                                <span className="text-[8px] text-gray-500 uppercase tracking-tight">Prevent duplicate entries</span>
                                            </div>
                                            <button
                                                onClick={() => setCollectEmail(!collectEmail)}
                                                className={`w-8 h-4 rounded-full relative transition-all ${collectEmail ? 'bg-blue-600' : 'bg-gray-200'}`}
                                            >
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${collectEmail ? 'left-4.5' : 'left-0.5'}`}></div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 flex flex-col items-center justify-center p-6 text-center text-gray-300">
                                        <h3 className="text-[9px] font-bold uppercase tracking-widest">Select an element to configure</h3>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h1 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Published Feed</h1>

                                {formId && (
                                    <div className="pt-4 border-t border-gray-50 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Endpoint</label>
                                            <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-mono text-gray-500 break-all leading-normal">
                                                {window.location.origin}/view/{formId}
                                            </div>
                                            <button
                                                onClick={copyLink}
                                                className={`w-full py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${copySuccess ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                                                    }`}
                                            >
                                                {copySuccess ? 'Copied' : 'Copy link'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Compact Publish Modal */}
            {isSendModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/10 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-10 text-center animate-in zoom-in-95 duration-500 border border-gray-100">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <Send size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Form is Live</h2>
                        <p className="text-xs text-gray-500 mb-8 max-w-xs mx-auto">Your form is now ready to collect responses.</p>
                        <button
                            onClick={copyLink}
                            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest mb-4 transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {copySuccess ? 'Link Copied' : 'Copy Share Link'}
                        </button>
                        <button
                            onClick={() => setIsSendModalOpen(false)}
                            className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900"
                        >
                            Back to Editor
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
