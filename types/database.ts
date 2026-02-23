
/**
 * Element types supported by the form builder
 * IMPORTANT: Admin and User side MUST use these exact values
 */
export type ElementType =
  | 'short_answer'
  | 'paragraph'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'date'
  | 'time'
  | 'file_upload'
  | 'rating_scale';

/**
 * Form status types
 */
export type FormStatus = 'draft' | 'published';

/**
 * Form table structure
 * Used by: Admin (write), User (read)
 */
export interface Form {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  theme_color?: string; // Added theme_color
  collect_email: boolean; // Added collect_email
  created_by: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  limit_to_one_response: boolean;
  allow_response_editing: boolean;
  is_archived: boolean;
  logo_url: string | null;
}

/**
 * Form element table structure
 * Used by: Admin (write), User (read)
 */
export interface FormElement {
  id: string;
  form_id: string;
  type: ElementType;
  label: string;
  placeholder: string | null;
  required: boolean;
  options: string[] | null;  // For MCQ, Checkboxes, Dropdown
  max_rating: number | null; // For Rating Scale
  word_limit: number | null; // For Paragraph
  order_index: number;
  created_at: string;
}

/**
 * Response table structure
 * Used by: User (write), Admin (read for analytics)
 */
export interface Response {
  id: string;
  form_id: string;
  submitted_by: string | null;
  submitted_at: string;
}

/**
 * Response answer table structure
 * Used by: User (write), Admin (read for analytics)
 */
export interface ResponseAnswer {
  id: string;
  response_id: string;
  element_id: string;
  answer: string | null;
  file_url: string | null;
  created_at: string;
}

/**
 * Form collaborator table structure
 */
export interface FormCollaborator {
  id: string;
  form_id: string;
  email: string;
  role: 'viewer' | 'editor';
  created_at: string;
}

/**
 * Form comment table structure
 */
export interface FormComment {
  id: string;
  form_id: string;
  element_id: string | null;
  user_email: string;
  user_name: string | null;
  content: string;
  created_at: string;
}

// ============================================
// COMPOSITE TYPES (for joined queries)
// ============================================

/**
 * Form with its elements (for User side fetching)
 */
export interface FormWithElements extends Form {
  elements: FormElement[];
}

/**
 * Response with all answers (for Admin analytics)
 */
export interface ResponseWithAnswers extends Response {
  answers: ResponseAnswer[];
}

// ============================================
// INPUT TYPES (for creating/updating)
// ============================================

/**
 * Create form input (Admin side)
 */
export interface CreateFormInput {
  title: string;
  description?: string;
  status?: FormStatus;
  created_by?: string;
}

/**
 * Create form element input (Admin side)
 */
export interface CreateFormElementInput {
  form_id: string;
  type: ElementType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  max_rating?: number;
  order_index: number;
}

/**
 * Submit response input (User side)
 */
export interface SubmitResponseInput {
  form_id: string;
  submitted_by?: string;
  user_email?: string; // Added user_email
}

/**
 * Submit answer input (User side)
 */
export interface SubmitAnswerInput {
  response_id: string;
  element_id: string;
  answer?: string;
  file_url?: string;
}

// ============================================
// ELEMENT TYPE MAPPING (for rendering)
// ============================================

export const ELEMENT_TYPE_LABELS: Record<ElementType, string> = {
  short_answer: 'Short Answer',
  paragraph: 'Paragraph',
  multiple_choice: 'Multiple Choice',
  checkboxes: 'Checkboxes',
  dropdown: 'Dropdown',
  date: 'Date',
  time: 'Time',
  file_upload: 'File Upload',
  rating_scale: 'Rating Scale',
};

// ============================================
// SUPABASE TABLE NAMES (constants)
// ============================================

export const TABLES = {
  FORMS: 'forms',
  FORM_ELEMENTS: 'form_elements',
  RESPONSES: 'responses',
  RESPONSE_ANSWERS: 'response_answers',
  FORM_COLLABORATORS: 'form_collaborators',
  FORM_COMMENTS: 'form_comments',
} as const;

export const STORAGE_BUCKETS = {
  FORM_UPLOADS: 'form-uploads',
} as const;
