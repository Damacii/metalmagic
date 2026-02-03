import Image from 'next/image';

type ServiceCardProps = {
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
};

export default function ServiceCard({
  title,
  description,
  imageSrc,
  imageAlt
}: ServiceCardProps) {
  return (
    <div className="card flex h-full flex-col gap-3">
      {imageSrc ? (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <Image
            src={imageSrc}
            alt={imageAlt ?? `${title} service`}
            width={480}
            height={320}
            className="h-40 w-full object-cover object-center"
          />
        </div>
      ) : null}
      <div className="h-2 w-10 rounded-full bg-brand-orange" />
      <h3 className="font-display text-xl text-black">{title}</h3>
      <p className="text-sm text-black/70">{description}</p>
    </div>
  );
}
