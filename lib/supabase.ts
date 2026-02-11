// lib/supabase.ts
// SHARED FILE - Both team members use this client

import { createClient } from '@supabase/supabase-js';

// Environment variables (must be set in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env.local file.\n' +
    'Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Supabase client for browser/client-side operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Helper function to handle Supabase errors
 */
export function handleSupabaseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unknown error occurred';
}

/**
 * Generate a unique file path for uploads
 * @param formId - The form ID
 * @param fileName - Original file name
 * @returns Unique storage path
 */
export function generateUploadPath(formId: string, fileName: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop() || '';
  return `${formId}/${timestamp}-${randomSuffix}.${extension}`;
}
