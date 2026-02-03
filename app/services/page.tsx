import SectionHeading from '@/components/SectionHeading';
import CTASection from '@/components/CTASection';
import { services } from '@/lib/siteConfig';

export const metadata = {
  title: 'Services'
};

export default function ServicesPage() {
  return (
    <div className="container py-16">
      <SectionHeading
        kicker="Services"
        title="Full-service ornamental ironwork"
        description="We handle design, fabrication, and installation with a clean, durable finish."
      />

      <div className="grid gap-10 md:grid-cols-2">
        {services.map((service) => (
          <section
            key={service.name}
            className="card flex flex-col gap-4"
          >
            <div className="md:max-w-xl">
              <h3 className="font-display text-2xl text-black">{service.name}</h3>
              <p className="mt-2 text-sm text-black/70">{service.description}</p>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-black/70">
                {service.projects.map((project) => (
                  <li key={project} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                    {project}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16">
        <CTASection />
      </div>
    </div>
  );
}
