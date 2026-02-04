'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginForm() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (data.session) {
        router.replace('/admin/gallery');
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage(null);

    if (!supabase) {
      setAuthMessage('Supabase is not configured.');
      return;
    }

    if (!emailInput || !passwordInput) {
      setAuthMessage('Enter an email and password to log in.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput
    });

    if (error) {
      setAuthMessage(error.message);
      return;
    }

    setAuthMessage('Signed in. Redirecting...');
    router.replace('/admin/gallery');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-gray-900 shadow-sm">
          <div className="text-xs uppercase tracking-[0.35em] text-gray-500">
            Login
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900">
            Welcome back.
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Sign in with your email and password.
          </p>
          <form onSubmit={handlePasswordLogin} className="mt-6 grid gap-5">
            <label className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Email
              <input
                type="email"
                required
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Password
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              Log In
            </button>
          </form>
          {authMessage ? (
            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              {authMessage}
            </div>
          ) : null}
          <div className="mt-6 text-sm text-gray-600">
            Need an account?{' '}
            <Link href="/register" className="font-semibold text-gray-900">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
