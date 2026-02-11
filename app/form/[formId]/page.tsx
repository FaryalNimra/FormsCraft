'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, Send, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase, generateUploadPath, handleSupabaseError } from '@/lib/supabase';
import { Form, FormElement, TABLES, STORAGE_BUCKETS } from '@/types/database';
import FormElementRenderer from '@/components/form-elements/FormElementRenderer';

type FormValues = Record<string, string | string[] | number | File | null>;
type FormErrors = Record<string, string>;

export default function FormResponsePage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  // States
  const [form, setForm] = useState<Form | null>(null);
  const [elements, setElements] = useState<FormElement[]>([]);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch form and elements
  const fetchForm = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);

      // Fetch form
      const { data: formData, error: formError } = await supabase
        .from(TABLES.FORMS)
        .select('*')
        .eq('id', formId)
        .eq('status', 'published')
        .single();

      if (formError) {
        if (formError.code === 'PGRST116') {
          setFetchError('Form not found or not published yet.');
        } else {
          setFetchError(handleSupabaseError(formError));
        }
        return;
      }

      setForm(formData);

      // Fetch elements
      const { data: elementsData, error: elementsError } = await supabase
        .from(TABLES.FORM_ELEMENTS)
        .select('*')
        .eq('form_id', formId)
        .order('order_index', { ascending: true });

      if (elementsError) {
        setFetchError(handleSupabaseError(elementsError));
        return;
      }

      setElements(elementsData || []);

      // Initialize form values
      const initialValues: FormValues = {};
      (elementsData || []).forEach((el: FormElement) => {
        if (el.type === 'checkboxes') {
          initialValues[el.id] = [];
        } else if (el.type === 'rating_scale') {
          initialValues[el.id] = 0;
        } else if (el.type === 'file_upload') {
          initialValues[el.id] = null;
        } else {
          initialValues[el.id] = '';
        }
      });
      setValues(initialValues);
    } catch (err) {
      setFetchError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId, fetchForm]);

  // Handle value change
  const handleValueChange = (elementId: string, value: string | string[] | number | File | null) => {
    setValues((prev) => ({ ...prev, [elementId]: value }));
    // Clear error when user types
    if (errors[elementId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[elementId];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let firstErrorId: string | null = null;

    elements.forEach((element) => {
      if (element.required) {
        const value = values[element.id];
        
        if (element.type === 'checkboxes') {
          if (!Array.isArray(value) || value.length === 0) {
            newErrors[element.id] = 'Please select at least one option';
            if (!firstErrorId) firstErrorId = element.id;
          }
        } else if (element.type === 'rating_scale') {
          if (typeof value !== 'number' || value === 0) {
            newErrors[element.id] = 'Please provide a rating';
            if (!firstErrorId) firstErrorId = element.id;
          }
        } else if (element.type === 'file_upload') {
          if (!value) {
            newErrors[element.id] = 'Please upload a file';
            if (!firstErrorId) firstErrorId = element.id;
          }
        } else {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            newErrors[element.id] = 'This field is required';
            if (!firstErrorId) firstErrorId = element.id;
          }
        }
      }
    });

    setErrors(newErrors);

    // Scroll to first error
    if (firstErrorId) {
      const element = document.getElementById(firstErrorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  // Upload file to Supabase Storage
  const uploadFile = async (file: File): Promise<string | null> => {
    const filePath = generateUploadPath(formId, file.name);
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.FORM_UPLOADS)
      .upload(filePath, file);

    if (error) {
      console.error('File upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.FORM_UPLOADS)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Create response record
      const { data: responseData, error: responseError } = await supabase
        .from(TABLES.RESPONSES)
        .insert({
          form_id: formId,
          submitted_by: null, // Can add user identification later
        })
        .select()
        .single();

      if (responseError) {
        throw new Error(handleSupabaseError(responseError));
      }

      // Prepare answers
      const answers = [];

      for (const element of elements) {
        const value = values[element.id];
        let answerText: string | null = null;
        let fileUrl: string | null = null;

        if (element.type === 'file_upload' && value instanceof File) {
          fileUrl = await uploadFile(value);
        } else if (element.type === 'checkboxes' && Array.isArray(value)) {
          answerText = JSON.stringify(value);
        } else if (element.type === 'rating_scale' && typeof value === 'number') {
          answerText = value.toString();
        } else if (typeof value === 'string') {
          answerText = value || null;
        }

        answers.push({
          response_id: responseData.id,
          element_id: element.id,
          answer: answerText,
          file_url: fileUrl,
        });
      }

      // Insert all answers
      const { error: answersError } = await supabase
        .from(TABLES.RESPONSE_ANSWERS)
        .insert(answers);

      if (answersError) {
        throw new Error(handleSupabaseError(answersError));
      }

      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit form: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Form Not Available</h1>
          <p className="text-gray-500 mb-6">{fetchError}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-500 mb-8">Your response has been submitted successfully.</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setValues({});
                elements.forEach((el) => {
                  if (el.type === 'checkboxes') {
                    setValues((prev) => ({ ...prev, [el.id]: [] }));
                  } else if (el.type === 'rating_scale') {
                    setValues((prev) => ({ ...prev, [el.id]: 0 }));
                  } else if (el.type === 'file_upload') {
                    setValues((prev) => ({ ...prev, [el.id]: null }));
                  } else {
                    setValues((prev) => ({ ...prev, [el.id]: '' }));
                  }
                });
              }}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Submit Another Response
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <FileText size={18} fill="white" />
            </div>
            <span className="text-lg font-bold text-gray-900">FormCraft</span>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <form onSubmit={handleSubmit}>
          {/* Form Header */}
          <div className="bg-purple-600 rounded-2xl p-8 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative">
              <h1 className="text-2xl font-bold mb-2">{form?.title}</h1>
              {form?.description && (
                <p className="text-purple-100 text-sm">{form.description}</p>
              )}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20"></div>
          </div>

          {/* Form Elements */}
          <div className="space-y-4">
            {elements.map((element) => (
              <FormElementRenderer
                key={element.id}
                element={element}
                value={values[element.id]}
                onChange={(value) => handleValueChange(element.id, value)}
                error={errors[element.id]}
              />
            ))}
          </div>

          {/* Submit Button */}
          {elements.length > 0 && (
            <div className="mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-200/50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit
                  </>
                )}
              </button>
            </div>
          )}

          {/* Empty state */}
          {elements.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Yet</h3>
              <p className="text-gray-500">This form doesn&apos;t have any questions yet.</p>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
