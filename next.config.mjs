/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  // `three`, `@react-three/fiber` and `@react-three/drei` were listed here but are not dependencies → removed.
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co; frame-src 'self';",
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
