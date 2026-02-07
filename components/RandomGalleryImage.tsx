'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type RandomGalleryImageProps = {
  fallbackSrc: string;
  alt: string;
};

type GalleryItem = {
  src: string;
  tags: string[];
};

export default function RandomGalleryImage({ fallbackSrc, alt }: RandomGalleryImageProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [failedSrcs, setFailedSrcs] = useState<string[]>([]);
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);

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

  const candidates = useMemo(
    () => items.filter((item) => !!item.src && !failedSrcs.includes(item.src)),
    [items, failedSrcs]
  );

  useEffect(() => {
    if (!candidates.length) {
      setSelectedSrc(null);
      return;
    }
    const next = candidates[Math.floor(Math.random() * candidates.length)]?.src ?? null;
    setSelectedSrc(next);
  }, [candidates]);

  const src = selectedSrc ?? fallbackSrc;

  return (
    <Image
      src={src}
      alt={alt}
      width={900}
      height={700}
      className="h-64 w-full object-cover md:h-80"
      unoptimized
      onError={() => setFailedSrcs((prev) => (prev.includes(src) ? prev : [...prev, src]))}
    />
  );
}
