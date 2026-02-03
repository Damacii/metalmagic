import Image from 'next/image';

type TestimonialCardProps = {
  name: string;
  quote: string;
};

export default function TestimonialCard({ name, quote }: TestimonialCardProps) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-[#191923] p-6">
      <p className="flex-1 text-sm force-white">&quot;{quote}&quot;</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs uppercase tracking-[0.3em] force-white">
          {name}
        </span>
        <span className="ml-auto inline-flex items-center force-white">
          <Image
            src="/gallery/Google Icon.svg"
            alt="Google"
            width={16}
            height={16}
          />
        </span>
      </div>
    </div>
  );
}
