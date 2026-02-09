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
    GripVertical
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type ElementType = 'short_answer' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'date' | 'file_upload' | 'rating_scale';

interface FormElement {
    id: string;
    type: ElementType;
    label: string;
    placeholder: string;
    required: boolean;
    options?: string[];
    maxRating?: number;
}

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
    const [formElements, setFormElements] = useState<FormElement[]>([
        { id: '1', type: 'short_answer', label: 'Text Input', placeholder: 'Enter your answer', required: false }
    ]);
    const [activeElementId, setActiveElementId] = useState<string | null>('1');

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
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group">
                        <Eye size={18} className="group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-semibold">Preview</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group">
                        <Settings size={18} className="group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-semibold">Settings</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group">
                        <Save size={18} className="group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-semibold">Save Draft</span>
                    </button>
                    <button className="flex items-center gap-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95">
                        <Send size={18} />
                        <span className="text-sm font-semibold">Publish</span>
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
                    <div className="w-full max-w-2xl space-y-6 pb-24">
                        {/* Form Header */}
                        <div className="bg-purple-600 rounded-2xl p-8 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden transition-all duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="relative">
                                <h1 className="text-2xl font-bold mb-2">Untitled Form</h1>
                                <p className="text-purple-100 text-sm">Form description (optional)</p>
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
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{el.label}</h3>

                                            {/* Element Type Specific UI */}
                                            {(el.type === 'short_answer' || el.type === 'paragraph') && (
                                                <div className={`w-full bg-gray-50 border border-gray-100 rounded-xl px-4 flex items-center text-gray-400 text-sm italic ${el.type === 'paragraph' ? 'h-24 py-3 items-start' : 'h-11'}`}>
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
                                                    <p className="text-sm text-gray-400 italic mb-2">{el.placeholder || 'Select an option'}</p>
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
                                                        <span className="italic">{el.placeholder || 'Select date'}</span>
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
                <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto hidden xl:block shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
                    <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10 p-2 gap-2">
                        <button className="flex-1 py-3 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm transition-all shadow-sm shadow-blue-100/50">
                            <Settings size={18} />
                            <span>Settings</span>
                        </button>
                        <button className="flex-1 py-3 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all font-bold text-sm">
                            <Eye size={18} />
                            <span>Preview</span>
                        </button>
                    </div>

                    <div className="p-6 space-y-8 pb-32">
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
                    </div>
                </aside>
            </div>
        </div>
    );
}
