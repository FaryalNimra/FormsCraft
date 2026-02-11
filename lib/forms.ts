import { supabase } from './supabase';

export type ElementType = 'short_answer' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'date' | 'file_upload' | 'rating_scale';

export interface FormElement {
    id: string;
    type: ElementType;
    label: string;
    placeholder: string;
    required: boolean;
    options?: string[];
    maxRating?: number;
}

export interface Form {
    id?: string;
    title: string;
    description?: string;
    elements: FormElement[];
    status: 'draft' | 'published';
}

export async function saveForm(form: Form) {
    let formId = form.id;

    // 1. Save Form Metadata
    if (formId) {
        const { error } = await supabase
            .from('forms')
            .update({
                title: form.title,
                description: form.description,
                status: form.status,
                updated_at: new Date().toISOString()
            })
            .eq('id', formId);

        if (error) throw error;
    } else {
        const { data, error } = await supabase
            .from('forms')
            .insert({
                title: form.title,
                description: form.description,
                status: form.status
            })
            .select()
            .single();

        if (error) throw error;
        formId = data.id;
    }

    // 2. Save Form Elements
    // Delete existing elements first
    const { error: deleteError } = await supabase
        .from('form_elements')
        .delete()
        .eq('form_id', formId);

    if (deleteError) throw deleteError;

    // Insert new elements
    const elementsToInsert = form.elements.map((el, index) => ({
        form_id: formId,
        type: el.type,
        label: el.label,
        placeholder: el.placeholder,
        required: el.required,
        options: el.options,
        max_rating: el.maxRating,
        order_index: index
    }));

    if (elementsToInsert.length > 0) {
        const { error: insertError } = await supabase
            .from('form_elements')
            .insert(elementsToInsert);

        if (insertError) throw insertError;
    }

    return { id: formId };
}

export async function getForm(id: string) {
    // 1. Fetch Form Metadata
    const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .single();

    if (formError) throw formError;

    // 2. Fetch Form Elements
    const { data: elementsData, error: elementsError } = await supabase
        .from('form_elements')
        .select('*')
        .eq('form_id', id)
        .order('order_index', { ascending: true });

    if (elementsError) throw elementsError;

    // 3. Combine and Map Data
    const mappedElements: FormElement[] = elementsData.map(el => ({
        id: el.id,
        type: el.type,
        label: el.label,
        placeholder: el.placeholder,
        required: el.required,
        options: el.options,
        maxRating: el.max_rating
    }));

    return {
        ...formData,
        elements: mappedElements
    } as Form;
}
