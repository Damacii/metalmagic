import { siteConfig } from '@/lib/siteConfig';

export default function StickyMobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/95 px-4 py-3 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <a
          href={siteConfig.phoneHref}
          className="flex-1 rounded-full bg-[#1D3461] force-white px-4 py-3 text-center text-xs font-semibold text-white"
        >
          Call
        </a>
        <a
          href="/contact"
          className="flex-1 rounded-full bg-[#1D3461] force-white px-4 py-3 text-center text-xs font-semibold text-white"
        >
          Free Estimate
        </a>
      </div>
    </div>
  );
}
