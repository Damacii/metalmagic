'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

type JobsItem = {
  src: string;
};

export default function JobsSlider() {
  const [items, setItems] = useState<JobsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadJobs = async () => {
      try {
        const response = await fetch('/api/jobs', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed');
        const payload = (await response.json()) as { items?: JobsItem[] };
        if (!isMounted) return;
        setItems(payload.items ?? []);
      } catch {
        if (!isMounted) return;
        setItems([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasItems = items.length > 0;
  const imageCountLabel = useMemo(() => `${items.length} photos`, [items.length]);

  const scrollByCards = (direction: 'prev' | 'next') => {
    if (!scrollerRef.current) return;
    const { clientWidth } = scrollerRef.current;
    const distance = Math.max(280, Math.round(clientWidth * 0.8));
    scrollerRef.current.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth'
    });
  };

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/50">
            Recent Jobs
          </p>
          <h3 className="mt-2 font-display text-2xl text-black">In-progress & finished installs</h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-black/50">
          <span>{imageCountLabel}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCards('prev')}
              className="rounded-full border border-black/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-black/70 transition hover:border-black hover:text-black"
              aria-label="Scroll previous"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => scrollByCards('next')}
              className="rounded-full border border-black/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-black/70 transition hover:border-black hover:text-black"
              aria-label="Scroll next"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 text-sm text-black/60">Loading photos...</div>
      ) : !hasItems ? (
        <div className="mt-6 rounded-2xl border border-black/10 bg-black/[0.03] p-6 text-sm text-black/60">
          Add photos to the `public/jobs` folder to populate this slider.
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
        >
          {items.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              className="w-[75vw] shrink-0 snap-start sm:w-[45vw] lg:w-[30vw]"
            >
              <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                <Image
                  src={item.src}
                  alt="Job photo"
                  width={1200}
                  height={900}
                  sizes="(max-width: 640px) 75vw, (max-width: 1024px) 45vw, 30vw"
                  className="h-[260px] w-full object-cover transition duration-500 group-hover:scale-[1.02] sm:h-[280px] lg:h-[320px]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
