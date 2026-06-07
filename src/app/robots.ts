import { MetadataRoute } from 'next';
import { env } from '@/lib/env';

const BASE_URL = env.NEXT_PUBLIC_SITE_URL ?? 'https://resume-ai.example.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/settings/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
