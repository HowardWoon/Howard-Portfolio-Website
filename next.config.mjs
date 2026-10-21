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
          // R82 (owner: "proceed all"): ENFORCED. Measured first with the report-only policy: 0 violations on every
          // page, a phone, the 3D street with sound, the lightbox, the palette and the Google map embed. Violations are
          // still reported to /api/csp-report.
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co; frame-src 'self' https://www.google.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; report-uri /api/csp-report;",
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
