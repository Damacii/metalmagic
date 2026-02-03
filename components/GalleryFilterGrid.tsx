'use client';

import { useEffect, useMemo, useState } from 'react';
import GalleryGrid, { type GalleryItem } from '@/components/GalleryGrid';
import { supabase } from '@/lib/supabaseClient';

type GalleryFilterGridProps = {
  items: GalleryItem[];
};

type GalleryRow = {
  src: string;
  category: string | null;
};

export default function GalleryFilterGrid({ items }: GalleryFilterGridProps) {
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (!supabase) return;

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
  }, []);

  const mergedItems = useMemo(
    () =>
      items.map((item) => {
        const category = categoryMap[item.src];
        if (!category) return item;
        return {
          ...item,
          tags: [category]
        };
      }),
    [items, categoryMap]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    mergedItems.forEach((item) => {
      item.tags.forEach((tag) => set.add(tag));
    });
    return ['All', ...Array.from(set).sort()];
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
