type SectionHeadingProps = {
  kicker?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
};

export default function SectionHeading({
  kicker,
  title,
  description,
  align = 'left',
  tone = 'dark'
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left';
  const isLight = tone === 'light';

  return (
    <div className={`mb-10 flex flex-col gap-3 ${alignment}`}>
      {kicker ? (
        <span
          className={`badge w-fit text-xs font-semibold ${
            isLight ? '!text-white/80' : 'text-black/70'
          } ${kicker === 'Contact' ? 'badge-contact' : ''}`}
        >
          {kicker}
        </span>
      ) : null}
      <h2
        className={`font-display text-3xl font-semibold md:text-4xl ${
          isLight ? '!text-white' : 'text-black'
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p className={`max-w-2xl text-base md:text-lg ${isLight ? '!text-white' : 'text-black/70'}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
