import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://resume-ai.example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/templates',
    '/pricing',
    '/ats-score',
    '/cover-letter',
    '/builder',
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));
}
