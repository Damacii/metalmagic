import { siteConfig } from '@/lib/siteConfig';

export default function CTASection() {
  return (
    <section className="rounded-3xl border border-[#1D3461]">
      <div className="rounded-3xl px-8 py-10 text-center">
        <h3 className="font-display text-2xl text-black md:text-3xl">
          Ready to start your project?
        </h3>
        <p className="mt-3 text-sm text-black">
          Call for a quote or request an estimate today.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <a
            href={siteConfig.phoneHref}
            className="rounded-full bg-[#1D3461] force-white px-6 py-3 text-sm font-semibold text-white"
          >
            Call for a quote
          </a>
          <a
            href="/contact"
            className="rounded-full bg-[#1D3461] force-white px-6 py-3 text-sm font-semibold text-white"
          >
            Request estimate
          </a>
        </div>
      </div>
    </section>
  );
}
