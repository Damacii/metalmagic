'use client';

import { useEffect, useMemo, useState } from 'react';

type GalleryItem = {
  src: string;
  tags: string[];
};

const AUTO_ADVANCE_MS = 3500;

export default function HeroImageStrip() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const response = await fetch('/api/gallery/local', { cache: 'no-store' });
        const payload = (await response.json()) as { items?: GalleryItem[] };
        if (!isMounted) return;
        setItems(payload.items ?? []);
      } catch {
        if (!isMounted) return;
        setItems([]);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleItems = useMemo(() => items.filter((item) => !!item.src), [items]);
  const maxIndex = Math.max(visibleItems.length - 1, 0);

  useEffect(() => {
    if (visibleItems.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(interval);
  }, [maxIndex, visibleItems.length]);

  return (
    <section className="border-b border-white/10 bg-white/10">
      <div className="container py-8">
        <div className="mx-auto w-full max-w-xl">
          <div className="aspect-square overflow-hidden rounded-2xl border border-white/10">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url('${visibleItems[activeIndex]?.src ?? ''}')` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
