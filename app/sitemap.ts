import type { MetadataRoute } from 'next';

const SITE = 'https://howard-woon-portfolio.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...['agentic', 'flood', 'energy'].map((t) => ({
      url: `${SITE}/simulators/${t}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
