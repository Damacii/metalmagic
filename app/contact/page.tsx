import SectionHeading from '@/components/SectionHeading';
import ContactForm from '@/components/ContactForm';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: 'Contact'
};

export default function ContactPage() {
  return (
    <div className="container py-16">
      <SectionHeading
        kicker="Contact"
        title="Let us know what you need"
        description="Request an estimate or call us directly to discuss your project."
      />
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <ContactForm />
        <div className="card flex flex-col gap-6 text-sm text-black/70">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                Phone
              </p>
              <a href={siteConfig.phoneHref} className="mt-2 block text-black">
                {siteConfig.phone}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                Email
              </p>
              <a href={`mailto:${siteConfig.email}`} className="mt-2 block text-black">
                {siteConfig.email}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                Service area
              </p>
              <p className="mt-2 text-black">{siteConfig.serviceArea}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/60">
                Hours
              </p>
              <p className="mt-2 text-black">{siteConfig.hours}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={siteConfig.phoneHref}
              className="rounded-full bg-[#1D3461] force-white px-4 py-2 text-xs font-semibold text-white"
            >
              Call Now
            </a>
            <a
              href={siteConfig.smsHref}
              className="rounded-full bg-[#1D3461] force-white px-4 py-2 text-xs font-semibold text-white"
            >
              Text Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
