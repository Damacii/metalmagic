/** @type {import('next').NextConfig} */
const supabaseHost =
  process.env.NEXT_PUBLIC_SUPABASE_HOST || 'qavufnmvclihoacgnsql.supabase.co';

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
        pathname: '/storage/v1/object/public/**'
      }
    ]
  }
};

module.exports = nextConfig;
