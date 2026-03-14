import { Zine } from "@/@types/zine"
import { Author } from "@/services/author-service"
import { siteConfig } from "@/app/config/site"

interface WebsiteStructuredDataProps {
  title?: string
  description?: string
  url?: string
}

export function WebsiteStructuredData({ 
  title = siteConfig.name, 
  description = siteConfig.description, 
  url = siteConfig.url 
}: WebsiteStructuredDataProps) {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": title,
    "description": description,
    "url": url,
    "inLanguage": "pt-BR",
    "isPartOf": {
      "@type": "WebSite",
      "url": siteConfig.url
    },
    "about": {
      "@type": "Thing",
      "name": "Zines Brasileiros e Latino-Americanos",
      "description": "Arquivo digital de publicações independentes"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Artistas independentes, colecionadores de zines, cultura underground",
      "geographicArea": {
        "@type": "Place",
        "name": "Brasil e América Latina"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteConfig.url}/zines?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://www.instagram.com/bibliotecadezines/",
      "https://bibliotecadezines.substack.com/"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData, null, 2) }}
    />
  )
}

interface ZineStructuredDataProps {
  zine: Zine
}

export function ZineStructuredData({ zine }: ZineStructuredDataProps) {
  const authors = zine.library_zines_authors?.map(({ authors: author }) => ({
    "@type": "Person",
    "name": author.name,
    "url": author.url || `${siteConfig.url}/authors/${author.slug}`,
    "@id": `${siteConfig.url}/authors/${author.slug}`
  })) || []

  const zineData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${siteConfig.url}/zines/${zine.slug}`,
    "name": zine.title,
    "description": zine.description,
    "url": `${siteConfig.url}/zines/${zine.slug}`,
    "inLanguage": "pt-BR",
    "dateCreated": zine.created_at,
    "dateModified": zine.updated_at || zine.created_at,
    "datePublished": zine.year ? `${zine.year}-01-01` : zine.created_at,
    "creator": authors,
    "author": authors,
    "publisher": {
      "@type": "Organization",
      "name": "Biblioteca de Zines",
      "url": siteConfig.url
    },
    "image": zine.cover_image ? {
      "@type": "ImageObject",
      "url": zine.cover_image,
      "description": `Capa do zine ${zine.title}`
    } : undefined,
    "keywords": Array.isArray(zine.tags) ? zine.tags.join(", ") : undefined,
    "genre": "Zine, Arte Independente, Publicação Independente",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Biblioteca de Zines",
      "url": siteConfig.url
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/zines/${zine.slug}`
    },
    "workExample": zine.pdf_url ? {
      "@type": "DigitalDocument",
      "name": `${zine.title} - PDF`,
      "url": zine.pdf_url,
      "encodingFormat": "application/pdf"
    } : undefined
  }

  // Remove undefined values
  const cleanedData = JSON.parse(JSON.stringify(zineData))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedData, null, 2) }}
    />
  )
}

interface AuthorStructuredDataProps {
  author: Author
  zines?: Zine[]
}

export function AuthorStructuredData({ author, zines = [] }: AuthorStructuredDataProps) {
  const works = zines.map(zine => ({
    "@type": "CreativeWork",
    "name": zine.title,
    "url": `${siteConfig.url}/zines/${zine.slug}`,
    "description": zine.description
  }))

  const authorData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.url}/authors/${author.slug}`,
    "name": author.name,
    "description": author.bio,
    "url": `${siteConfig.url}/authors/${author.slug}`,
    "sameAs": author.url ? [author.url] : undefined,
    "worksFor": {
      "@type": "Organization", 
      "name": "Arte Independente"
    },
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Artista Independente"
    },
    "workLocation": {
      "@type": "Place",
      "name": "Brasil"
    },
    "mainEntityOfPage": {
      "@type": "WebPage", 
      "@id": `${siteConfig.url}/authors/${author.slug}`
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "Biblioteca de Zines",
      "url": siteConfig.url
    },
    "creativeWork": works.length > 0 ? works : undefined
  }

  // Remove undefined values
  const cleanedData = JSON.parse(JSON.stringify(authorData))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedData, null, 2) }}
    />
  )
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData, null, 2) }}
    />
  )
}

export function OrganizationStructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    "name": "Biblioteca de Zines",
    "description": "Arquivo digital de zines brasileiros e latino-americanos",
    "url": siteConfig.url,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteConfig.url}/manifest/android-chrome-512x512.png`,
      "width": 512,
      "height": 512
    },
    "image": `${siteConfig.url}/manifest/og.jpg`,
    "sameAs": [
      "https://www.instagram.com/bibliotecadezines/",
      "https://bibliotecadezines.substack.com/",
      "https://github.com/lumamontes/biblioteca-de-zines"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Support",
      "url": "https://forms.gle/ydedperb4c2WbiRW9"
    },
    "foundingDate": "2023",
    "areaServed": {
      "@type": "Place",
      "name": "Brasil e América Latina"
    },
    "knowsAbout": [
      "Zines",
      "Arte Independente",
      "Publicações Independentes",
      "Cultura Underground",
      "Arte Brasileira",
      "Arte Latino-Americana"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData, null, 2) }}
    />
  )
}