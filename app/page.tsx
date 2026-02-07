import Script from 'next/script';
import Image from 'next/image';
import Hero from '@/components/Hero';
import HeroImageStrip from '@/components/HeroImageStrip';
import SectionHeading from '@/components/SectionHeading';
import TestimonialCard from '@/components/TestimonialCard';
import ContactForm from '@/components/ContactForm';
import CTASection from '@/components/CTASection';
import ServiceImage from '@/components/ServiceImage';
import { services, siteConfig, testimonials, whyPoints } from '@/lib/siteConfig';

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    description: siteConfig.description,
    telephone: siteConfig.phone,
    areaServed: siteConfig.serviceArea,
    email: siteConfig.email,
    openingHours: siteConfig.hours
  };

  return (
    <>
      <Script
        id="local-business-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <HeroImageStrip />

      <section className="container py-16">
        <SectionHeading
          kicker="Services"
          title="Ironwork that elevates your property"
          description="From custom fabrication to on-site repairs, we build strong, clean, and consistent metalwork."
        />
        <div className="grid gap-8 min-[740px]:grid-cols-2">
          {services.map((service) => (
            <section
              key={service.name}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10"
            >
              <div className="flex flex-col gap-6">
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  {service.imageFolder ? (
                    <ServiceImage
                      folder={service.imageFolder}
                      fallbackSrc={service.imageSrc}
                      alt={`${service.name} example`}
                    />
                  ) : (
                    <Image
                      src={service.imageSrc}
                      alt={`${service.name} example`}
                      width={900}
                      height={700}
                      className="h-64 w-full object-cover md:h-80"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-display text-2xl text-white md:text-3xl">
                    {service.name}
                  </h3>
                  <p className="mt-3 text-sm text-white/70 md:text-base">
                    {service.description}
                  </p>
                  <ul className="mt-4 flex flex-col gap-2 text-sm text-white/70">
                    {service.projects.map((project) => (
                      <li key={project} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1D3461]" />
                        {project}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/gallery"
                    className="mt-6 inline-flex rounded-full bg-[#1D3461] force-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-black"
                  >
                    View Gallery
                  </a>
                </div>
              </div>
            </section>
          ))}
        </div>
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={siteConfig.servicesCtaImage}
                alt="Recent ironwork project"
                width={900}
                height={700}
                className="h-64 w-full object-cover md:h-80"
              />
            </div>
            <div>
              <h3 className="font-display text-2xl text-white md:text-3xl">
                Built for strength and style
              </h3>
              <p className="mt-3 text-sm text-white/70 md:text-base">
                Tell us what you need and we will tailor the design, fabrication, and
                install to your space.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href={siteConfig.phoneHref}
                  className="rounded-full bg-[#1D3461] force-white px-6 py-3 text-sm font-semibold text-white"
                >
                  {siteConfig.ctaPrimary}
                </a>
                <a
                  href="/contact"
                  className="rounded-full bg-[#1D3461] force-white px-6 py-3 text-sm font-semibold text-white"
                >
                  {siteConfig.ctaSecondary}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/5 py-16">
        <div className="container">
          <SectionHeading
            kicker="Why Metal Magic"
            title="Craftsmanship you can count on"
            description="Every project is measured, welded, and finished with precision."
          />
          <ul className="grid gap-4 md:grid-cols-2">
            {whyPoints.map((point) => (
              <li
                key={point}
                className="card flex items-center gap-3 text-sm text-white/80"
              >
                <span className="h-2 w-2 rounded-full bg-[#1D3461]" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container py-16">
        <SectionHeading
          kicker="Testimonials"
          title="Clients trust our process"
          description="Straightforward communication, dependable installs, and clean results."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard key={item.name} name={item.name} quote={item.quote} />
          ))}
        </div>
        <div className="mt-8">
          <a
            href={siteConfig.feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full bg-[#1D3461] force-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-black"
          >
            Leave Feedback
          </a>
        </div>
      </section>

      <section className="container py-16">
        <CTASection />
      </section>

      <section id="contact" className="border-t border-white/10 bg-white/5 py-16">
        <div className="container grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              kicker="Contact"
              title="Get a fast, free estimate"
              description="Tell us what you need. We will schedule a walkthrough and provide a clear quote."
            />
            <div className="flex flex-col gap-4 text-sm text-white/70">
              <div>
                <p className="text-white">Call or email</p>
                <a href={siteConfig.phoneHref} className="text-white/80">
                  {siteConfig.phone}
                </a>
                <p>{siteConfig.email}</p>
              </div>
              <div>
                <p className="text-white">Service area</p>
                <p>{siteConfig.serviceArea}</p>
              </div>
              <div>
                <p className="text-white">Hours</p>
                <p>{siteConfig.hours}</p>
              </div>
            </div>
          </div>
          <ContactForm showTitle={false} />
        </div>
      </section>

    </>
  );
}
