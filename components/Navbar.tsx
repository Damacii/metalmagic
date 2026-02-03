'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ADMIN_EMAIL } from '@/lib/adminConfig';
import { siteConfig } from '@/lib/siteConfig';
import { supabase } from '@/lib/supabaseClient';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;
    const client = supabase;

    const initSession = async () => {
      const { data } = await client.auth.getSession();
      if (!isMounted) return;
      setSessionEmail(data.session?.user?.email ?? null);
    };

    initSession();

    const { data: subscription } = client.auth.onAuthStateChange(
      (_event, session) => {
        setSessionEmail(session?.user?.email ?? null);
      }
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = sessionEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const desktopLinks = isAdmin
    ? [...navLinks, { label: 'Admin', href: '/admin' }]
    : navLinks;

  return (
    <header className="absolute inset-x-0 top-0 z-40 bg-transparent md:sticky md:border-b md:border-white/10 md:bg-gray-300 md:backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-brand-blue"
          aria-label={siteConfig.name}
        />
        <nav className="hidden items-center gap-8 font-[var(--font-nav)] text-xl font-semibold text-[#14224A] md:flex">
          {desktopLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-[#0F1B3B]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <a
            href={siteConfig.phoneHref}
            className="rounded-full bg-[#1B2D5C] force-white px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#16244A]"
          >
            {siteConfig.ctaPrimary}
          </a>
          {isAdmin ? (
            <span className="rounded-full border border-[#1B2D5C]/40 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1B2D5C]">
              Admin
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#1B2D5C] text-[#1B2D5C] transition hover:bg-[#1B2D5C] hover:text-white"
          >
            <span className="sr-only">Menu</span>
            <span className="flex flex-col items-center gap-1">
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>
        </div>
      </div>
      {isOpen ? (
        <div id="mobile-nav" className="md:hidden">
          <div className="container pb-4">
            <nav className="flex flex-col gap-3 rounded-2xl border border-[#1B2D5C]/20 bg-gray-200 px-4 py-4 text-sm text-[#1B2D5C] shadow-sm">
              {desktopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 transition hover:bg-[#1B2D5C] hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
