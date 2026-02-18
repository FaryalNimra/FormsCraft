import { supabase, generateUploadPath } from './supabase';
import { STORAGE_BUCKETS } from '@/types/database';

export type ElementType = 'short_answer' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'date' | 'time' | 'file_upload' | 'rating_scale';

export interface FormElement {
    id: string;
    type: ElementType;
    label: string;
    placeholder: string;
    required: boolean;
    options?: string[];
    maxRating?: number;
    wordLimit?: number;
}

export interface Form {
    id?: string;
    title: string;
    description?: string;
    elements: FormElement[];
    status: 'draft' | 'published' | 'in_progress';
    theme_color?: string;
    expires_at?: string | null;
    collect_email?: boolean;
    limit_to_one_response?: boolean;
    allow_response_editing?: boolean;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
    last_edited_at?: string | null;
    last_accessed_at?: string;
    is_archived?: boolean;
}

export async function saveForm(form: Form) {
    let formId = form.id;

    // 1. Save Form Metadata
    let lastEditedAt = null;

    if (formId) {
        // Fetch existing form to check if content changed
        const { data: existing, error: fetchError } = await supabase
            .from('forms')
            .select('*')
            .eq('id', formId)
            .single();

        if (fetchError) throw fetchError;

        // Compare content (excluding status)
        const hasContentChanges =
            existing.title !== form.title ||
            existing.description !== form.description ||
            existing.theme_color !== (form.theme_color || '#2563eb') ||
            existing.expires_at !== (form.expires_at || null) ||
            existing.collect_email !== (form.collect_email || false);

        // We also need to check elements, but elements are saved later.
        // For simplicity and performance, if elements are sent in form object, 
        // we'll check if they match. However, JSON.stringify comparison is a bit heavy but works.
        // We'll also fetch elements to be sure.
        const { data: existingElements } = await supabase
            .from('form_elements')
            .select('*')
            .eq('form_id', formId)
            .order('order_index', { ascending: true });

        const mappedExisting = (existingElements || []).map(el => ({
            id: el.id,
            type: el.type,
            label: el.label,
            placeholder: el.placeholder,
            required: el.required,
            options: el.options,
            maxRating: el.max_rating,
            wordLimit: el.word_limit || undefined
        }));

        const elementsChanged = JSON.stringify(mappedExisting) !== JSON.stringify(form.elements);

        const shouldUpdateEditedAt = hasContentChanges || elementsChanged;

        const updateData: any = {
            title: form.title,
            description: form.description,
            status: form.status,
            theme_color: form.theme_color || '#2563eb',
            expires_at: form.expires_at || null,
            collect_email: form.collect_email || false,
            limit_to_one_response: form.limit_to_one_response || false,
            allow_response_editing: form.allow_response_editing || false,
            updated_at: new Date().toISOString()
        };

        if (shouldUpdateEditedAt) {
            updateData.last_edited_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('forms')
            .update(updateData)
            .eq('id', formId);

        if (error) throw error;
    } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('forms')
            .insert({
                title: form.title,
                description: form.description,
                status: form.status,
                theme_color: form.theme_color || '#2563eb',
                expires_at: form.expires_at || null,
                collect_email: form.collect_email || false,
                created_by: user.id,
                last_edited_at: now,
                limit_to_one_response: form.limit_to_one_response || false,
                allow_response_editing: form.allow_response_editing || false
            })
            .select()
            .single();

        if (error) throw error;
        formId = data.id;
    }

    // 2. Save Form Elements
    const incomingIds = form.elements
        .map(el => el.id)
        .filter(id => id && id.length > 10);

    // Delete elements that are NO LONGER in the form
    // If incomingIds is empty, we delete all elements for this form
    let deleteQuery = supabase.from('form_elements').delete().eq('form_id', formId);
    if (incomingIds.length > 0) {
        deleteQuery = deleteQuery.not('id', 'in', `(${incomingIds.join(',')})`);
    }

    const { error: deleteError } = await deleteQuery;
    if (deleteError) throw deleteError;

    // Prepare elements for upsert
    const elementsToUpsert = form.elements.map((el, index) => {
        const element: any = {
            form_id: formId,
            type: el.type,
            label: el.label,
            placeholder: el.placeholder,
            required: el.required,
            options: el.options,
            max_rating: el.maxRating,
            word_limit: el.wordLimit || null,
            order_index: index
        };

        // Only include ID if it's a valid UUID (to preserve it)
        // Ensure every element has a valid UUID. 
        // If the database doesn't have a DEFAULT gen_random_uuid() for the id column, we must provide it.
        if (el.id && el.id.length > 10) {
            element.id = el.id;
        } else {
            element.id = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2) + Date.now().toString(36);
        }

        return element;
    });

    if (elementsToUpsert.length > 0) {
        const { error: upsertError } = await supabase
            .from('form_elements')
            .upsert(elementsToUpsert);

        if (upsertError) throw upsertError;
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

    // 2.5 Update last_accessed_at
    await supabase.from('forms').update({ last_accessed_at: new Date().toISOString() }).eq('id', id);

    // 3. Combine and Map Data
    const mappedElements: FormElement[] = elementsData.map(el => ({
        id: el.id,
        type: el.type,
        label: el.label,
        placeholder: el.placeholder,
        required: el.required,
        options: el.options,
        maxRating: el.max_rating,
        wordLimit: el.word_limit || undefined
    }));

    return {
        ...formData,
        elements: mappedElements
    } as Form;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(formId: string, file: File): Promise<string> {
    const filePath = generateUploadPath(formId, file.name);

    const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.FORM_UPLOADS)
        .upload(filePath, file);

    if (error) {
        console.error('File upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.FORM_UPLOADS)
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

export async function saveResponse(formId: string, responses: Record<string, any>, userEmail?: string, userId?: string) {
    // 1. Check for duplicate submission or update
    let existingRespId: string | null = null;
    if (userEmail) {
        const { data: existingResponse, error: checkError } = await supabase
            .from('responses')
            .select('id')
            .eq('form_id', formId)
            .eq('user_email', userEmail)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existingResponse) {
            // Fetch form settings to see how to handle existing response
            const { data: form, error: formError } = await supabase
                .from('forms')
                .select('limit_to_one_response, allow_response_editing')
                .eq('id', formId)
                .single();

            if (formError) throw formError;

            if (form.allow_response_editing) {
                existingRespId = existingResponse.id;
            } else if (form.limit_to_one_response) {
                throw new Error("ALREADY_SUBMITTED");
            }
        }
    }

    // 2. Create or Update a record in the 'responses' table
    let responseId: string;

    if (existingRespId) {
        const { error: updateError } = await supabase
            .from('responses')
            .update({ submitted_at: new Date().toISOString() })
            .eq('id', existingRespId);
        if (updateError) throw updateError;
        responseId = existingRespId;

        // Delete old answers to replace them
        await supabase.from('response_answers').delete().eq('response_id', responseId);
    } else {
        const responsePayload: any = {
            form_id: formId,
            user_email: userEmail || null,
            submitted_at: new Date().toISOString(),
            id: typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2) + Date.now().toString(36)
        };

        const { data: responseData, error: responseError } = await supabase
            .from('responses')
            .insert(responsePayload)
            .select()
            .single();

        if (responseError) throw responseError;
        responseId = responseData.id;
    }

    // 2. Map form responses to 'response_answers' table format and handle file uploads
    const answersToInsert = [];

    for (const [elementId, answer] of Object.entries(responses)) {
        let answerText = null;
        let fileUrl = null;

        // Detect if answer is a File object OR if it's a blob-like object representing a file
        if (answer instanceof File || (answer && typeof answer === 'object' && 'name' in answer && 'size' in answer)) {
            answerText = (answer as File).name;
            fileUrl = await uploadFile(formId, answer as File);
        } else if (Array.isArray(answer)) {
            answerText = JSON.stringify(answer);
        } else if (answer !== null && answer !== undefined) {
            answerText = String(answer);
        }

        answersToInsert.push({
            response_id: responseId,
            element_id: elementId,
            answer: answerText,
            file_url: fileUrl
        });
    }

    // 3. Insert all answers into the 'response_answers' table
    if (answersToInsert.length > 0) {
        const { error: answersError } = await supabase
            .from('response_answers')
            .insert(answersToInsert);

        if (answersError) throw answersError;
    }

    return { id: responseId };
}

/**
 * Toggle archiving status of a form
 */
export async function toggleArchiveForm(id: string, isArchived: boolean) {
    const { error } = await supabase
        .from('forms')
        .update({ is_archived: isArchived })
        .eq('id', id);

    if (error) throw error;
}

export async function getAllFormsWithStats() {
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 2. Fetch forms created by this user
    const { data: forms, error: formsError } = await supabase
        .from('forms')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

    if (formsError) throw formsError;

    // 3. Fetch response counts for these forms
    const formIds = forms.map(f => f.id);
    if (formIds.length === 0) return [];

    const { data: counts, error: countsError } = await supabase
        .from('responses')
        .select('form_id')
        .in('form_id', formIds);

    if (countsError) throw countsError;

    // 4. Map counts to forms
    const statsMap = counts.reduce((acc: Record<string, number>, curr: any) => {
        acc[curr.form_id] = (acc[curr.form_id] || 0) + 1;
        return acc;
    }, {});

    return forms.map(form => ({
        ...form,
        response_count: statsMap[form.id] || 0
    }));
}

export async function getResponseDetails(formId: string) {
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');

    // 2. Fetch form metadata and elements
    const form = await getForm(formId);

    // 3. SECURE: Check if current user is the creator
    if (form.created_by !== user.id) {
        throw new Error('UNAUTHORIZED');
    }

    // 4. Fetch all responses for this form
    const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

    if (responsesError) throw responsesError;

    // 4.5 Update last_accessed_at
    await supabase.from('forms').update({ last_accessed_at: new Date().toISOString() }).eq('id', formId);

    if (responses.length === 0) return { form, responsesWithAnswers: [] };

    // 5. Fetch all answers for these responses
    const responseIds = responses.map(r => r.id);
    const { data: answers, error: answersError } = await supabase
        .from('response_answers')
        .select('*')
        .in('response_id', responseIds);

    if (answersError) throw answersError;

    // 6. Map answers to responses
    const responsesWithAnswers = responses.map(r => {
        const responseAnswers = answers.filter(a => a.response_id === r.id);
        const answersMap = responseAnswers.reduce((acc: Record<string, { answer: string | null, file_url: string | null }>, curr: any) => {
            acc[curr.element_id] = {
                answer: curr.answer,
                file_url: curr.file_url
            };
            return acc;
        }, {});

        return {
            ...r,
            answers: answersMap
        };
    });

    return {
        form,
        responsesWithAnswers
    };
}

export async function getUserResponse(formId: string, userId: string) {
    // Fetch the most recent response for this form and user
    const { data: response, error: responseError } = await supabase
        .from('responses')
        .select(`
            *,
            answers:response_answers(*)
        `)
        .eq('form_id', formId)
        .eq('created_by', userId) // Assuming we added user tracking to responses
        .order('submitted_at', { ascending: false })
        .maybeSingle();

    if (responseError) throw responseError;
    if (!response) return null;

    // Map answers into a Record<string, any> for the builder/view
    const answersMap: Record<string, any> = {};
    (response.answers || []).forEach((ans: any) => {
        // Handle JSON array for multiple choice/checkboxes if stored as string
        let val = ans.answer;
        try {
            if (val && (val.startsWith('[') || val.startsWith('{'))) {
                val = JSON.parse(val);
            }
        } catch (e) {
            // Not JSON, keep as string
        }
        answersMap[ans.element_id] = val;
    });

    return {
        ...response,
        answers: answersMap
    };
}

export async function deleteForm(id: string) {
    // 1. Delete associated data first (to handle potential lack of CASCADE)

    // Delete response answers
    const { data: responses } = await supabase
        .from('responses')
        .select('id')
        .eq('form_id', id);

    if (responses && responses.length > 0) {
        const responseIds = responses.map(r => r.id);
        await supabase
            .from('response_answers')
            .delete()
            .in('response_id', responseIds);

        await supabase
            .from('responses')
            .delete()
            .eq('form_id', id);
    }

    // Delete elements
    await supabase
        .from('form_elements')
        .delete()
        .eq('form_id', id);

    // 2. Finally delete the form
    const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', id);

    if (error) throw error;

    return { success: true };
}
