'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type ServiceImageProps = {
  folder: string;
  fallbackSrc: string;
  alt: string;
};

type GalleryItem = {
  src: string;
  tags: string[];
};

export default function ServiceImage({ folder, fallbackSrc, alt }: ServiceImageProps) {
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

  const match = useMemo(() => {
    const normalizedFolder = folder.toLowerCase();
    return items.filter((item) => {
      const tag = item.tags[0] ?? '';
      return tag.toLowerCase() === normalizedFolder && !failedSrcs.includes(item.src);
    });
  }, [failedSrcs, folder, items]);

  useEffect(() => {
    if (!match.length) {
      setSelectedSrc(null);
      return;
    }
    const next = match[Math.floor(Math.random() * match.length)]?.src ?? null;
    setSelectedSrc(next);
  }, [match]);

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
