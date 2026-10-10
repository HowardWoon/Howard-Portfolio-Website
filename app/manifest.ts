import type { MetadataRoute } from 'next';

/** R14 B-08: "Add to Home Screen" gets the site's own icon and name instead of a screenshot / letter tile. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Howard Woon // Full Stack Developer',
    short_name: 'Howard Woon',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#FFC700',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
      // R17 P2-10: Android install / home screen sizes (app/pwa-icon/[size]/route.tsx)
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
