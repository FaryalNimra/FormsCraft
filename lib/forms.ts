import { supabase } from './supabase';

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
    status: 'draft' | 'published';
    theme_color?: string;
    expires_at?: string | null;
    collect_email?: boolean;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
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
                theme_color: form.theme_color || '#2563eb',
                expires_at: form.expires_at || null,
                collect_email: form.collect_email || false,
                updated_at: new Date().toISOString()
            })
            .eq('id', formId);

        if (error) throw error;
    } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('forms')
            .insert({
                title: form.title,
                description: form.description,
                status: form.status,
                theme_color: form.theme_color || '#2563eb',
                expires_at: form.expires_at || null,
                collect_email: form.collect_email || false,
                // IMPORTANT: Ensure you have run: ALTER TABLE forms ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
                created_by: user.id
            })
            .select()
            .single();

        if (error) throw error;
        formId = data.id;
    }

    // 2. Save Form Elements
    const keeperIds = form.elements
        .filter(el => el.id && el.id.length > 10)
        .map(el => el.id);

    // Delete elements that are no longer in the form
    const deleteQuery = supabase.from('form_elements').delete().eq('form_id', formId);
    if (keeperIds.length > 0) {
        deleteQuery.not('id', 'in', `(${keeperIds.join(',')})`);
    }

    const { error: deleteError } = await deleteQuery;
    if (deleteError) throw deleteError;

    // Insert or update current elements
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

        if (el.id && el.id.length > 10) {
            element.id = el.id;
        }

        return element;
    });

    if (elementsToUpsert.length > 0) {
        const { error: upsertError } = await supabase
            .from('form_elements')
            .upsert(elementsToUpsert, { onConflict: 'id' });

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

export async function saveResponse(formId: string, responses: Record<string, any>, userEmail?: string) {
    // 0. Check for duplicate submission if email collection is enabled
    if (userEmail) {
        const { data: existingResponse, error: checkError } = await supabase
            .from('responses')
            .select('id')
            .eq('form_id', formId)
            .eq('user_email', userEmail)
            .maybeSingle();

        if (checkError) throw checkError;
        if (existingResponse) {
            throw new Error("ALREADY_SUBMITTED");
        }
    }

    // 1. Create a record in the 'responses' table
    const { data: responseData, error: responseError } = await supabase
        .from('responses')
        .insert({
            form_id: formId,
            user_email: userEmail,
            submitted_at: new Date().toISOString()
        })
        .select()
        .single();

    if (responseError) throw responseError;

    const responseId = responseData.id;

    // 2. Map form responses to 'response_answers' table format
    const answersToInsert = Object.entries(responses).map(([elementId, answer]) => ({
        response_id: responseId,
        element_id: elementId,
        answer: Array.isArray(answer) ? answer.join(', ') : String(answer),
    }));

    // 3. Insert all answers into the 'response_answers' table
    if (answersToInsert.length > 0) {
        const { error: answersError } = await supabase
            .from('response_answers')
            .insert(answersToInsert);

        if (answersError) throw answersError;
    }

    return responseData;
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
        const answersMap = responseAnswers.reduce((acc: Record<string, string>, curr: any) => {
            acc[curr.element_id] = curr.answer;
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
