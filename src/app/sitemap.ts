import { MetadataRoute } from 'next'
import { getAllZines } from '@/services/zine-service'
import { getAllAuthors } from '@/services/author-service'
import { siteConfig } from './config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/zines`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/zines-club`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ]

  try {
    // Fetch all published zines
    const zines = await getAllZines()
    const zinePages: MetadataRoute.Sitemap = zines
      .filter(zine => zine.is_published && zine.slug)
      .map((zine) => ({
        url: `${baseUrl}/zines/${zine.slug}`,
        lastModified: zine.updated_at ? new Date(zine.updated_at) : new Date(zine.created_at || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))

    // Fetch all authors
    const authors = await getAllAuthors()
    const authorPages: MetadataRoute.Sitemap = authors
      .filter(author => author.slug)
      .map((author) => ({
        url: `${baseUrl}/authors/${author.slug}`,
        lastModified: author.updated_at ? new Date(author.updated_at) : new Date(author.created_at || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))

    return [...staticPages, ...zinePages, ...authorPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static pages if dynamic content fails
    return staticPages
  }
}