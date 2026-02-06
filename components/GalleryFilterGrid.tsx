'use client';

import { useEffect, useMemo, useState } from 'react';
import GalleryGrid, { type GalleryItem } from '@/components/GalleryGrid';
import { DEFAULT_GALLERY_CATEGORIES } from '@/lib/adminConfig';

type GalleryFilterGridProps = {
  items: GalleryItem[];
};

export default function GalleryFilterGrid({ items }: GalleryFilterGridProps) {
  const [localItems, setLocalItems] = useState<GalleryItem[] | null>(null);
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
    return () => {
      isMounted = false;
    };
  }, []);

  const baseItems = localItems && localItems.length > 0 ? localItems : items;
  const mergedItems = useMemo(() => baseItems, [baseItems]);

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
