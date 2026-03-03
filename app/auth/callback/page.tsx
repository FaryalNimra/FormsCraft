'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, XCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      const type = searchParams.get('type'); // may be 'signup' if Supabase passes it
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Also read `type` from the URL hash fragment (implicit / token-hash flow)
      // e.g. #access_token=…&type=signup
      let hashType: string | null = null;
      if (typeof window !== 'undefined' && window.location.hash) {
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          hashType = hashParams.get('type');
        } catch { /* ignore parse errors */ }
      }

      // Helper: returns true when the session belongs to an email-verified
      // signup (not a Google / social-provider login).
      const isEmailVerification = (user: { app_metadata?: Record<string, unknown> } | null | undefined): boolean => {
        if (type === 'signup' || hashType === 'signup') return true;
        const provider = user?.app_metadata?.provider;
        if (provider === 'email') return true;
        return false;
      };

      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || error);
        return;
      }

      if (code) {
        // ── PKCE flow: exchange authorisation code for session ───────────
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('Exchange Error:', exchangeError);
          setStatus('error');
          setErrorMessage(exchangeError.message);
        } else if (data.session) {
          // ── Email verification / signup flow ──────────────────────────
          if (isEmailVerification(data.user)) {
            await supabase.auth.signOut();
            router.replace('/login?verified=true');
            return;
          }

          // ── Google OAuth and other social providers ───────────────────
          const next = searchParams.get('next') || '/';
          router.replace(next);
          router.refresh();
        }
      } else {
        // ── Implicit / token-hash flow ──────────────────────────────────
        // Supabase auto-detects tokens in the URL hash and establishes a
        // session.  We need to wait briefly for that processing, then
        // apply the same email-verification logic.
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          if (isEmailVerification(session.user)) {
            await supabase.auth.signOut();
            router.replace('/login?verified=true');
            return;
          }

          const next = searchParams.get('next') || '/';
          router.replace(next);
          router.refresh();
        } else {
          // Session not yet available — listen for it (hash processing can
          // be async depending on browser / network).
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
              if (newSession && event === 'SIGNED_IN') {
                subscription.unsubscribe();

                if (isEmailVerification(newSession.user)) {
                  await supabase.auth.signOut();
                  router.replace('/login?verified=true');
                  return;
                }

                const next = searchParams.get('next') || '/';
                router.replace(next);
                router.refresh();
              }
            },
          );

          // Timeout: if nothing happens within 10 s, show an error
          setTimeout(() => {
            subscription.unsubscribe();
            setStatus((prev) => {
              if (prev === 'loading') return 'error';
              return prev;
            });
            setErrorMessage((prev) => prev || 'Authentication timed out. Please try again.');
          }, 10000);
        }
      }
    };

    handleAuth();
  }, [searchParams, router]);

  if (status === 'error') {
    return (
      <div className="text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Failed</h2>
        <p className="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded-lg border border-red-100 max-w-sm mx-auto">
          {errorMessage}
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Loader2 className="h-10 w-10 text-purple-600 animate-spin mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-800">Verifying your email...</h2>
      <p className="text-gray-500 mt-2">Please wait, you will be redirected to login shortly.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<div className="text-center"><Loader2 className="h-10 w-10 text-purple-600 animate-spin mx-auto" /></div>}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
