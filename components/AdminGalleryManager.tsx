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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
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
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [draggedSrc, setDraggedSrc] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [adminItems, setAdminItems] = useState(galleryItems);
  const [storageCount, setStorageCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDevBypass = process.env.NODE_ENV === 'development';
  const isAdmin = isDevBypass || sessionEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const hasSession = Boolean(sessionEmail);

  const filenameCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(categoryMap).forEach(([src, category]) => {
      try {
        const url = new URL(src);
        const filename = decodeURIComponent(url.pathname.split('/').pop() ?? '');
        if (filename) {
          map[filename] = category;
        }
      } catch {
        const fallback = decodeURIComponent(src.split('/').pop() ?? '');
        if (fallback) {
          map[fallback] = category;
        }
      }
    });
    return map;
  }, [categoryMap]);

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
    };

    const loadCategories = async () => {
      const { data, error } = await client.from('gallery_items').select('src, category');
      if (!isMounted) return;
      if (error) {
        setStatusMessage(error.message);
        setIsLoading(false);
        return;
      }
      if (data) {
        const nextMap: Record<string, string> = {};
        (data as GalleryRow[]).forEach((row) => {
          if (row.category) {
            nextMap[row.src] = row.category;
          }
        });
        setCategoryMap(nextMap);
      }
    };

    const loadImages = async () => {
      const { data, error } = await client.storage.from('Fotos').list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      if (!isMounted) return;
      if (error) {
        setStatusMessage(error.message);
        setIsLoading(false);
        return;
      }
      const items =
        data?.map((file) => {
          const { data: publicData } = client.storage.from('Fotos').getPublicUrl(file.name);
          return { src: publicData.publicUrl, tags: ['Gallery'] };
        }) ?? [];
      setAdminItems(items);
      setStorageCount(items.length);
    };

    initSession();
    Promise.all([loadCategories(), loadImages()]).finally(() => {
      if (isMounted) setIsLoading(false);
    });

    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const mergedItems = useMemo(
    () =>
      adminItems.map((item) => {
        let filename = '';
        try {
          const url = new URL(item.src);
          filename = decodeURIComponent(url.pathname.split('/').pop() ?? '');
        } catch {
          filename = decodeURIComponent(item.src.split('/').pop() ?? '');
        }
        return {
          ...item,
          category:
            pendingCategories[item.src] ??
            categoryMap[item.src] ??
            (filename ? filenameCategoryMap[filename] : undefined) ??
            item.tags[0] ??
            'Other'
        };
      }),
    [adminItems, categoryMap, filenameCategoryMap, pendingCategories]
  );

  const visibleItems = useMemo(
    () => {
      const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? '';
      return mergedItems.filter((item) => normalize(item.category) === 'gallery');
    },
    [mergedItems]
  );

  const handleCategoryDrop = async (category: string) => {
    if (!supabase || !draggedSrc || !isAdmin) return;
    const src = draggedSrc;
    setDropTarget(null);
    setPendingCategories((prev) => ({ ...prev, [src]: category }));
    setIsSaving(src);
    setStatusMessage(null);

    const { error } = await supabase
      .from('gallery_items')
      .upsert({ src, category }, { onConflict: 'src' });

    if (error) {
      setStatusMessage(error.message);
      setPendingCategories((prev) => {
        const next = { ...prev };
        delete next[src];
        return next;
      });
    } else {
      setCategoryMap((prev) => ({ ...prev, [src]: category }));
      setPendingCategories((prev) => {
        const next = { ...prev };
        delete next[src];
        return next;
      });
    }
    setIsSaving(null);
  };

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

  const handleDeleteItem = async (src: string) => {
    if (!supabase) return;
    setStatusMessage(null);

    const isConfirmed = window.confirm('Delete this image? This cannot be undone.');
    if (!isConfirmed) return;

    try {
      const url = new URL(src);
      const marker = '/storage/v1/object/';
      const markerIndex = url.pathname.indexOf(marker);
      let objectPath =
        markerIndex >= 0 ? url.pathname.slice(markerIndex + marker.length) : url.pathname;
      objectPath = objectPath.replace(/^\/+/, '');
      if (objectPath.startsWith('public/')) {
        objectPath = objectPath.slice('public/'.length);
      }
      if (objectPath.startsWith('Fotos/')) {
        objectPath = objectPath.slice('Fotos/'.length);
      }
      if (!objectPath) {
        throw new Error('Unable to locate storage object path.');
      }

      const { error: storageError } = await supabase.storage
        .from('Fotos')
        .remove([objectPath]);

      if (storageError) {
        throw storageError;
      }

      const { error: dbError } = await supabase
        .from('gallery_items')
        .delete()
        .eq('src', src);

      if (dbError) {
        throw dbError;
      }

      setAdminItems((prev) => prev.filter((item) => item.src !== src));
      setCategoryMap((prev) => {
        const next = { ...prev };
        delete next[src];
        return next;
      });
      setPendingCategories((prev) => {
        const next = { ...prev };
        delete next[src];
        return next;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed.';
      setStatusMessage(message);
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
          <div className="mt-6 text-sm text-gray-500">Loading gallery data...</div>
        ) : null}

        {!isLoading && !hasSession && !isDevBypass ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-gray-900 shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-gray-600">
                Admin Studio
              </div>
              <h2 className="mt-6 text-4xl font-semibold text-gray-900 md:text-5xl">
                Create your admin account.
              </h2>
              <p className="mt-4 max-w-lg text-base text-gray-600">
                Set a password to sign in and manage gallery tags with drag and drop.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  Password login
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  Drag to tag
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  Supabase sync
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-900 shadow-sm">
              <div className="text-xs uppercase tracking-[0.35em] text-gray-500">
                Sign Up
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Create your admin account with a password.
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
                    value={passwordInput}
                    onChange={(event) => setPasswordInput(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Confirm Password
                  <input
                    type="password"
                    value={confirmPasswordInput}
                    onChange={(event) => setConfirmPasswordInput(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:outline-none"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
                >
                  Create Account
                </button>
              </form>
              <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="text-xs uppercase tracking-[0.35em] text-gray-500">
                  Sign In
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Already have an account? Sign in with your password.
                </p>
                <div className="mt-4 grid gap-3">
                  <button
                    type="button"
                    onClick={handlePasswordLogin}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gray-900 transition hover:bg-gray-100"
                  >
                    Log In
                  </button>
                </div>
              </div>
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
          {storageCount !== null ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
              Loaded {storageCount} images from storage.
            </div>
          ) : null}

          {statusMessage ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
              {statusMessage}
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Drag + Drop Tagging
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Drag any image card onto a category chip to tag it instantly.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
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
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {categories.map((category) => {
                const isActive = dropTarget === category;
                return (
                  <div
                    key={category}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDropTarget(category);
                    }}
                    onDragLeave={() => {
                      setDropTarget((prev) => (prev === category ? null : prev));
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleCategoryDrop(category);
                    }}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                      isActive
                        ? 'border-gray-900 bg-gray-900 !text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {category}
                  </div>
                );
              })}
            </div>
            {uploadMessage ? (
              <div className="mt-4 text-sm text-gray-600">{uploadMessage}</div>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item, index) => (
              <div
                key={item.src}
                draggable
                onDragStart={() => setDraggedSrc(item.src)}
                onDragEnd={() => {
                  setDraggedSrc(null);
                  setDropTarget(null);
                }}
                className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300"
              >
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                  <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-700">
                    {index + 1}
                  </div>
                  <div className="absolute right-3 top-3 z-10 rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-700">
                    {item.category}
                  </div>
                  {isSaving === item.src ? (
                    <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
                      Saving
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.src)}
                    className="absolute bottom-3 left-3 z-10 rounded-full border border-red-200 bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-red-600 transition hover:border-red-300 hover:bg-red-50"
                  >
                    Delete
                  </button>
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
                <div className="text-[10px] uppercase tracking-[0.35em] text-gray-500">
                  Drag this card onto a category above
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
