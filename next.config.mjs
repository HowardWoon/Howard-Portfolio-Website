/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  // `three`, `@react-three/fiber` and `@react-three/drei` were listed here but are not dependencies → removed.
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
