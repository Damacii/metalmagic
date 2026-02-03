'use client';

import Image from 'next/image';
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ADMIN_EMAIL, DEFAULT_GALLERY_CATEGORIES } from '@/lib/adminConfig';
import { supabase } from '@/lib/supabaseClient';
import { galleryItems } from '@/lib/siteConfig';

type GalleryRow = {
  src: string;
  category: string | null;
};

export default function AdminGalleryManager() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(DEFAULT_GALLERY_CATEGORIES);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [pendingCategories, setPendingCategories] = useState<Record<string, string>>({});
  const [emailInput, setEmailInput] = useState(ADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [adminItems, setAdminItems] = useState(galleryItems);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAdmin = sessionEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const hasSession = Boolean(sessionEmail);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const client = supabase;

    const initSession = async () => {
      const { data } = await client.auth.getSession();
      if (!isMounted) return;
      setSessionEmail(data.session?.user?.email ?? null);
      setIsLoading(false);
    };

    initSession();

    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !isAdmin) return;

    let isMounted = true;
    const client = supabase;
    const loadCategories = async () => {
      const { data, error } = await client.from('gallery_items').select('src, category');
      if (error || !data || !isMounted) return;
      const nextMap: Record<string, string> = {};
      (data as GalleryRow[]).forEach((row) => {
        if (row.category) {
          nextMap[row.src] = row.category;
        }
      });
      setCategoryMap(nextMap);
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const mergedItems = useMemo(
    () =>
      adminItems.map((item) => ({
        ...item,
        category:
          pendingCategories[item.src] ??
          categoryMap[item.src] ??
          item.tags[0] ??
          'Other'
      })),
    [adminItems, categoryMap, pendingCategories]
  );

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage(null);

    if (!supabase) {
      setAuthMessage('Supabase is not configured.');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: emailInput,
      options: { shouldCreateUser: false }
    });
    setAuthMessage(
      error ? error.message : 'Check your email for the sign-in link.'
    );
  };

  const handlePasswordLogin = async () => {
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

    setAuthMessage(error ? error.message : 'Signed in.');
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSessionEmail(null);
  };

  const handleCategoryChange = (src: string, nextCategory: string) => {
    setPendingCategories((prev) => ({ ...prev, [src]: nextCategory }));
  };

  const handleCategorySave = async (src: string) => {
    if (!supabase || !isAdmin) return;
    const nextCategory = pendingCategories[src];
    if (!nextCategory) return;
    setIsSaving(src);
    setAuthMessage(null);

    const { error } = await supabase
      .from('gallery_items')
      .upsert({ src, category: nextCategory }, { onConflict: 'src' });

    if (error) {
      setAuthMessage(error.message);
    } else {
      setCategoryMap((prev) => ({ ...prev, [src]: nextCategory }));
      setPendingCategories((prev) => {
        const next = { ...prev };
        delete next[src];
        return next;
      });
    }
    setIsSaving(null);
  };

  const handleAddCategory = () => {
    const next = customCategory.trim();
    if (!next || categories.includes(next)) return;
    setCategories((prev) => [...prev, next]);
    setCustomCategory('');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length || !supabase) return;
    setUploadMessage(null);
    setIsUploading(true);

    try {
      const uploadedItems: { src: string; tags: string[] }[] = [];

      for (const file of files) {
        const safeName = file.name.replace(/\s+/g, '-');
        const path = `${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from('Fotos').upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

        if (error) {
          throw error;
        }

        const { data } = supabase.storage.from('Fotos').getPublicUrl(path);
        const publicUrl = data.publicUrl;
        uploadedItems.push({ src: publicUrl, tags: ['Gallery'] });

        setCategoryMap((prev) => ({ ...prev, [publicUrl]: 'Gallery' }));
        await supabase
          .from('gallery_items')
          .upsert({ src: publicUrl, category: 'Gallery' }, { onConflict: 'src' });
      }

      setAdminItems((prev) => [...uploadedItems, ...prev]);
      setUploadMessage('Upload complete.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      setUploadMessage(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
      {!supabase ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable admin access.
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-6 text-sm text-gray-500">Loading your session...</div>
      ) : null}

      {!isLoading && !isAdmin && !hasSession ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-gray-900 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-gray-600">
              Admin Studio
            </div>
            <h2 className="mt-6 text-4xl font-semibold text-gray-900 md:text-5xl">
              Tag the gallery with precision.
            </h2>
            <p className="mt-4 max-w-lg text-base text-gray-600">
              Organize images by category so visitors can filter instantly. Only verified admin accounts can update tags.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Live tags
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Supabase sync
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Admin-only
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-900 shadow-sm">
            <div className="text-xs uppercase tracking-[0.35em] text-gray-500">
              Sign In
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Use your admin email to receive a magic link or sign in with a password.
            </p>
            <form onSubmit={handleSignIn} className="mt-6 grid gap-5">
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
                Password (optional)
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none"
                />
              </label>
              <div className="grid gap-3">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
                >
                  Send Magic Link
                </button>
                <button
                  type="button"
                  onClick={handlePasswordLogin}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gray-900 transition hover:bg-gray-100"
                >
                  Log In
                </button>
              </div>
            </form>
            {authMessage ? (
              <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                {authMessage}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {!isLoading && hasSession && !isAdmin ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
          <div className="text-sm">
            You are signed in as {sessionEmail}, but this account is not authorized to edit the gallery.
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 rounded-xl border border-amber-200 bg-amber-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-900 transition hover:bg-amber-200"
          >
            Sign Out
          </button>
        </div>
      ) : null}

      {!isLoading && isAdmin ? (
        <div className="mt-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-gray-500">
                Admin Session
              </div>
              <div className="mt-2 text-sm text-gray-900">
                Signed in as {sessionEmail}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-gray-200 bg-gray-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-black"
            >
              Sign Out
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Add Category
              </span>
              <input
                type="text"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="New category"
                className="w-full max-w-xs rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="rounded-xl border border-gray-200 bg-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-white transition hover:bg-black"
              >
                Add
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="rounded-xl border border-gray-200 bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? 'Uploading...' : 'Add New Image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUploadFiles}
                className="hidden"
              />
            </div>
            {uploadMessage ? (
              <div className="mt-4 text-sm text-gray-600">{uploadMessage}</div>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {mergedItems.map((item, index) => (
              <div
                key={item.src}
                className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300"
              >
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                  <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-700">
                    {index + 1}
                  </div>
                  <div className="absolute right-3 top-3 z-10 rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-700">
                    {item.category}
                  </div>
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.src}
                      alt="Gallery preview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      unoptimized
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] uppercase tracking-[0.35em] text-gray-500">
                    Category
                  </label>
                  <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
                    <select
                      value={item.category}
                      onChange={(event) => handleCategoryChange(item.src, event.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-300 focus:outline-none"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleCategorySave(item.src)}
                      disabled={!pendingCategories[item.src] || isSaving === item.src}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving === item.src ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
