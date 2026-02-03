'use client';

import { useMemo, useState } from 'react';
import { siteConfig } from '@/lib/siteConfig';

type ContactFormProps = {
  showTitle?: boolean;
};

export default function ContactForm({ showTitle = true }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const useFormspree = false;
  const formAction = 'https://formspree.io/f/yourFormId';

  const mailto = useMemo(() => {
    const subject = encodeURIComponent('Free Estimate Request');
    const body = encodeURIComponent('Tell us about your project.');
    return `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  }, []);

  if (submitted) {
    return (
      <div className="card">
        <p className="text-lg text-black">Thanks for reaching out.</p>
        <p className="mt-2 text-sm text-black/70">
          We have your request and will respond shortly. For urgent needs, call
          us directly.
        </p>
        <a
          href={siteConfig.phoneHref}
          className="mt-6 inline-flex rounded-full bg-[#1D3461] force-white px-5 py-2 text-sm font-semibold text-white"
        >
          {siteConfig.ctaPrimary}
        </a>
      </div>
    );
  }

  return (
    <div className="card">
      {showTitle ? (
        <div className="mb-6">
          <h3 className="font-display text-2xl text-black">Request an Estimate</h3>
          <p className="text-sm text-black/70">
            Tell us about your project and we will get back to you quickly.
          </p>
        </div>
      ) : null}
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
        <a
          href={siteConfig.phoneHref}
          className="w-full rounded-full bg-[#1D3461] force-white px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-black"
        >
          {siteConfig.ctaPrimary}
        </a>
        <a
          href={siteConfig.smsHref}
          className="w-full rounded-full bg-[#1D3461] force-white px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-black"
        >
          Text Us
        </a>
        <a
          href={mailto}
          className="w-full rounded-full bg-[#1D3461] force-white px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-black"
        >
          Interested
        </a>
        <div className="text-xs text-black/60">Fast response during business hours.</div>
      </div>
    </div>
  );
}
