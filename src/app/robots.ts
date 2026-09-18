import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The JSON endpoints live under /api/<name>; /api itself is the human-readable
      // documentation page and should stay indexable.
      disallow: ['/api/games', '/api/today', '/api/stats', '/api/teams', '/api/predictions', '/_next/'],
    },
    sitemap: 'https://nbaseer.pages.dev/sitemap.xml',
  }
}
