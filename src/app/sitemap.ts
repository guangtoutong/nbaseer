import { MetadataRoute } from 'next'

const baseUrl = 'https://nbaseer.pages.dev'

const routes: {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}[] = [
  { path: '', changeFrequency: 'hourly', priority: 1 },
  { path: '/scores', changeFrequency: 'hourly', priority: 0.9 },
  { path: '/history', changeFrequency: 'daily', priority: 0.8 },
  { path: '/whitepaper', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/api', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/support', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
