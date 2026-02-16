// lib/auth.ts
// 🔵 TEAMMATE - Authentication helper functions using Supabase Auth

import { supabase } from './supabase';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

// ============================================================
// SIGN UP - Create new account with email & password
// ============================================================
export async function signUp(
  email: string,
  password: string,
  fullName?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

// ============================================================
// SIGN IN - Login with email & password
// ============================================================
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// ============================================================
// SIGN IN WITH GOOGLE - OAuth via Supabase
// ============================================================
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

// ============================================================
// SIGN OUT - Logout current user
// ============================================================
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ============================================================
// GET CURRENT USER - Get logged in user details
// ============================================================
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ============================================================
// GET SESSION - Get current auth session
// ============================================================
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ============================================================
// RESET PASSWORD - Send password reset email
// ============================================================
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
  });
  if (error) throw error;
}

// ============================================================
// UPDATE PASSWORD - Change password (for logged in user)
// ============================================================
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
}

// ============================================================
// AUTH STATE LISTENER - Subscribe to auth changes
// ============================================================
export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
