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
    live_version_id?: string; // Pointer to the currently active FormVersion
    version_number?: number;  // Display version if viewing a specific version
}

export interface FormVersion {
    id: string;
    form_id: string;
    version_number: number;
    content: Partial<Form>;
    created_at: string;
}

export async function saveForm(form: Form) {
    let formId = form.id;

    // 1. Save Form Metadata (Updating the DRAFT state)
    // Even if a form is 'published', edits are saved to the primary table as a DRAFT.
    const updatePayload: any = {
        title: form.title,
        description: form.description,
        status: formId ? undefined : 'draft', // New forms start as draft
        theme_color: form.theme_color || '#2563eb',
        expires_at: form.expires_at || null,
        collect_email: form.collect_email || false,
        limit_to_one_response: form.limit_to_one_response || false,
        allow_response_editing: form.allow_response_editing || false,
        logo_url: form.logo_url || null,
        updated_at: new Date().toISOString()
    };

    if (formId) {
        // ... (update branch is actually fine in line 63, but it was being overshadowed by the mess below)
        const { error } = await supabase
            .from('forms')
            .update(updatePayload)
            .eq('id', formId);

        if (error) throw error;
    } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('forms')
            .insert({
                ...updatePayload,
                status: 'draft',
                created_by: user.id
            })
            .select()
            .single();

        if (error) throw error;
        formId = data.id;
    }

    // 2. Save Form Elements (Updating the DRAFT state)
    const keeperIds = form.elements
        .filter(el => el.id && el.id.length > 10)
        .map(el => el.id);

    // Delete elements that are no longer in the draft
    const deleteQuery = supabase.from('form_elements').delete().eq('form_id', formId);
    if (keeperIds.length > 0) {
        deleteQuery.not('id', 'in', `(${keeperIds.join(',')})`);
    }

    const { error: deleteError } = await deleteQuery;
    if (deleteError) throw deleteError;

    // Upsert current draft elements
    const elementsToUpsert = form.elements.map((el, index) => ({
        id: (el.id && el.id.length > 10) ? el.id : crypto.randomUUID(),
        form_id: formId,
        type: el.type,
        label: el.label,
        placeholder: el.placeholder,
        required: el.required,
        options: el.options,
        max_rating: el.maxRating,
        word_limit: el.wordLimit || null,
        order_index: index
    }));

    if (elementsToUpsert.length > 0) {
        const { error: upsertError } = await supabase
            .from('form_elements')
            .upsert(elementsToUpsert, { onConflict: 'id' });

        if (upsertError) throw upsertError;
    }

    return { id: formId };
}

export async function publishForm(form: Form) {
    // 1. Save the current state as draft first
    // This ensures we have a form ID and that all elements are persisted to the DB
    const { id: savedFormId } = await saveForm(form);

    // Use the potentially new ID for subsequent steps
    const activeFormId = savedFormId;

    // 2. Get the latest version number
    const { data: latestVersion } = await supabase
        .from('form_versions')
        .select('version_number')
        .eq('form_id', activeFormId)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextVersion = (latestVersion?.version_number || 0) + 1;

    // 3. Create a snapshot of the form
    const snapshotContent = {
        title: form.title,
        description: form.description,
        theme_color: form.theme_color,
        logo_url: form.logo_url,
        collect_email: form.collect_email,
        limit_to_one_response: form.limit_to_one_response,
        allow_response_editing: form.allow_response_editing,
        expires_at: form.expires_at,
        elements: form.elements
    };

    // 4. Insert into form_versions
    const { data: versionData, error: versionError } = await supabase
        .from('form_versions')
        .insert({
            form_id: activeFormId,
            version_number: nextVersion,
            content: snapshotContent
        })
        .select()
        .single();

    if (versionError) throw versionError;

    // 5. Update form to point to the new live version
    const { error: updateError } = await supabase
        .from('forms')
        .update({
            live_version_id: versionData.id,
            status: 'published'
        })
        .eq('id', activeFormId);

    if (updateError) throw updateError;

    return { success: true, version: versionData };
}

