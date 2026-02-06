'use client';

import Image from 'next/image';
import { type DragEvent, type MouseEvent, useEffect, useMemo, useState } from 'react';

export type GalleryItem = {
  src: string;
  tags: string[];
};

type GalleryGridProps = {
  items: GalleryItem[];
};

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hiddenSrcs, setHiddenSrcs] = useState<string[]>([]);

  const handleDragStart = (event: DragEvent) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveIndex(null);
        return;
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((prev) => {
          if (prev === null) return prev;
          return (prev + 1) % items.length;
        });
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((prev) => {
          if (prev === null) return prev;
          return (prev - 1 + items.length) % items.length;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items.length]);

  const visibleItems = useMemo(
    () => items.filter((item) => !hiddenSrcs.includes(item.src)),
    [items, hiddenSrcs]
  );

  const activeItem = activeIndex !== null ? visibleItems[activeIndex] : null;

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-4 [column-gap:1rem]">
        {visibleItems.map((item, index) => (
          <button
            key={`${item.src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            onDragStart={handleDragStart}
            style={{ WebkitTouchCallout: 'none' }}
            className="group relative mb-4 w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left"
          >
            <Image
              src={item.src}
              alt={`${item.tags[0] ?? 'Project'} project`}
              width={640}
              height={480}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              quality={70}
              unoptimized
              draggable={false}
              onDragStart={handleDragStart}
              onError={() =>
                setHiddenSrcs((prev) => (prev.includes(item.src) ? prev : [...prev, item.src]))
              }
              className="pointer-events-none h-auto w-full select-none transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/gallery/logo metal magic white.png')",
                backgroundRepeat: 'repeat',
                backgroundSize: '140px 140px',
                backgroundPosition: 'center'
              }}
            />
          </button>
        ))}
      </div>
      {activeItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-10"
          role="dialog"
          aria-modal="true"
          style={{ WebkitTouchCallout: 'none' }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setActiveIndex(null)}
            className="absolute right-6 top-6 rounded-full bg-[#1D3461] force-white px-3 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            X
          </button>
          <div className="relative flex flex-col items-center">
            <div className="relative">
              <Image
                src={activeItem.src}
                alt={`${activeItem.tags[0] ?? 'Project'} enlarged`}
                width={1600}
                height={1200}
                sizes="(max-width: 768px) 95vw, 90vw"
                unoptimized
                loading="eager"
                draggable={false}
                onDragStart={handleDragStart}
                onError={() => {
                  setHiddenSrcs((prev) =>
                    prev.includes(activeItem.src) ? prev : [...prev, activeItem.src]
                  );
                  setActiveIndex((prev) => {
                    if (prev === null) return prev;
                    return visibleItems.length > 1 ? (prev + 1) % visibleItems.length : null;
                  });
                }}
                className="pointer-events-none h-auto max-h-[80vh] w-auto max-w-[90vw] select-none rounded-2xl border border-white/10 object-contain"
                priority
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "url('/gallery/logo metal magic white.png')",
                  backgroundRepeat: 'repeat',
                  backgroundSize: '180px 180px',
                  backgroundPosition: 'center'
                }}
              />
              <button
                type="button"
                aria-label="Previous image"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === null ? prev : (prev - 1 + visibleItems.length) % visibleItems.length
                  )
                }
                className="absolute -left-[70px] top-1/2 hidden -translate-y-1/2 rounded-full bg-[#1D3461] force-white px-3 py-2 text-sm font-semibold text-white transition hover:bg-black md:block"
              >
                Prev
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === null ? prev : (prev + 1) % visibleItems.length
                  )
                }
                className="absolute -right-[70px] top-1/2 hidden -translate-y-1/2 rounded-full bg-[#1D3461] force-white px-3 py-2 text-sm font-semibold text-white transition hover:bg-black md:block"
              >
                Next
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-white/60">
              <span>{activeItem.tags.join(' • ')}</span>
              <span>
                {(activeIndex ?? 0) + 1} / {visibleItems.length}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
