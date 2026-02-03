'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { siteConfig } from '@/lib/siteConfig';
import HeroSparks from '@/components/HeroSparks';

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);

  return (
    <section
      ref={heroRef}
      className="diamond-plate relative overflow-hidden border-b border-white/10"
    >
      <HeroSparks heroRef={heroRef} activeSelector=".hero-cta" />
      <div className="container relative z-10 py-24 md:py-32">
        <div className="flex flex-col items-center gap-3 text-center">
          <span
            className="logo-mark h-24 w-24 bg-black md:h-32 md:w-32"
            aria-hidden="true"
          />
          <span className="text-sm font-semibold tracking-[0.3em] text-black md:text-base">
            METAL MAGIC ORNAMENTAL INC
          </span>
          <span className="text-xs font-semibold tracking-[0.2em] text-black/80 md:text-sm">
            License Number : 1142235
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={siteConfig.phoneHref}
              className="hero-cta rounded-full bg-[#1D3461] force-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              {siteConfig.ctaPrimary}
            </a>
            <a
              href="#contact"
              className="hero-cta rounded-full bg-[#1D3461] force-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              {siteConfig.ctaSecondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
