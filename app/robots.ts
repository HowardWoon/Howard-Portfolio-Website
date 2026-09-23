import type { MetadataRoute } from 'next';

const SITE = 'https://howard-woon-portfolio.vercel.app';

// Keeps /admin and the API out of search results (there was no robots.txt at all)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
