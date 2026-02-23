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
    status: 'draft' | 'published' | 'in_progress';
    theme_color?: string;
    expires_at?: string | null;
    collect_email?: boolean;
    limit_to_one_response?: boolean;
    allow_response_editing?: boolean;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
    is_archived?: boolean;
    logo_url?: string;
    created_by_email?: string;
}

export async function saveForm(form: Form) {
    let formId = form.id;

    // 1. Save Form Metadata
    if (formId) {
        const updatePayload: any = {
            title: form.title,
            description: form.description,
            status: form.status,
            theme_color: form.theme_color || '#2563eb',
            expires_at: form.expires_at || null,
            collect_email: form.collect_email || false,
            limit_to_one_response: form.limit_to_one_response || false,
            allow_response_editing: form.allow_response_editing || false,
            logo_url: form.logo_url || null,
            updated_at: new Date().toISOString()
        };

        if (form.created_by_email) {
            updatePayload.created_by_email = form.created_by_email;
        }

        const { error } = await supabase
            .from('forms')
            .update(updatePayload)
            .eq('id', formId);

        if (error) throw error;
    } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const insertPayload: any = {
            title: form.title,
            description: form.description,
            status: form.status,
            theme_color: form.theme_color || '#2563eb',
            expires_at: form.expires_at || null,
            collect_email: form.collect_email || false,
            limit_to_one_response: form.limit_to_one_response || false,
            allow_response_editing: form.allow_response_editing || false,
            logo_url: form.logo_url || null,
            created_by: user.id
        };

        if (user.email) {
            insertPayload.created_by_email = user.email;
        }

        const { data, error } = await supabase
            .from('forms')
            .insert(insertPayload)
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
        elements: mappedElements,
        created_by_email: formData.created_by_email
    } as Form;
}

export async function getCollaborators(formId: string) {
    const { data, error } = await supabase
        .from('form_collaborators')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: true });

    if (error) {
        if (error.code === '42P01') return [];
        throw error;
    }
    return data;
}

export async function addCollaborator(formId: string, email: string, role: 'viewer' | 'editor' = 'editor') {
    // Check if already a collaborator
    const { data: existing, error: checkError } = await supabase
        .from('form_collaborators')
        .select('id')
        .eq('form_id', formId)
        .eq('email', email.toLowerCase())
        .maybeSingle();

    if (checkError && checkError.code !== '42P01') throw checkError;
    if (existing) throw new Error('ALREADY_COLLABORATOR');

    const { data, error } = await supabase
        .from('form_collaborators')
        .insert({ form_id: formId, email: email.toLowerCase(), role })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCollaboratorRole(id: string, role: 'viewer' | 'editor') {
    const { error } = await supabase
        .from('form_collaborators')
        .update({ role })
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}

export async function removeCollaborator(id: string) {
    const { error } = await supabase
        .from('form_collaborators')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { success: true };
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

    // 2. Map form responses to 'response_answers' table format
    const answersToInsert = Object.entries(responses).map(([elementId, answer]) => ({
        id: typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2) + Date.now().toString(36),
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

    return { id: responseId };
}

export async function getAllFormsWithStats() {
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 2. Fetch forms created by this user
    const { data: ownedForms, error: formsError } = await supabase
        .from('forms')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

    if (formsError) throw formsError;

    // 3. Fetch forms shared with this user
    const { data: collaborationData, error: collabError } = await supabase
        .from('form_collaborators')
        .select('form_id, role')
        .eq('email', user.email?.toLowerCase());

    // If table doesn't exist yet (42P01) or column 'role' is missing (42703), just skip collaboration part instead of crashing
    if (collabError && collabError.code !== '42P01' && collabError.code !== '42703') throw collabError;

    let sharedForms: any[] = [];
    if (collaborationData && collaborationData.length > 0) {
        const sharedIds = collaborationData.map(c => c.form_id);
        const { data: forms, error: sharedError } = await supabase
            .from('forms')
            .select('*')
            .in('id', sharedIds)
            .order('created_at', { ascending: false });

        if (sharedError) throw sharedError;
        sharedForms = forms || [];
    }

    // Combine and remove duplicates and attach roles
    const allFormsMap = new Map();
    ownedForms.forEach(f => allFormsMap.set(f.id, { ...f, role: 'editor', is_owner: true }));

    sharedForms.forEach(f => {
        const collabInfo = collaborationData?.find(c => c.form_id === f.id);
        allFormsMap.set(f.id, {
            ...f,
            role: (collabInfo as any)?.role || 'editor',
            is_owner: false
        });
    });

    const allForms = Array.from(allFormsMap.values());

    if (allForms.length === 0) return [];

    // 4. Fetch response counts for these forms
    const formIds = allForms.map(f => f.id);
    if (formIds.length === 0) return [];

    const { data: counts, error: countsError } = await supabase
        .from('responses')
        .select('form_id')
        .in('form_id', formIds);

    if (countsError) throw countsError;

    // 5. Map counts to forms
    const statsMap = counts.reduce((acc: Record<string, number>, curr: any) => {
        acc[curr.form_id] = (acc[curr.form_id] || 0) + 1;
        return acc;
    }, {});

    return allForms.map(form => ({
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

    // 3. SECURE: Check if current user is the creator OR a collaborator
    const { data: isCollaborator, error: isCollabError } = await supabase
        .from('form_collaborators')
        .select('id')
        .eq('form_id', formId)
        .eq('email', user.email?.toLowerCase())
        .maybeSingle();

    if (isCollabError && isCollabError.code !== '42P01') throw isCollabError;

    if (form.created_by !== user.id && !isCollaborator) {
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

export async function getUserResponse(formId: string, userId: string) {
    // Temporarily disabled while submitted_by column is missing
    return null;
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

export async function toggleArchiveForm(id: string, isArchived: boolean) {
    const { error } = await supabase
        .from('forms')
        .update({ is_archived: isArchived })
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}

export async function getComments(formId: string) {
    const { data, error } = await supabase
        .from('form_comments')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: true });

    if (error) {
        if (error.code === '42P01') return [];
        throw error;
    }
    return data;
}

export async function addComment(formId: string, elementId: string | null, content: string, userEmail: string, userName?: string) {
    const { data, error } = await supabase
        .from('form_comments')
        .insert({
            form_id: formId,
            element_id: elementId,
            content,
            user_email: userEmail,
            user_name: userName || null
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteComment(id: string) {
    const { error } = await supabase
        .from('form_comments')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}

