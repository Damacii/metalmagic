'use client';

import { useEffect, useState } from 'react';

const supabaseBaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://qavufnmvclihoacgnsql.supabase.co';
const heroImages = [
  'WhatsApp Image 2025-12-13 at 11.43.26 AM (1).jpeg',
  'WhatsApp Image 2025-12-13 at 11.43.29 AM (3).jpeg',
  'WhatsApp Image 2025-12-13 at 11.43.29 AM.jpeg',
  'WhatsApp Image 2025-12-13 at 11.43.31 AM (4).jpeg',
  'WhatsApp Image 2025-12-13 at 11.43.31 AM.jpeg'
].map((name) => ({
  name,
  url: `${supabaseBaseUrl}/storage/v1/object/public/Fotos/${encodeURIComponent(
    name
  )}`
}));

export default function HeroImageStrip() {
  const [activeIndex, setActiveIndex] = useState(0);
  const secondaryIndex = (activeIndex + 1) % heroImages.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="border-b border-white/10 bg-white/10">
      <div className="container py-8">
        <div className="mx-auto w-full max-w-xl">
          <div className="aspect-square overflow-hidden rounded-2xl border border-white/10">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url('${heroImages[activeIndex]?.url}')` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
