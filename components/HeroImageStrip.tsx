'use client';

import { useEffect, useState } from 'react';

const heroImages = [
  { name: 'Fence', url: '/gallery/fence-2.svg' },
  { name: 'Gate', url: '/gallery/gate-2.svg' },
  { name: 'Railing', url: '/gallery/rail-2.svg' },
  { name: 'Security', url: '/gallery/security-2.svg' },
  { name: 'Repairs', url: '/gallery/repair-2.svg' }
];

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
