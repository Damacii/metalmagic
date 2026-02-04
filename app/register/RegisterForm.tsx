'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterForm() {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage(null);

    if (!supabase) {
      setAuthMessage('Supabase is not configured.');
      return;
    }

    if (!emailInput || !passwordInput) {
      setAuthMessage('Enter an email and password to sign up.');
      return;
    }

    if (passwordInput.length < 6) {
      setAuthMessage('Password must be at least 6 characters.');
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      setAuthMessage('Passwords do not match.');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: emailInput,
      password: passwordInput
    });

    setAuthMessage(
      error ? error.message : 'Account created. Check your email to confirm, then sign in.'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-gray-900 shadow-sm">
          <div className="text-xs uppercase tracking-[0.35em] text-gray-500">
            Register
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900">
            Create your account.
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Set a password to access the admin tools.
          </p>
          <form onSubmit={handleSignUp} className="mt-6 grid gap-5">
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
            <label className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Confirm Password
              <input
                type="password"
                required
                value={confirmPasswordInput}
                onChange={(event) => setConfirmPasswordInput(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-2xl bg-black px-5 py-3 text-sm font-semibold !text-white transition hover:bg-gray-900"
            >
              Create Account
            </button>
          </form>
          {authMessage ? (
            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              {authMessage}
            </div>
          ) : null}
          <div className="mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-gray-900">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
