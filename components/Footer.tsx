import { siteConfig } from '@/lib/siteConfig';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="container flex flex-col gap-6 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg text-white">{siteConfig.name}</p>
          <p>{siteConfig.serviceArea}</p>
          <p>{siteConfig.addressLine}</p>
        </div>
        <div className="flex flex-col gap-2">
          <a href={siteConfig.phoneHref} className="text-white">
            {siteConfig.phone}
          </a>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          <p>{siteConfig.hours}</p>
          <div className="mt-2 flex items-center gap-4 text-white/70">
            <a
              href={siteConfig.socials.whatsapp}
              aria-label="WhatsApp"
              className="transition hover:text-brand-orange"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M12.04 2.02c-5.5 0-9.98 4.48-9.98 9.99 0 1.76.46 3.47 1.34 4.99L2 22l5.17-1.36a9.93 9.93 0 0 0 4.87 1.27h.01c5.5 0 9.98-4.49 9.98-10 0-5.51-4.48-9.99-9.99-9.99zm5.82 13.9c-.24.68-1.44 1.31-1.99 1.39-.51.07-1.15.1-1.86-.12-.43-.13-.97-.32-1.68-.63-2.95-1.27-4.88-4.24-5.03-4.45-.15-.21-1.2-1.6-1.2-3.06 0-1.46.76-2.18 1.03-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.41-.07.64.49.24.56.81 1.93.88 2.07.07.14.12.3.02.5-.1.21-.15.3-.3.47-.15.17-.32.38-.46.51-.15.15-.3.31-.13.6.17.3.75 1.22 1.6 1.98 1.1.98 2.02 1.28 2.32 1.42.3.14.47.12.64-.07.17-.2.74-.86.94-1.15.2-.29.39-.24.66-.14.27.1 1.7.8 1.99.95.29.14.48.21.55.33.07.12.07.7-.17 1.38z" />
              </svg>
              <span className="sr-only">WhatsApp</span>
            </a>
            <a
              href={siteConfig.socials.instagram}
              aria-label="Instagram"
              className="transition hover:text-brand-orange"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm5.25-3.25a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0z" />
              </svg>
              <span className="sr-only">Instagram</span>
            </a>
            <a
              href={siteConfig.socials.facebook}
              aria-label="Facebook"
              className="transition hover:text-brand-orange"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M13.5 9H15V6.5c0-1.1.9-2 2-2H19V2h-2.5A4.5 4.5 0 0 0 12 6.5V9H10v2.5h2V22h2.5V11.5h2.2L18 9h-3.5z" />
              </svg>
              <span className="sr-only">Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
