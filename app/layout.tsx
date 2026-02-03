import type { Metadata } from 'next';
import { Oswald, Roboto_Slab, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyMobileBar from '@/components/StickyMobileBar';
import { siteConfig } from '@/lib/siteConfig';

const displayFont = Oswald({
  subsets: ['latin'],
  variable: '--font-display'
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body'
});

const navFont = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-nav',
  weight: '600'
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  metadataBase: new URL('https://metalmagicinc.com'),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: 'website',
    url: 'https://metalmagicinc.com'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${navFont.variable}`}
    >
      <body>
        {/* Google tag (gtag.js) placeholder */}
        {/*
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"
            strategy="afterInteractive"
          />
          <Script id="gtag" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-XXXXXXX');`}
          </Script>
        */}
        {/* Google Ads conversion tracking placeholder */}
        {/*
          <Script id="gtag-ads-conversion" strategy="afterInteractive">
            {`gtag('event', 'conversion', { 'send_to': 'AW-XXXXXXX/XXXXXXXXXX' });`}
          </Script>
        */}
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <section className="border-t border-white/10 py-16">
            <div className="container">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white">
                <iframe
                  title="Metal Magic Ornamental Inc. Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3353.2849843784093!2d-116.9790922!3d32.8112132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d959552481b277%3A0x76dcf8b284f36488!2sMetal%20Magic%20Ornamental%20Inc.!5e0!3m2!1sen!2sus!4v1768513132420!5m2!1sen!2sus"
                  className="h-[360px] w-full md:h-[460px]"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </section>
          <Footer />
        </div>
        <StickyMobileBar />
      </body>
    </html>
  );
}
