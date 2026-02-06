'use client';

import { useEffect, useMemo, useState } from 'react';
import GalleryGrid, { type GalleryItem } from '@/components/GalleryGrid';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_GALLERY_CATEGORIES } from '@/lib/adminConfig';

type GalleryFilterGridProps = {
  items: GalleryItem[];
};

type GalleryRow = {
  src: string;
  category: string | null;
};

export default function GalleryFilterGrid({ items }: GalleryFilterGridProps) {
  const [storageItems, setStorageItems] = useState<GalleryItem[] | null>(null);
  const [localItems, setLocalItems] = useState<GalleryItem[] | null>(null);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const loadLocalItems = async () => {
      try {
        const response = await fetch('/api/gallery/local', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed');
        const payload = (await response.json()) as { items?: GalleryItem[] };
        if (!isMounted) return;
        setLocalItems(payload.items ?? []);
      } catch {
        if (!isMounted) return;
        setLocalItems([]);
      }
    };

    loadLocalItems();

    if (!supabase) return;

    const client = supabase;
    const loadStorageItems = async () => {
      const { data, error } = await client.storage.from('Fotos').list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      if (!isMounted) return;
      if (error) {
        return;
      }
      const nextItems =
        data?.map((file) => {
          const { data: publicData } = client.storage.from('Fotos').getPublicUrl(file.name);
          return { src: publicData.publicUrl, tags: ['Gallery'] };
        }) ?? [];
      setStorageItems(nextItems);
    };
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
    loadStorageItems();
    return () => {
      isMounted = false;
    };
  }, []);

  const baseItems =
    storageItems && storageItems.length > 0
      ? storageItems
      : localItems && localItems.length > 0
        ? localItems
        : items;

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

  const mergedItems = useMemo(
    () =>
      baseItems.map((item) => {
        let filename = '';
        try {
          const url = new URL(item.src);
          filename = decodeURIComponent(url.pathname.split('/').pop() ?? '');
        } catch {
          filename = decodeURIComponent(item.src.split('/').pop() ?? '');
        }
        if (item.src.startsWith('/gallery/') && item.tags[0] !== 'Gallery') {
          return item;
        }
        const category = categoryMap[item.src] ?? (filename ? filenameCategoryMap[filename] : undefined);
        if (!category) return item;
        return {
          ...item,
          tags: [category]
        };
      }),
    [baseItems, categoryMap, filenameCategoryMap]
  );

  const categories = useMemo(() => {
    const available = new Set<string>();
    mergedItems.forEach((item) => {
      item.tags.forEach((tag) => available.add(tag));
    });
    available.delete('Gallery');
    available.delete('gallery');
    const extras = Array.from(available).filter(
      (category) => !DEFAULT_GALLERY_CATEGORIES.includes(category)
    );
    return ['All', ...DEFAULT_GALLERY_CATEGORIES, ...extras];
  }, [mergedItems]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') return mergedItems;
    return mergedItems.filter((item) => item.tags.includes(activeFilter));
  }, [mergedItems, activeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveFilter(category)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
              activeFilter === category
                ? 'border-[#1D3461] bg-[#1D3461] !text-white'
                : 'border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <GalleryGrid items={filteredItems} />
    </div>
  );
}
