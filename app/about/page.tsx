import SectionHeading from '@/components/SectionHeading';
import CTASection from '@/components/CTASection';

export const metadata = {
  title: 'About'
};

export default function AboutPage() {
  return (
    <div className="container py-16">
      <SectionHeading title="About Us" />

      <div className="card text-sm text-black/70">
        <p>
          We are a family-owned company with over 20 years of experience in
          ornamental ironwork—experience you can see in the quality of our
          craftsmanship and the way we treat our customers. We work with a wide
          range of materials, including steel, aluminum, and stainless steel,
          allowing us to deliver the right solution for every project.
        </p>
        <p className="mt-4">
          From the moment we take on a job, we stay involved through every step of
          the process. We communicate clearly, work with precision, and make sure
          each client is fully satisfied before we consider the project complete.
        </p>
        <p className="mt-4">
          We’ve completed projects for property management companies such as PK
          Community Management (including condominium railings in the Oaks North
          area), as well as Family Health Centers across multiple locations
          including San Marcos, El Cajon, Spring Valley, and Logan Heights—
          providing services such as fencing, pipe railings, and gates. Our work
          also includes projects like the Islamic Center on Balboa Ave (full fence
          and gate installation) and the Palomar Observatory (main swing gate),
          among many others.
        </p>
        <p className="mt-4">
          We proudly partner with contractors, architects, landscapers, management
          companies, and real estate professionals to deliver strong, clean, and
          reliable metalwork built to last.
        </p>
      </div>

      <div className="mt-16">
        <CTASection />
      </div>
    </div>
  );
}
