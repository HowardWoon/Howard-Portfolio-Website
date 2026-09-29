import type { MetadataRoute } from 'next';

/** R14 B-08: "Add to Home Screen" gets the site's own icon and name instead of a screenshot / letter tile. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Howard Woon // Systems & AI Architect',
    short_name: 'Howard Woon',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#FFC700',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