export async function getForm(id: string, isViewer: boolean = false) {
    // 1. Fetch current Form state from DB
    const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .single();

    if (formError) throw formError;

    // 2. STRICT: If viewer, LOAD ONLY THE LIVE VERSION SNAPSHOT
    if (isViewer) {
        // FALLBACK: If there's no live_version_id but the status is published,
        // it means this is an old form. We load the current metadata/elements as a fallback.
        if (!formData.live_version_id) {
            if (formData.status === 'published') {
                const { data: elementsData } = await supabase
                    .from('form_elements')
                    .select('*')
                    .eq('form_id', id)
                    .order('order_index', { ascending: true });

                return {
                    ...formData,
                    elements: elementsData || []
                } as Form;
            }
            throw new Error("FORM_NOT_PUBLISHED");
        }

        const { data: versionData, error: versionError } = await supabase
            .from('form_versions')
            .select('*')
            .eq('id', formData.live_version_id)
            .single();

        if (versionError) throw versionError;

        const snapshot = versionData.content;

        // Merge metadata (id, timestamps) with versioned content (title, elements)
        return {
            ...formData,
            title: snapshot.title,
            description: snapshot.description,
            theme_color: snapshot.theme_color,
            logo_url: snapshot.logo_url,
            collect_email: snapshot.collect_email,
            limit_to_one_response: snapshot.limit_to_one_response,
            allow_response_editing: snapshot.allow_response_editing,
            expires_at: snapshot.expires_at,
            elements: snapshot.elements, // CRITICAL: This loading elements from snapshot
            version_number: versionData.version_number
        } as Form;
    }

    // 3. For creator, fetch the CURRENT DRAFT (forms + form_elements table)
    const { data: elementsData, error: elementsError } = await supabase
        .from('form_elements')
        .select('*')
        .eq('form_id', id)
        .order('order_index', { ascending: true });

    if (elementsError) throw elementsError;

    const mappedElements: FormElement[] = elementsData.map(el => ({
        id: el.id,
        type: el.type,
        label: el.label,
        placeholder: el.placeholder,
        required: el.required,
        options: el.options,
        maxRating: el.max_rating,
        wordLimit: el.word_limit
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
export async function getVersionHistory(formId: string) {
    const { data, error } = await supabase
        .from('form_versions')
        .select('*')
        .eq('form_id', formId)
        .order('version_number', { ascending: false });

    if (error) throw error;
    return data as FormVersion[];
}

export async function rollbackToVersion(formId: string, versionId: string) {
    const { data: versionData, error: versionError } = await supabase
        .from('form_versions')
        .select('*')
        .eq('id', versionId)
        .single();

    if (versionError) throw versionError;

    // Update the form to point to this version as live
    const { error: updateError } = await supabase
        .from('forms')
        .update({
            live_version_id: versionId,
            status: 'published'
        })
        .eq('id', formId);

    if (updateError) throw updateError;

    // Optional: Overwrite current draft with this version's content?
    // Bubble.io usually keeps drafts separate, but rollback often implies updating the current state too.
    // For now, we only update the LIVE version pointer.

    return { success: true };
}

export async function saveResponse(formId: string, responses: Record<string, any>, userEmail?: string, userId?: string) {
    // 0. Get the current LIVE VERSION ID
    const { data: form, error: formInfoError } = await supabase
        .from('forms')
        .select('live_version_id, status, allow_response_editing, limit_to_one_response')
        .eq('id', formId)
        .single();

    if (formInfoError) throw formInfoError;

    // Safety check: if no live_version_id, only allow if status is 'published' (backward compatibility)
    if (!form.live_version_id && form.status !== 'published') {
        throw new Error("FORM_NOT_PUBLISHED");
    }

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
            .update({
                submitted_at: new Date().toISOString(),
                form_version_id: form.live_version_id // Ensure always tied to the version at time of submission/edit
            })
            .eq('id', existingRespId);
        if (updateError) throw updateError;
        responseId = existingRespId;

        // Delete old answers to replace them
        await supabase.from('response_answers').delete().eq('response_id', responseId);
    } else {
        const responsePayload: any = {
            form_id: formId,
            form_version_id: form.live_version_id, // CRITICAL: Link to version
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
    try {
        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // 2. Fetch forms created by this user
        const { data: ownedForms, error: ownedError } = await supabase
            .from('forms')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });

        if (ownedError) throw ownedError;

        // 3. Fetch forms shared with this user
        const { data: collaborationData, error: collabError } = await supabase
            .from('form_collaborators')
            .select('form_id, role')
            .eq('email', user.email?.toLowerCase());

        // Handle missing table/column cases gracefully
        if (collabError && collabError.code !== '42P01' && collabError.code !== '42703') throw collabError;

        let sharedForms: any[] = [];
        if (collaborationData && collaborationData.length > 0) {
            const sharedIds = collaborationData.map(c => c.form_id);
            const { data: sForms, error: sharedError } = await supabase
                .from('forms')
                .select('*')
                .in('id', sharedIds)
                .order('created_at', { ascending: false });

            if (sharedError) throw sharedError;
            sharedForms = sForms || [];
        }

        // Combine and attach roles
        const allFormsMap = new Map();
        ownedForms.forEach(f => allFormsMap.set(f.id, { ...f, role: 'editor', is_owner: true }));
        sharedForms.forEach(f => {
            if (!allFormsMap.has(f.id)) {
                const collabInfo = collaborationData?.find(c => c.form_id === f.id);
                allFormsMap.set(f.id, {
                    ...f,
                    role: (collabInfo as any)?.role || 'editor',
                    is_owner: false
                });
            }
        });

        const allForms = Array.from(allFormsMap.values());
        if (allForms.length === 0) return [];

        // 4. Fetch response counts
        const formIds = allForms.map(f => f.id);
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
    } catch (err: any) {
        console.error('CRITICAL: getAllFormsWithStats failed:', err.message || err);
        throw err;
    }
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
        const answersMap = responseAnswers.reduce((acc: Record<string, any>, curr: any) => {
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

