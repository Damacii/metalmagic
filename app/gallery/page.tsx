import SectionHeading from '@/components/SectionHeading';
import GalleryFilterGrid from '@/components/GalleryFilterGrid';

export const metadata = {
  title: 'Gallery'
};

export default function GalleryPage() {
  return (
    <div className="container py-16">
      <SectionHeading
        kicker="Gallery"
        title="Ironwork details and installs"
        description="Explore examples across fences, gates, railings, security, and custom fabrication."
      />
      <GalleryFilterGrid items={[]} />
    </div>
  );
}
