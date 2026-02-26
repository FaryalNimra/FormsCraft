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
    Check,
    ChevronRight,
    Clock,
    Loader2,
    MessageSquare,
    AtSign
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { saveForm, getForm, publishForm, FormElement, ElementType, getComments, addComment, deleteComment } from '@/lib/forms';
import { FormComment } from '@/types/database';
import { supabase } from '@/lib/supabase';

const ELEMENT_ICONS: Record<ElementType, any> = {
    short_answer: Type,
    paragraph: AlignLeft,
    multiple_choice: CircleDot,
    checkboxes: CheckSquare,
    dropdown: ChevronDown,
    date: Calendar,
    time: Clock,
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
    time: 'Time Picker',
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
    const logoFileRef = useRef<HTMLInputElement>(null);
    const [formId, setFormId] = useState<string | null>(null);
    const [title, setTitle] = useState('Untitled Form');
    const [description, setDescription] = useState('Collect valuable feedback with ease.');
    const [status, setStatus] = useState<'draft' | 'published' | 'in_progress'>('draft');
    const [themeColor, setThemeColor] = useState('#2563eb');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [collectEmail, setCollectEmail] = useState(false);
    const [limitToOneResponse, setLimitToOneResponse] = useState(false);
    const [allowResponseEditing, setAllowResponseEditing] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams.get('id');
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [isExpirationOpen, setIsExpirationOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isLocalSaved, setIsLocalSaved] = useState(false);
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [draggingType, setDraggingType] = useState<ElementType | null>(null);
    const [showSavedFeedback, setShowSavedFeedback] = useState(false);

    const [formElements, setFormElements] = useState<FormElement[]>([]);
    const [activeElementId, setActiveElementId] = useState<string | null>(null);

    // Initialize with one element if empty
    useEffect(() => {
        if (isMounted && formElements.length === 0 && !editId) {
            const initialId = crypto.randomUUID();
            setFormElements([
                { id: initialId, type: 'short_answer', label: 'What is your name?', placeholder: 'e.g. John Doe', required: true }
            ]);
            setActiveElementId(initialId);
        }
    }, [isMounted, formElements.length, editId]);
    const [optionDragOverIndex, setOptionDragOverIndex] = useState<number | null>(null);
    const [optionDragIndex, setOptionDragIndex] = useState<number | null>(null);
    const [headerCollabOpen, setHeaderCollabOpen] = useState(false);
    const [headerAdvancedOpen, setHeaderAdvancedOpen] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
    const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);
    const [collabMessage, setCollabMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
    const [isOwner, setIsOwner] = useState(true);
    const [userRole, setUserRole] = useState<'viewer' | 'editor'>('editor');
    const [newCollaboratorRole, setNewCollaboratorRole] = useState<'viewer' | 'editor'>('editor');
    const [comments, setComments] = useState<FormComment[]>([]);
    const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
    const [activeCommentElementId, setActiveCommentElementId] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [ownerEmail, setOwnerEmail] = useState<string | null>(null);

    const canEdit = isOwner || userRole === 'editor';
    const canPublish = isOwner;

    useEffect(() => {
        setIsMounted(true);
        const savedProgress = localStorage.getItem('formcraft_progress');
        // Only load draft if we are NOT in edit mode (no editId) and no formId is set yet
        if (savedProgress && !formId && !editId) {
            try {
                const { title: st, description: sd, elements: se, themeColor: stc, collectEmail: ce, limitToOneResponse: ltr, allowResponseEditing: are, logoUrl: sl } = JSON.parse(savedProgress);
                setTitle(st);
                setDescription(sd);
                setFormElements(se);
                if (stc) setThemeColor(stc);
                if (ce !== undefined) setCollectEmail(ce);
                if (ltr !== undefined) setLimitToOneResponse(ltr);
                if (are !== undefined) setAllowResponseEditing(are);
                if (sl) setLogoUrl(sl);
                if (se.length > 0) setActiveElementId(se[0].id);
            } catch (e) {
                console.error('Failed to load local progress:', e);
            }
        }

        const fetchUser = async () => {
            try {
                const { data: { user: u } } = await supabase.auth.getUser();
                setUser(u);
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        };
        fetchUser();
    }, [formId, editId]);

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
                    if (form.expires_at) setExpiresAt(form.expires_at);
                    if (form.theme_color) setThemeColor(form.theme_color);
                    if (form.collect_email !== undefined) setCollectEmail(form.collect_email);
                    if (form.limit_to_one_response !== undefined) setLimitToOneResponse(form.limit_to_one_response);
                    if (form.allow_response_editing !== undefined) setAllowResponseEditing(form.allow_response_editing);
                    if (form.created_at) setCreatedAt(form.created_at);
                    if (form.updated_at) setUpdatedAt(form.updated_at);
                    if (form.created_by_email) {
                        setOwnerEmail(form.created_by_email);
                        console.log("Setting owner email from form data:", form.created_by_email);
                    } else {
                        console.warn("No created_by_email found in form data for form:", editId);
                    }
                    if (form.elements.length > 0) setActiveElementId(form.elements[0].id);

                    // Fetch comments
                    getComments(editId).then(setComments).catch(console.error);

                    // 2. Fetch current user to determine ownership
                    const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
                    if (user) {
                        const owner = form.created_by === user.id;
                        setIsOwner(owner);

                        if (!owner) {
                            // Fetch role for this collaborator
                            const { getCollaborators } = await import('@/lib/forms');
                            const collabs = await getCollaborators(editId);
                            setCollaborators(collabs);
                            const myCollab = collabs.find(c => c.email.toLowerCase() === user.email?.toLowerCase());
                            if (myCollab) setUserRole(myCollab.role);

                            // If ownerEmail is still not set (legacy data), we might not be able to tag, 
                            // but form.created_by_email should ideally be there now.
                        } else {
                            // Owner is always editor
                            setUserRole('editor');
                            if (user.email) {
                                setOwnerEmail(user.email); // Ensure ownerEmail is set if we are the owner
                                console.log("Setting owner email from current user session:", user.email);
                            }
                            const { getCollaborators } = await import('@/lib/forms');
                            getCollaborators(editId).then(setCollaborators);
                        }
                    }
                } catch (error: any) {
                    console.error("Failed to load form:", error.message || error);
                }
            };
            fetchForm();
        }
    }, [editId]);

    const triggerSave = useCallback(async (currentData: { id: string | null, title: string, description: string, elements: FormElement[], status: 'draft' | 'published' | 'in_progress', collect_email?: boolean, limit_to_one_response?: boolean, allow_response_editing?: boolean }) => {
        setIsSaving(true);
        try {
            const saved = await saveForm({
                id: currentData.id || undefined,
                title: currentData.title,
                description: currentData.description,
                elements: currentData.elements,
                status: currentData.status,
                theme_color: themeColor,
                expires_at: expiresAt || undefined,
                collect_email: collectEmail,
                limit_to_one_response: limitToOneResponse,
                allow_response_editing: allowResponseEditing,
                created_by_email: ownerEmail || undefined
            });
            if (!currentData.id && saved.id) {
                setFormId(saved.id);
                // Update URL without refreshing
                router.push(`/builder?id=${saved.id}`, { scroll: false });
            }
            setLastSaved(new Date());
            setIsLocalSaved(false);
            setShowSavedFeedback(true);
            setTimeout(() => setShowSavedFeedback(false), 3000);
            localStorage.removeItem('formcraft_progress');
        } catch (error: any) {
            console.error('Save failed:', error);
            alert(`Save failed: ${error?.message || JSON.stringify(error) || 'Unknown error'}`);
            console.error('Save failed:', error.message || error);
            // Optionally notify user if it was a manual save
            if (status === 'draft') alert("Save failed: " + (error.message || "Unknown error"));
        } finally {
            setIsSaving(false);
        }
    }, [themeColor, expiresAt, collectEmail, limitToOneResponse, allowResponseEditing]);

    useEffect(() => {
        if (!isMounted) return;
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

        autoSaveTimerRef.current = setTimeout(() => {
            // Only auto-save to DB if the form is new (no formId) 
            // OR if it's already in 'in_progress' status
            if (!formId || status === 'in_progress') {
                const newStatus = status === 'published' ? 'published' : (status === 'draft' ? 'draft' : 'in_progress');

                // If it's a new form and title/elements changed from default, save it as in_progress
                if (!formId && (title !== 'Untitled Form' || formElements.length > 1 || (formElements.length === 1 && formElements[0].label !== 'What is your name?'))) {
                    setStatus('in_progress');
                    triggerSave({ id: formId, title, description, elements: formElements, status: 'in_progress', collect_email: collectEmail, limit_to_one_response: limitToOneResponse, allow_response_editing: allowResponseEditing });
                } else if (formId && status === 'in_progress') {
                    triggerSave({ id: formId, title, description, elements: formElements, status: 'in_progress', collect_email: collectEmail, limit_to_one_response: limitToOneResponse, allow_response_editing: allowResponseEditing });
                }
            }

            // Still save to local storage as backup
            const progress = { title, description, elements: formElements, themeColor, collectEmail, limitToOneResponse, allowResponseEditing, logoUrl };
            localStorage.setItem('formcraft_progress', JSON.stringify(progress));
            setIsLocalSaved(true);
        }, 5000);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [title, description, formElements, isMounted, formId, themeColor, expiresAt, collectEmail, limitToOneResponse, allowResponseEditing, status, triggerSave]);

    const clearDraft = () => {
        localStorage.removeItem('formcraft_progress');
        setTitle('Untitled Form');
        setDescription('Collect valuable feedback with ease.');
        setLogoUrl(null);
        const initialId = crypto.randomUUID();
        setFormElements([{ id: initialId, type: 'short_answer', label: 'What is your name?', placeholder: 'e.g. John Doe', required: true }]);
        setActiveElementId(initialId);
        setIsLocalSaved(false);
    };

    const handleSaveDraft = async () => {
        setStatus('draft');
        await triggerSave({ id: formId, title, description, elements: formElements, status: 'draft', collect_email: collectEmail, limit_to_one_response: limitToOneResponse, allow_response_editing: allowResponseEditing });
    };

    const handleSend = async () => {
        if (!formId && !title) {
            alert("Please save as draft first or enter a title.");
            return;
        }

        setIsSaving(true);
        try {
            const result = await publishForm({
                id: formId || undefined,
                title,
                description,
                elements: formElements,
                status: 'published',
                theme_color: themeColor,
                expires_at: expiresAt || undefined,
                collect_email: collectEmail,
                limit_to_one_response: limitToOneResponse,
                allow_response_editing: allowResponseEditing,
                logo_url: logoUrl || undefined
            });

            if (!formId && result.version?.form_id) {
                setFormId(result.version.form_id);
                router.push(`/builder?id=${result.version.form_id}`, { scroll: false });
            }

            setStatus('published');
            setLastSaved(new Date());
            setIsLocalSaved(false);
            setShowSavedFeedback(true);
            setTimeout(() => setShowSavedFeedback(false), 3000);
            localStorage.removeItem('formcraft_progress');
            setIsSendModalOpen(true);
        } catch (error: any) {
            console.error('Publish failed:', error);
            alert(`Publish failed: ${error.message || 'Unknown error'}.`);
        } finally {
            setIsSaving(false);
        }
    };


    const copyLink = () => {
        const shareLink = `${isMounted ? window.location.origin : ''}/view/${formId}`;
        navigator.clipboard.writeText(shareLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const addElement = (type: ElementType) => {
        const newId = crypto.randomUUID();
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
        const newId = crypto.randomUUID();
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
            if (el.id === elementId && el.options && el.options.length > 2) {
                return { ...el, options: el.options.filter((_, i) => i !== index) };
            }
            return el;
        }));
    };
    const activeElement = formElements.find(el => el.id === activeElementId);

    const handleDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handleSidebarDragStart = (e: React.DragEvent, type: ElementType) => {
        setDraggingType(type);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        // Sidebar drag — always show indicator
        if (draggingType) {
            setDragOverIndex(index);
            return;
        }
        // Reorder drag
        if (dragIndex === null || dragIndex === index) {
            setDragOverIndex(null);
            return;
        }
        setDragOverIndex(index);
    };

    const addElementAtIndex = (type: ElementType, index: number) => {
        const newId = crypto.randomUUID();
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
        const updated = [...formElements];
        updated.splice(index, 0, newElement);
        setFormElements(updated);
        setActiveElementId(newId);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        // Sidebar drop — insert new element
        if (draggingType) {
            addElementAtIndex(draggingType, dropIndex);
            setDraggingType(null);
            setDragOverIndex(null);
            return;
        }
        // Reorder drop
        if (dragIndex === null || dragIndex === dropIndex) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }
        const reordered = [...formElements];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(dropIndex, 0, moved);
        setFormElements(reordered);
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleCanvasDrop = (e: React.DragEvent) => {
        e.preventDefault();
        // Drop on empty canvas or at the very end
        if (draggingType) {
            addElementAtIndex(draggingType, formElements.length);
            setDraggingType(null);
            setDragOverIndex(null);
        }
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
        setDraggingType(null);
    };

    const handleOptionDragStart = (index: number) => {
        setOptionDragIndex(index);
    };

    const handleOptionDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (optionDragIndex === null || optionDragIndex === index) {
            setOptionDragOverIndex(null);
            return;
        }
        setOptionDragOverIndex(index);
    };

    const handleOptionDrop = (index: number) => {
        if (optionDragIndex === null || optionDragIndex === index || !activeElement || !activeElement.options) {
            setOptionDragIndex(null);
            setOptionDragOverIndex(null);
            return;
        }

        const newOptions = [...activeElement.options];
        const [moved] = newOptions.splice(optionDragIndex, 1);
        newOptions.splice(index, 0, moved);

        updateElement(activeElement.id, { options: newOptions });
        setOptionDragIndex(null);
        setOptionDragOverIndex(null);
    };

    const handleOptionDragEnd = () => {
        setOptionDragIndex(null);
        setOptionDragOverIndex(null);
    };

    const handleAddCollaborator = async () => {
        if (!newCollaboratorEmail) return;
        setIsAddingCollaborator(true);
        setCollabMessage(null);
        try {
            let currentFormId = formId;

            // 1. If no formId, trigger a save first
            if (!currentFormId) {
                setCollabMessage({ text: 'Saving form first...', type: 'info' });
                const saved = await saveForm({
                    title,
                    description,
                    elements: formElements,
                    status,
                    theme_color: themeColor,
                    expires_at: expiresAt || undefined,
                    collect_email: collectEmail,
                    limit_to_one_response: limitToOneResponse,
                    allow_response_editing: allowResponseEditing
                });
                if (saved.id) {
                    currentFormId = saved.id;
                    setFormId(saved.id);
                    router.push(`/builder?id=${saved.id}`, { scroll: false });
                } else {
                    throw new Error('Could not save form to generate ID');
                }
            }

            // 2. Add as collaborator
            const { addCollaborator } = await import('@/lib/forms');

            // 3. Add as collaborator
            const newCollab = await addCollaborator(currentFormId, newCollaboratorEmail, newCollaboratorRole);

            // 4. Send Invitation Email
            try {
                const emailRes = await fetch('/api/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: newCollaboratorEmail,
                        formTitle: title || 'Untitled Form',
                        formLink: `${isMounted ? window.location.origin : ''}/login?next=${encodeURIComponent(`/builder?id=${currentFormId}`)}`
                    })
                });

                if (!emailRes.ok) {
                    const errorData = await emailRes.json();
                    console.error('Email invitation failed:', errorData);
                    setCollabMessage({
                        text: `Collaborator added, but invitation email failed: ${errorData.error}. ${errorData.hint || ''}`,
                        type: 'warning'
                    });
                } else {
                    setCollabMessage({
                        text: `Success! Invitation link sent to ${newCollaboratorEmail}.`,
                        type: 'success'
                    });
                }
            } catch (emailError) {
                console.error('Failed to send invitation email:', emailError);
                setCollabMessage({
                    text: `Collaborator added, but we couldn't send the invitation email.`,
                    type: 'warning'
                });
            }

            setCollaborators([...collaborators, newCollab]);
            setNewCollaboratorEmail('');

            // Clear success message after 5s
            setTimeout(() => setCollabMessage(null), 5000);

        } catch (error: any) {
            console.error('Full error details:', {
                message: error?.message,
                code: error?.code,
                details: error?.details,
                hint: error?.hint,
                error
            });
            if (error.message === 'ALREADY_COLLABORATOR') {
                setCollabMessage({ text: 'This user is already a collaborator.', type: 'error' });
            } else if (error.code === '42P01') {
                setCollabMessage({ text: 'Database table missing. Please run migrations.', type: 'error' });
            } else {
                setCollabMessage({ text: error.message || 'Failed to add collaborator', type: 'error' });
            }
        } finally {
            setIsAddingCollaborator(false);
        }
    };

    const handleUpdateRole = async (collabId: string, role: 'viewer' | 'editor') => {
        try {
            const { updateCollaboratorRole } = await import('@/lib/forms');
            await updateCollaboratorRole(collabId, role);
            setCollaborators(collaborators.map(c => c.id === collabId ? { ...c, role } : c));
        } catch (error: any) {
            alert(error.message || 'Failed to update role');
        }
    };

    const handleRemoveCollaborator = async (id: string) => {
        try {
            const { removeCollaborator } = await import('@/lib/forms');
            await removeCollaborator(id);
            setCollaborators(collaborators.filter(c => c.id !== id));
        } catch (error: any) {
            alert(error.message || 'Failed to remove collaborator');
        }
    };

    const handleCreateComment = async (elementId: string | null, content: string) => {
        if (!formId || !user || !content.trim()) return;
        try {
            const newComment = await addComment(formId, elementId, content, user.email || '', user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
            setComments([...comments, newComment]);
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const handleDeleteComment = async (id: string) => {
        try {
            await deleteComment(id);
            setComments(comments.filter(c => c.id !== id));
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    return (
        <div className="h-screen bg-[#FDFDFF] flex flex-col font-sans overflow-hidden text-sm">
            {/* Compact App Header */}
            <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 relative z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <ArrowLeft size={14} />
                        </div>
                    </Link>
                    <div className="h-3 w-px bg-gray-100"></div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${status === 'published'
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : status === 'in_progress'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                            {status.replace('_', ' ')}
                        </span>
                        {updatedAt && createdAt && new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 10000 && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100">
                                Edited
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        {isSaving ? (
                            <div className="flex items-center gap-1.5">
                                <Loader2 size={10} className="animate-spin text-blue-500" />
                                <span className="text-[9px] font-bold text-blue-500 animate-pulse uppercase tracking-wider">Saving...</span>
                            </div>
                        ) : showSavedFeedback ? (
                            <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider">Saved</span>
                        ) : isLocalSaved ? (
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Draft saved</span>
                        ) : null}
                    </div>

                    <div className="flex items-center bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSaving || !canEdit}
                            className="flex items-center gap-1.5 px-3 py-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded-md transition-all disabled:opacity-50 text-[10px] font-bold uppercase"
                            title={!canEdit ? "You don't have edit access" : ""}
                        >
                            {isSaving ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Save size={14} />
                            )}
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => canEdit && setIsExpirationOpen(!isExpirationOpen)}
                                disabled={!canEdit}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all text-[10px] font-bold uppercase ${expiresAt ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-white'
                                    } disabled:opacity-50`}
                            >
                                <Clock size={14} className="text-black" />
                                Deadline
                            </button>

                            {isExpirationOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Form Expiration</h3>
                                            <button onClick={() => setIsExpirationOpen(false)} className="text-black hover:bg-gray-100 p-1 rounded-md transition-colors"><X size={14} /></button>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Close responses on</label>
                                            <div className="space-y-2">
                                                <input
                                                    type="datetime-local"
                                                    value={isMounted && expiresAt ? new Date(new Date(expiresAt).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                                                    onChange={(e) => setExpiresAt(e.target.value ? new Date(e.target.value).toISOString() : null)}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-900 focus:ring-1 focus:ring-blue-600 focus:bg-white outline-none"
                                                />
                                                {expiresAt && (
                                                    <button
                                                        onClick={() => setExpiresAt(null)}
                                                        className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                                                    >
                                                        Clear expiration
                                                    </button>
                                                )}
                                                <p className="text-[9px] text-gray-400 leading-relaxed">
                                                    Once the deadline passes, users will see a "Time is up" message instead of the form.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!formId && (
                            <button
                                onClick={clearDraft}
                                disabled={!canEdit}
                                className="flex items-center gap-1.5 px-3 py-1 text-gray-400 hover:text-red-600 hover:bg-white rounded-md transition-all disabled:opacity-50 text-[10px] font-bold uppercase"
                                title={!canEdit ? "You don't have edit access" : "Clear Draft / Reset"}
                            >
                                <Trash2 size={14} className="text-black" />
                            </button>
                        )}
                        <button
                            onClick={handleSend}
                            disabled={isSaving || !canEdit || !isOwner}
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all ml-0.5 disabled:opacity-50 text-[10px] font-bold uppercase"
                            title={!isOwner ? "Only owners can publish" : !canEdit ? "You don't have edit access" : ""}
                        >
                            <Send size={14} />
                            Publish
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Dense Elements Sidebar */}
                <aside className="w-60 bg-white border-r border-gray-100 overflow-y-auto scrollbar-hide p-4 hidden lg:flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Components</h2>
                        <div className="grid grid-cols-1 gap-1">
                            {(Object.keys(ELEMENT_LABELS) as ElementType[]).map((type) => {
                                const Icon = ELEMENT_ICONS[type];
                                return (
                                    <button
                                        key={type}
                                        draggable={canEdit}
                                        onDragStart={(e) => canEdit && handleSidebarDragStart(e, type)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => canEdit && addElement(type)}
                                        disabled={!canEdit}
                                        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all group cursor-grab active:cursor-grabbing disabled:opacity-50 disabled:cursor-not-allowed"
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
                <main
                    className="flex-1 overflow-y-auto p-6 lg:p-10 flex justify-center bg-[#F8FAFC]"
                    onDragOver={(e) => { if (draggingType && canEdit) e.preventDefault(); }}
                    onDrop={(e) => canEdit && handleCanvasDrop(e)}
                >
                    <div className="w-full max-w-xl space-y-6 pb-64">
                        {/* Interactive Form Header */}
                        <div
                            onClick={() => { setActiveElementId('header'); setHeaderCollabOpen(false); }}
                            className={`rounded-2xl shadow-lg border-2 relative overflow-hidden group transition-all cursor-pointer ${activeElementId === 'header' ? 'border-blue-500' : 'border-transparent'
                                }`}
                            style={{
                                backgroundColor: themeColor === '#2563eb' ? 'var(--primary-600)' : themeColor,
                                backgroundImage: themeColor === '#2563eb'
                                    ? 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)'
                                    : `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}ee 100%)`
                            }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                            <div className="p-8 pb-10 flex items-start gap-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={!canEdit}
                                        className="text-3xl font-extrabold text-white bg-transparent border-none outline-none w-full placeholder:text-white/40 block transition-all tracking-tight leading-tight disabled:opacity-50"
                                        placeholder="Untitled Form"
                                    />
                                    <div className="mt-3 relative group/desc">
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            disabled={!canEdit}
                                            className="text-white/80 text-sm font-medium bg-transparent border-none outline-none w-full placeholder:text-white/40 block resize-none min-h-[24px] leading-relaxed disabled:opacity-50"
                                            placeholder="Add a description..."
                                            rows={1}
                                        />
                                        <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-white/10 group-hover/desc:bg-white/30 transition-colors"></div>
                                    </div>
                                </div>
                                {/* Logo display on header */}
                                {logoUrl && (
                                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/30 flex-shrink-0 bg-white/10 shadow-lg">
                                        <img src={logoUrl} alt="Form logo" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* List of Form Elements */}
                        <div className="space-y-4" onDragOver={(e) => e.stopPropagation()}>
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
                                                <div className="space-y-2">
                                                    <input
                                                        disabled
                                                        placeholder="Short answer text"
                                                        className="w-full border-b border-gray-300 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
                                                    />
                                                    {el.wordLimit && (
                                                        <div className="flex justify-end pt-1">
                                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                                                                0 / {el.wordLimit} · {el.wordLimit} left
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
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
                                                <div className="space-y-2">
                                                    <textarea
                                                        disabled
                                                        placeholder="Long answer text"
                                                        className="w-full border-b border-gray-300 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent resize-none"
                                                    />
                                                    {el.wordLimit && (
                                                        <div className="flex justify-end pt-1">
                                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                                                                0 / {el.wordLimit} · {el.wordLimit} left
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
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

                                            {el.type === 'time' && (
                                                <div className="w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-400 flex items-center justify-between">
                                                    <span>hh:mm</span>
                                                    <Clock size={16} />
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
                                        draggable={canEdit}
                                        onDragStart={() => canEdit && handleDragStart(index)}
                                        onDragOver={(e) => canEdit && handleDragOver(e, index)}
                                        onDrop={(e) => canEdit && handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setActiveElementId(el.id)}
                                        className={`bg-white rounded-xl p-6 shadow-sm relative group cursor-pointer border transition-all ${isActive
                                            ? 'border-[var(--primary-600)] ring-4 ring-[var(--primary-50)]'
                                            : 'border-transparent hover:border-gray-100'
                                            } ${dragIndex === index ? 'opacity-40 scale-[0.97]' : ''} ${!canEdit ? 'cursor-default' : ''}`}
                                    >
                                        {dragOverIndex === index && (draggingType || (dragIndex !== null && dragIndex !== index)) && (
                                            <div className="absolute -top-2.5 left-0 right-0 flex items-center gap-2 z-10 pointer-events-none">
                                                <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                                                <div className="flex-1 h-0.5 bg-blue-500 rounded-full shadow"></div>
                                            </div>
                                        )}
                                        <div className={`absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all cursor-grab hidden md:flex text-gray-300 ${!canEdit ? 'pointer-events-none opacity-0' : ''}`}>
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

                                            <div className="flex items-center gap-1 animate-in fade-in duration-300">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveCommentElementId(el.id);
                                                        setIsCommentPanelOpen(true);
                                                    }}
                                                    className="p-1.5 text-black hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all relative"
                                                    title="Add or view comments"
                                                >
                                                    <MessageSquare size={14} />
                                                    {comments.filter(c => c.element_id === el.id).length > 0 && (
                                                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                                                            {comments.filter(c => c.element_id === el.id).length}
                                                        </span>
                                                    )}
                                                </button>
                                                {canEdit && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }}
                                                            className="p-1.5 text-black hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                                                            className="p-1.5 text-black hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative group/label">
                                                <textarea
                                                    draggable={false}
                                                    value={el.label}
                                                    rows={1}
                                                    onClick={(e) => { e.stopPropagation(); setActiveElementId(el.id); }}
                                                    disabled={!canEdit}
                                                    onFocus={(e) => {
                                                        const target = e.target as HTMLTextAreaElement;
                                                        target.style.height = 'auto';
                                                        target.style.height = target.scrollHeight + 'px';

                                                        // Clear default label if it matches
                                                        const defaultLabel = ELEMENT_LABELS[el.type];
                                                        const paragraphDefault = 'Tell us more about yourself';
                                                        const initialDefault = 'What is your name?';
                                                        if (el.label === defaultLabel || (el.type === 'paragraph' && el.label === paragraphDefault) || el.label === initialDefault) {
                                                            updateElement(el.id, { label: '' });
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        const words = e.target.value.trim().split(/\s+/).filter(Boolean);
                                                        const limit = el.type === 'paragraph' ? 15 : 10;
                                                        if (words.length <= limit || e.target.value.endsWith(' ')) {
                                                            updateElement(el.id, { label: e.target.value });
                                                        }
                                                        const target = e.target as HTMLTextAreaElement;
                                                        target.style.height = 'auto';
                                                        target.style.height = target.scrollHeight + 'px';
                                                    }}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                                                    className="w-full text-sm font-bold text-gray-900 tracking-tight leading-snug break-words bg-transparent border-none outline-none resize-none p-0 focus:ring-0 transition-all hover:bg-gray-50/50 rounded-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                                    placeholder="Enter question here..."
                                                />
                                                {el.required && <span className="absolute -right-3 top-0 text-red-500">*</span>}
                                            </div>

                                            {(el.type === 'short_answer' || el.type === 'paragraph') && (
                                                <div>
                                                    <div className={`w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 flex items-center text-gray-400 text-xs italic font-medium transition-all hover:border-[var(--primary-200)] ${el.type === 'paragraph' ? 'h-24 py-3 items-start' : 'h-11'}`}>
                                                        {el.type === 'paragraph' ? (
                                                            <textarea
                                                                draggable={false}
                                                                value={el.placeholder}
                                                                onChange={(e) => updateElement(el.id, { placeholder: e.target.value })}
                                                                onFocus={() => {
                                                                    if (el.placeholder === 'Write response...') {
                                                                        updateElement(el.id, { placeholder: '' });
                                                                    }
                                                                }}
                                                                onClick={(e) => { e.stopPropagation(); setActiveElementId(el.id); }}
                                                                disabled={!canEdit}
                                                                className="w-full bg-transparent border-none outline-none resize-none p-0 focus:ring-0 text-gray-500 font-medium disabled:opacity-50"
                                                                placeholder="Write response..."
                                                                rows={2}
                                                            />
                                                        ) : (
                                                            <input
                                                                draggable={false}
                                                                type="text"
                                                                value={el.placeholder}
                                                                onChange={(e) => updateElement(el.id, { placeholder: e.target.value })}
                                                                onFocus={() => {
                                                                    const defaults = ['Enter answer', 'Select...', 'e.g. John Doe'];
                                                                    if (defaults.includes(el.placeholder)) {
                                                                        updateElement(el.id, { placeholder: '' });
                                                                    }
                                                                }}
                                                                onClick={(e) => { e.stopPropagation(); setActiveElementId(el.id); }}
                                                                disabled={!canEdit}
                                                                className="w-full bg-transparent border-none outline-none p-0 focus:ring-0 text-gray-500 font-medium disabled:opacity-50"
                                                                placeholder="Enter answer hint..."
                                                            />
                                                        )}
                                                    </div>
                                                    {el.wordLimit && (
                                                        <div className="flex justify-end mt-2">
                                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                                                                0 / {el.wordLimit} · {el.wordLimit} left
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {(el.type === 'multiple_choice' || el.type === 'checkboxes' || el.type === 'dropdown') && (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {el.options?.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100 group/opt transition-all hover:bg-white hover:border-blue-100 hover:shadow-sm">
                                                            <div className={`w-4 h-4 border-2 border-gray-200 flex-shrink-0 ${el.type === 'multiple_choice' ? 'rounded-full' : (el.type === 'dropdown' ? 'rounded-md bg-gray-100 border-none relative' : 'rounded-md')}`}>
                                                                {el.type === 'dropdown' && <span className="text-[8px] font-bold text-gray-400 absolute inset-0 flex items-center justify-center">{i + 1}</span>}
                                                            </div>
                                                            <input
                                                                draggable={false}
                                                                type="text"
                                                                value={opt}
                                                                onClick={(e) => { e.stopPropagation(); setActiveElementId(el.id); }}
                                                                disabled={!canEdit}
                                                                onFocus={() => {
                                                                    if (opt === `Option ${i + 1}`) {
                                                                        updateOption(el.id, i, '');
                                                                    }
                                                                }}
                                                                onChange={(e) => {
                                                                    const words = e.target.value.trim().split(/\s+/).filter(Boolean);
                                                                    if (words.length <= 10 || e.target.value.endsWith(' ')) {
                                                                        updateOption(el.id, i, e.target.value);
                                                                    }
                                                                }}
                                                                className="flex-1 bg-transparent border-none outline-none p-0 text-xs text-gray-700 font-bold placeholder:text-gray-300 focus:ring-0 disabled:opacity-50"
                                                                placeholder={`Option ${i + 1}`}
                                                            />
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeOption(el.id, i); }}
                                                                disabled={!canEdit}
                                                                className={`p-1 text-gray-300 hover:text-red-500 rounded-md transition-all ${el.options && el.options.length > 2 && canEdit ? 'opacity-0 group-hover/opt:opacity-100' : 'hidden'}`}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); addOption(el.id); }}
                                                        disabled={!canEdit}
                                                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all w-fit group disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <div className="p-0.5 rounded-full bg-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                            <Plus size={10} />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Add Option</span>
                                                    </button>
                                                </div>
                                            )}

                                            {el.type === 'date' && (
                                                <div className="w-full max-w-xs px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl flex items-center justify-between group/date transition-all hover:border-blue-100 hover:bg-white">
                                                    <input
                                                        draggable={false}
                                                        type="text"
                                                        value={el.placeholder}
                                                        onChange={(e) => updateElement(el.id, { placeholder: e.target.value })}
                                                        onClick={(e) => { e.stopPropagation(); setActiveElementId(el.id); }}
                                                        disabled={!canEdit}
                                                        className="w-full bg-transparent border-none outline-none p-0 focus:ring-0 text-xs text-gray-400 font-medium disabled:opacity-50"
                                                        placeholder="mm/dd/yyyy"
                                                    />
                                                    <Calendar size={14} className="text-gray-300 group-hover/date:text-blue-500 transition-colors" />
                                                </div>
                                            )}

                                            {el.type === 'time' && (
                                                <div className="w-full max-w-xs px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl flex items-center justify-between group/time transition-all hover:border-blue-100 hover:bg-white">
                                                    <input
                                                        draggable={false}
                                                        type="text"
                                                        value={el.placeholder}
                                                        onChange={(e) => updateElement(el.id, { placeholder: e.target.value })}
                                                        onClick={(e) => { e.stopPropagation(); setActiveElementId(el.id); }}
                                                        disabled={!canEdit}
                                                        className="w-full bg-transparent border-none outline-none p-0 focus:ring-0 text-xs text-gray-400 font-medium disabled:opacity-50"
                                                        placeholder="hh:mm"
                                                    />
                                                    <Clock size={14} className="text-gray-300 group-hover/time:text-blue-500 transition-colors" />
                                                </div>
                                            )}

                                            {el.type === 'file_upload' && (
                                                <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 group/file transition-all hover:border-blue-200 hover:bg-blue-50/10">
                                                    <Upload size={18} className="text-gray-300 group-hover/file:text-blue-500 transition-colors" />
                                                    <input
                                                        draggable={false}
                                                        type="text"
                                                        value={el.placeholder}
                                                        onChange={(e) => updateElement(el.id, { placeholder: e.target.value })}
                                                        onClick={(e) => { e.stopPropagation(); setActiveElementId(el.id); }}
                                                        disabled={!canEdit}
                                                        className="w-full bg-transparent border-none outline-none p-0 focus:ring-0 text-xs text-center text-gray-400 font-medium disabled:opacity-50"
                                                        placeholder="Click or drag file to upload"
                                                    />
                                                </div>
                                            )}

                                            {el.type === 'rating_scale' && (
                                                <div className="flex gap-2">
                                                    {Array.from({ length: el.maxRating || 5 }).map((_, i) => (
                                                        <div key={i} className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-500">
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
                        <div className="h-32" /> {/* Handsome padding at the bottom */}
                    </div>
                </main>

                {/* Intelligent Settings Sidebar */}
                <aside className="w-72 bg-white border-l border-gray-100 overflow-y-auto scrollbar-hide hidden xl:flex flex-col">
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
                            activeElementId === 'header' ? (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Form Header</h2>
                                        <button onClick={() => setActiveElementId(null)} className="p-1.5 text-black hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Form Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                onFocus={() => {
                                                    if (title === 'Untitled Form') {
                                                        setTitle('');
                                                    }
                                                }}
                                                disabled={!canEdit}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:ring-1 focus:ring-blue-600 focus:bg-white outline-none disabled:opacity-50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Form Description</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                onFocus={() => {
                                                    if (description === 'Collect valuable feedback with ease.') {
                                                        setDescription('');
                                                    }
                                                }}
                                                rows={3}
                                                disabled={!canEdit}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:ring-1 focus:ring-blue-600 focus:bg-white outline-none resize-none disabled:opacity-50"
                                            />
                                        </div>

                                        {/* Color Palette */}
                                        <div className="space-y-3">
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Theme Color</label>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    '#2563eb', '#7c3aed', '#db2777', '#dc2626',
                                                    '#ea580c', '#ca8a04', '#16a34a', '#0891b2',
                                                    '#0f172a', '#1e293b'
                                                ].map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => canEdit && setThemeColor(color)}
                                                        disabled={!canEdit}
                                                        title={color}
                                                        className={`w-7 h-7 rounded-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${themeColor === color
                                                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                                            : 'hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'
                                                            }`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex-shrink-0 mr-1">Custom</label>
                                                <div className="relative flex items-center gap-2 flex-1">
                                                    <input
                                                        type="color"
                                                        value={themeColor}
                                                        onChange={(e) => canEdit && setThemeColor(e.target.value)}
                                                        disabled={!canEdit}
                                                        className="w-7 h-7 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={themeColor}
                                                        onChange={(e) => {
                                                            if (!canEdit) return;
                                                            const val = e.target.value;
                                                            if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setThemeColor(val);
                                                        }}
                                                        disabled={!canEdit}
                                                        className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-mono text-gray-700 focus:ring-1 focus:ring-blue-600 focus:bg-white outline-none disabled:opacity-50"
                                                        placeholder="#000000"
                                                        maxLength={7}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Logo Uploader */}
                                        <div className="space-y-3">
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Form Logo</label>
                                            <input
                                                ref={logoFileRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const reader = new FileReader();
                                                    reader.onload = (ev) => {
                                                        setLogoUrl(ev.target?.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                    e.target.value = '';
                                                }}
                                            />
                                            {logoUrl ? (
                                                <div className="relative group/logo">
                                                    <div className="w-full h-28 rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50">
                                                        <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                                                    </div>
                                                    {canEdit && (
                                                        <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => logoFileRef.current?.click()}
                                                                className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
                                                            >
                                                                Change
                                                            </button>
                                                            <button
                                                                onClick={() => setLogoUrl(null)}
                                                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => canEdit && logoFileRef.current?.click()}
                                                    disabled={!canEdit}
                                                    className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-300 hover:bg-blue-50/30 transition-all group/upload disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover/upload:bg-blue-100 transition-colors flex items-center justify-center">
                                                        <Upload size={14} className="text-gray-400 group-hover/upload:text-blue-500 transition-colors" />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover/upload:text-blue-500 transition-colors">Upload Logo</span>
                                                    <span className="text-[8px] text-gray-300">PNG, JPG, SVG supported</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-gray-50 space-y-4">
                                            <div>
                                                <button
                                                    onClick={() => setHeaderAdvancedOpen(!headerAdvancedOpen)}
                                                    className="flex items-center justify-between w-full p-3 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all group"
                                                >
                                                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Advanced</span>
                                                    <ChevronRight size={14} className={`text-black transition-transform duration-200 ${headerAdvancedOpen ? 'rotate-90' : ''}`} />
                                                </button>

                                                {headerAdvancedOpen && (
                                                    <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Collect Email</span>
                                                                <span className="text-[8px] text-gray-500 uppercase tracking-tight">Prevent duplicate entries</span>
                                                            </div>
                                                            <button
                                                                onClick={() => canEdit && setCollectEmail(!collectEmail)}
                                                                disabled={!canEdit}
                                                                className={`w-8 h-4 rounded-full relative transition-all ${collectEmail ? '' : 'bg-gray-200'} disabled:opacity-50`}
                                                                style={collectEmail ? { backgroundColor: themeColor } : {}}
                                                            >
                                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${collectEmail ? 'left-[18px]' : 'left-0.5'}`}></div>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Limit to 1 response</span>
                                                                <span className="text-[8px] text-gray-500 uppercase tracking-tight">Requires Google sign-in</span>
                                                            </div>
                                                            <button
                                                                onClick={() => canEdit && setLimitToOneResponse(!limitToOneResponse)}
                                                                disabled={!canEdit}
                                                                className={`w-8 h-4 rounded-full relative transition-all ${limitToOneResponse ? '' : 'bg-gray-200'} disabled:opacity-50`}
                                                                style={limitToOneResponse ? { backgroundColor: themeColor } : {}}
                                                            >
                                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${limitToOneResponse ? 'left-[18px]' : 'left-0.5'}`}></div>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Allow Edit</span>
                                                                <span className="text-[8px] text-gray-500 uppercase tracking-tight">Respondents can update answers</span>
                                                            </div>
                                                            <button
                                                                onClick={() => canEdit && setAllowResponseEditing(!allowResponseEditing)}
                                                                disabled={!canEdit}
                                                                className={`w-8 h-4 rounded-full relative transition-all ${allowResponseEditing ? '' : 'bg-gray-200'} disabled:opacity-50`}
                                                                style={allowResponseEditing ? { backgroundColor: themeColor } : {}}
                                                            >
                                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${allowResponseEditing ? 'left-[18px]' : 'left-0.5'}`}></div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <button
                                                    onClick={() => setHeaderCollabOpen(!headerCollabOpen)}
                                                    className="flex items-center justify-between w-full p-3 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all group"
                                                >
                                                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Collaborators</span>
                                                    <ChevronRight size={14} className={`text-black transition-transform duration-200 ${headerCollabOpen ? 'rotate-90' : ''}`} />
                                                </button>

                                                {headerCollabOpen && (
                                                    <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                        <div className="space-y-2">
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Add Collaborator</label>
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="email"
                                                                    value={newCollaboratorEmail}
                                                                    onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                                                                    placeholder="Email address"
                                                                    disabled={!isOwner}
                                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-600 focus:bg-white outline-none disabled:opacity-50"
                                                                />
                                                                <div className="flex gap-2">
                                                                    {isOwner && (
                                                                        <select
                                                                            value={newCollaboratorRole}
                                                                            onChange={(e) => setNewCollaboratorRole(e.target.value as 'viewer' | 'editor')}
                                                                            className="flex-1 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-blue-600"
                                                                        >
                                                                            <option value="editor">Editor</option>
                                                                            <option value="viewer">Viewer</option>
                                                                        </select>
                                                                    )}
                                                                    <button
                                                                        onClick={handleAddCollaborator}
                                                                        disabled={isAddingCollaborator || !newCollaboratorEmail || !isOwner}
                                                                        className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
                                                                        style={{ backgroundColor: themeColor }}
                                                                    >
                                                                        {isAddingCollaborator ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                                                        {!isAddingCollaborator && <span className="ml-2 text-[10px] font-bold uppercase tracking-widest">Add</span>}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {collabMessage && (
                                                                <div className={`p-2 rounded-lg text-[10px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1 duration-200 ${collabMessage.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                                    collabMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                                        collabMessage.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                            'bg-blue-50 text-blue-600 border border-blue-100'
                                                                    }`}>
                                                                    {collabMessage.text}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-3">
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Manage Access</label>
                                                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                                                {collaborators.length === 0 && !ownerEmail ? (
                                                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No collaborators yet</p>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {ownerEmail && (
                                                                            <div className="flex items-center justify-between p-3 bg-blue-50/30 border border-blue-100 rounded-xl shadow-sm group mb-2">
                                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                                                                                        {ownerEmail[0]?.toUpperCase() || 'O'}
                                                                                    </div>
                                                                                    <div className="flex flex-col min-w-0">
                                                                                        <span className="text-[10px] font-bold text-gray-700 truncate">{ownerEmail}</span>
                                                                                        <span className="text-[8px] font-bold text-blue-600 uppercase tracking-tight">Owner</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {collaborators.map((c) => (
                                                                            <div key={c.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm group">
                                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                                                                                        {c.email?.[0]?.toUpperCase() || '?'}
                                                                                    </div>
                                                                                    <div className="flex flex-col min-w-0">
                                                                                        <span className="text-[10px] font-bold text-gray-700 truncate">{c.email}</span>
                                                                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">{c.role}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-1 shrink-0">
                                                                                    {isOwner && (
                                                                                        <select
                                                                                            value={c.role}
                                                                                            onChange={(e) => handleUpdateRole(c.id, e.target.value as 'viewer' | 'editor')}
                                                                                            className="p-1 px-1.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-bold uppercase text-gray-600 outline-none hover:bg-white transition-all"
                                                                                        >
                                                                                            <option value="editor">Editor</option>
                                                                                            <option value="viewer">Viewer</option>
                                                                                        </select>
                                                                                    )}
                                                                                    <button
                                                                                        onClick={() => handleRemoveCollaborator(c.id)}
                                                                                        disabled={!isOwner}
                                                                                        className="p-1 px-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all uppercase disabled:hidden"
                                                                                    >
                                                                                        Remove
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : activeElement ? (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Configuration</h2>
                                        <button onClick={() => setActiveElementId(null)} className="p-1.5 text-black hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Field Label</label>
                                            <input
                                                type="text"
                                                value={activeElement.label}
                                                onFocus={() => {
                                                    const defaultLabel = ELEMENT_LABELS[activeElement.type];
                                                    const paragraphDefault = 'Tell us more about yourself';
                                                    const initialDefault = 'What is your name?';
                                                    if (activeElement.label === defaultLabel || (activeElement.type === 'paragraph' && activeElement.label === paragraphDefault) || activeElement.label === initialDefault) {
                                                        updateElement(activeElement.id, { label: '' });
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const limit = activeElement.type === 'paragraph' ? 15 : 10;
                                                    const words = val.trim().split(/\s+/).filter(Boolean);
                                                    if (words.length > limit) return;
                                                    updateElement(activeElement.id, { label: val });
                                                }}
                                                disabled={!canEdit}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:ring-1 focus:ring-blue-600 focus:bg-white outline-none disabled:opacity-50"
                                            />
                                            {activeElement.type === 'paragraph' ? (
                                                <p className="text-[8px] text-gray-400 mt-1 uppercase">Max 15 words</p>
                                            ) : (
                                                <p className="text-[8px] text-gray-400 mt-1 uppercase">Max 10 words</p>
                                            )}
                                        </div>

                                        {activeElement.options && (
                                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Options</label>
                                                <div className="space-y-2">
                                                    {activeElement.options.map((opt, i) => (
                                                        <div
                                                            key={i}
                                                            draggable={canEdit}
                                                            onDragStart={() => canEdit && handleOptionDragStart(i)}
                                                            onDragOver={(e) => canEdit && handleOptionDragOver(e, i)}
                                                            onDrop={() => canEdit && handleOptionDrop(i)}
                                                            onDragEnd={handleOptionDragEnd}
                                                            className={`flex items-center gap-2 relative group transition-all ${optionDragIndex === i ? 'opacity-40 scale-[0.98]' : ''
                                                                } ${!canEdit ? 'cursor-default' : ''}`}
                                                        >
                                                            {optionDragOverIndex === i && optionDragIndex !== null && optionDragIndex !== i && (
                                                                <div className="absolute -top-1.5 left-0 right-0 flex items-center gap-1.5 z-10 pointer-events-none px-6">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-500 border border-white shadow-sm"></div>
                                                                    <div className="flex-1 h-0.5 bg-blue-500 rounded-full shadow-sm"></div>
                                                                </div>
                                                            )}
                                                            <div className={`p-1 cursor-grab active:cursor-grabbing text-black hover:text-gray-900 transition-colors ${!canEdit ? 'hidden' : ''}`}>
                                                                <GripVertical size={12} />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                disabled={!canEdit}
                                                                onFocus={() => {
                                                                    if (opt === `Option ${i + 1}`) {
                                                                        if (activeElement) updateOption(activeElement.id, i, '');
                                                                    }
                                                                }}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    const words = val.trim().split(/\s+/).filter(Boolean);
                                                                    if (words.length > 10) return;
                                                                    if (activeElement) updateOption(activeElement.id, i, val);
                                                                }}
                                                                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-900 outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50"
                                                            />
                                                            {(activeElement.options?.length ?? 0) > 2 && (
                                                                <button
                                                                    onClick={() => { if (activeElement && canEdit) removeOption(activeElement.id, i); }}
                                                                    disabled={!canEdit}
                                                                    className="text-gray-400 hover:text-red-600 p-1 transition-all disabled:hidden"
                                                                >
                                                                    <Trash2 size={12} className="text-gray-900" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => { if (activeElement && canEdit) addOption(activeElement.id); }}
                                                    disabled={!canEdit}
                                                    className="w-full py-2 border border-dashed border-gray-100 rounded-lg text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-1 disabled:hidden"
                                                >
                                                    <Plus size={12} className="text-black font-bold" />
                                                    Add Option
                                                </button>
                                            </div>
                                        )}



                                        {(activeElement.type === 'paragraph' || activeElement.type === 'short_answer') && (
                                            <div className="pt-4 border-t border-gray-50">
                                                <button
                                                    onClick={() => setAdvancedOpen(!advancedOpen)}
                                                    className="flex items-center justify-between w-full p-3 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all group"
                                                >
                                                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Advanced</span>
                                                    <ChevronRight size={14} className={`text-black transition-transform duration-200 ${advancedOpen ? 'rotate-90' : ''}`} />
                                                </button>

                                                {advancedOpen && (
                                                    <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Word Limit</label>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={activeElement.wordLimit || ''}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        if (activeElement) updateElement(activeElement.id, { wordLimit: val > 0 ? val : undefined });
                                                                    }}
                                                                    disabled={!canEdit}
                                                                    placeholder="No limit"
                                                                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-900 focus:ring-1 focus:ring-blue-600 focus:bg-white outline-none disabled:opacity-50"
                                                                />
                                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">words</span>
                                                            </div>
                                                            <p className="text-[9px] text-gray-500 leading-relaxed">Leave empty for unlimited words.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-gray-50">
                                            <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-200 rounded-lg">
                                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Required</span>
                                                <button
                                                    onClick={() => { if (activeElement && canEdit) updateElement(activeElement.id, { required: !activeElement.required }); }}
                                                    disabled={!canEdit}
                                                    className={`w-8 h-4 rounded-full relative transition-all ${activeElement.required ? '' : 'bg-gray-200'} disabled:opacity-50`}
                                                    style={activeElement.required ? { backgroundColor: themeColor } : {}}
                                                >
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${activeElement.required ? 'left-[18px]' : 'left-0.5'}`}></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-300">




                                    <div className="pt-6 border-t border-gray-50 flex flex-col items-center justify-center p-6 text-center text-gray-300">
                                        <h3 className="text-[9px] font-bold uppercase tracking-widest">Select an element to configure</h3>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Published Feed</h2>

                                {formId && (
                                    <div className="pt-4 border-t border-gray-50 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Endpoint</label>
                                            <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-mono text-gray-500 break-all leading-normal min-h-[2.5rem]">
                                                {isMounted ? `${window.location.origin}/view/${formId}` : 'Loading...'}
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
            {
                isSendModalOpen && (
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
                )
            }

            <CommentPanel
                isOpen={isCommentPanelOpen}
                onClose={() => setIsCommentPanelOpen(false)}
                elementId={activeCommentElementId}
                comments={comments.filter(c => c.element_id === activeCommentElementId)}
                onAddComment={(content) => handleCreateComment(activeCommentElementId, content)}
                onDeleteComment={handleDeleteComment}
                currentUser={user}
                collaborators={
                    (() => {
                        const commenterEmails = Array.from(new Set(comments.map(c => c.user_email))).filter(email => email !== user?.email);
                        const commenters = commenterEmails.map(email => ({ id: `commenter-${email}`, email, role: 'commenter' }));

                        const baseCollabs = ownerEmail
                            ? [...collaborators.filter(c => c.email !== ownerEmail), { id: 'owner', email: ownerEmail, role: 'owner' }]
                            : collaborators;

                        // Show all collaborators (including owner and commenters) for mention list
                        const filteredCollabs = baseCollabs;

                        // Combine with commenters
                        const all = [...filteredCollabs];
                        commenters.forEach(comp => {
                            if (!all.some(a => a.email?.toLowerCase() === comp.email?.toLowerCase())) {
                                all.push(comp);
                            }
                        });
                        return all;
                    })()
                }
            />
        </div>
    );
}

interface CommentPanelProps {
    isOpen: boolean;
    onClose: () => void;
    elementId: string | null;
    comments: FormComment[];
    onAddComment: (content: string) => void;
    onDeleteComment: (id: string) => void;
    currentUser: any;
    collaborators: any[];
}

function CommentPanel({ isOpen, onClose, elementId, comments, onAddComment, onDeleteComment, currentUser, collaborators }: CommentPanelProps) {
    const [newComment, setNewComment] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [mentionFilter, setMentionFilter] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    if (!isOpen) return null;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNewComment(val);

        const cursorPosition = e.target.selectionStart;
        const textBeforeCursor = val.slice(0, cursorPosition);
        const atMatch = textBeforeCursor.match(/@([\w.-]*)$/);

        if (atMatch) {
            setShowMentions(true);
            setMentionFilter(atMatch[1].toLowerCase());
        } else {
            setShowMentions(false);
        }
    };

    const insertMention = (collab: any) => {
        const cursorPosition = inputRef.current?.selectionStart || 0;
        const textBeforeAt = newComment.slice(0, cursorPosition).replace(/@\w*$/, '');
        const textAfterAt = newComment.slice(cursorPosition);
        const mentionText = `@${collab.email} `;
        setNewComment(textBeforeAt + mentionText + textAfterAt);
        setShowMentions(false);
        inputRef.current?.focus();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-end">
            <div className="absolute inset-0 bg-black/5" onClick={onClose} />
            <div className="w-80 h-full bg-white shadow-2xl border-l border-gray-100 flex flex-col relative animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-blue-600" />
                        <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">Comments</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-all">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {comments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-dashed border-gray-200">
                            <MessageSquare size={24} className="text-gray-200 mb-2" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No comments yet</p>
                            <p className="text-[9px] text-gray-500 mt-1">Start a conversation about this field.</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-extrabold text-white">
                                            {comment.user_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-900">{comment.user_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-medium text-gray-400">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {currentUser?.email === comment.user_email && (
                                            <button onClick={() => onDeleteComment(comment.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {comment.content.split(/(@\S+)/).map((part, i) =>
                                        part.startsWith('@') ? (
                                            <span key={i} className="text-blue-600 font-bold bg-blue-50 px-1 rounded">{part}</span>
                                        ) : part
                                    )}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-white border-t border-gray-100 relative">
                    {showMentions && (
                        <div className="absolute bottom-full left-0 right-0 max-h-40 overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-t-xl z-10 m-2">
                            {collaborators
                                .filter(c => c.email?.toLowerCase().includes(mentionFilter))
                                .map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => insertMention(c)}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-left transition-all"
                                    >
                                        <AtSign size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-medium text-gray-700">{c.email}</span>
                                    </button>
                                ))}
                        </div>
                    )}
                    <textarea
                        ref={inputRef}
                        value={newComment}
                        onChange={handleTextChange}
                        placeholder="Add a comment... (use @ to tag)"
                        className="w-full h-24 p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:ring-1 focus:ring-blue-600 focus:bg-white outline-none resize-none transition-all"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onAddComment(newComment);
                                setNewComment('');
                            }
                        }}
                    />
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Shift + Enter for new line</span>
                        <button
                            onClick={() => { onAddComment(newComment); setNewComment(''); }}
                            className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
