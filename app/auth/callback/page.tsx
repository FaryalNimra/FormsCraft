'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || error);
        return;
      }

      if (code) {
        // Exchange code for session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('Exchange Error:', exchangeError);
          setStatus('error');
          setErrorMessage(exchangeError.message);
        } else if (data.session) {
          // Immediately redirect without showing success screen
          router.push('/');
          router.refresh();
        }
      } else {
        // No code, check if we already have a session (implicit flow or already logged in)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/');
        } else {
          setStatus('error');
          setErrorMessage('No authentication code found.');
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
      <h2 className="text-xl font-semibold text-gray-800">Verifying...</h2>
      <p className="text-gray-500 mt-2">Completing secure sign in with Google.</p>
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
