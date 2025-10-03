import Image from 'next/image';
import Link from 'next/link';
import * as cheerio from 'cheerio';

interface MediaMentionProps {
  url: string;
  type: 'instagram' | 'youtube' | 'article';
}

interface MediaMetadata {
  title: string;
  description: string;
  image: string;
  domain: string;
  favicon: string;
  siteName: string;
}

const getTypeIcon = (type: string, domain: string) => {
  if (domain.includes('instagram')) return '📷';
  if (domain.includes('youtube')) return '📹';
  if (domain.includes('dropsdejogos')) return '🎮';
  if (domain.includes('hqpop')) return '📚';
  return '🔗';
};

/**
 * Extract metadata from URL server-side
 */
async function extractMetadata(url: string): Promise<MediaMetadata> {
  const domain = new URL(url).hostname.replace('www.', '');
  const favicon = `${new URL(url).protocol}//${new URL(url).hostname}/favicon.ico`;
  
  // Fallback metadata
  const fallbackMetadata: MediaMetadata = {
    title: getKnownSiteTitle(domain, url),
    description: getKnownSiteDescription(domain),
    image: '',
    domain,
    favicon,
    siteName: getKnownSiteName(domain)
  };

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(3000),
      redirect: 'follow',
    });

    if (!response.ok) {
      return fallbackMetadata;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract OpenGraph metadata
    const ogTitle = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('meta[name="og:title"]').attr('content') ||
      $('title').text() ||
      fallbackMetadata.title;

    const ogDescription = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      fallbackMetadata.description;

    let ogImage = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="og:image:secure_url"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';

    // Normalize relative URLs to absolute
    if (ogImage && !/^https?:\/\//i.test(ogImage)) {
      try {
        ogImage = new URL(ogImage, url).href;
      } catch {
        ogImage = '';
      }
    }

    const ogSiteName = 
      $('meta[property="og:site_name"]').attr('content') ||
      fallbackMetadata.siteName;

    return {
      title: ogTitle.trim().replace(/\s+/g, ' ') || fallbackMetadata.title,
      description: ogDescription.trim().replace(/\s+/g, ' ') || fallbackMetadata.description,
      image: ogImage,
      domain,
      favicon,
      siteName: ogSiteName.trim() || fallbackMetadata.siteName
    };

  } catch (error) {
    console.error('Error extracting metadata:', error);
    return fallbackMetadata;
  }
}

function getKnownSiteTitle(domain: string, url: string): string {
  const knownTitles: Record<string, string> = {
    'instagram.com': 'Post sobre Biblioteca de Zines',
    'youtube.com': url.includes('/live/') ? 'Live sobre Biblioteca de Zines' : 'Vídeo sobre Biblioteca de Zines',
    'dropsdejogos.uai.com.br': 'Biblioteca de Zines reúne obras indie do BR para ler de graça',
    'hqpop.com.br': 'Descubra a Biblioteca Brasileira de Zines: A Nova Casa da Arte Independente',
  };
  
  return knownTitles[domain] || `Menção na mídia - ${domain}`;
}

function getKnownSiteDescription(domain: string): string {
  const knownDescriptions: Record<string, string> = {
    'instagram.com': 'O Norte em Quadrinhos entrevistou a artista multimídia, natural do Amapá, idealizadora da Biblioteca Brasileira de Zines, projeto que criou uma forma de catalogar online a produção de fanzines brasileira.',
    'youtube.com': 'Conteúdo em vídeo sobre a Biblioteca de Zines',
    'dropsdejogos.uai.com.br': 'Reportagem sobre zines brasileiros independentes',
    'hqpop.com.br': 'Artigo sobre a nova casa da arte independente brasileira',
  };
  
  return knownDescriptions[domain] || `Conteúdo sobre a Biblioteca de Zines em ${domain}`;
}

function getKnownSiteName(domain: string): string {
  const knownSiteNames: Record<string, string> = {
    'instagram.com': 'Instagram',
    'youtube.com': 'YouTube',
    'dropsdejogos.uai.com.br': 'Drops de Jogos',
    'hqpop.com.br': 'HQ Pop',
  };
  
  return knownSiteNames[domain] || domain;
}

const PLACEHOLDER_COVER_IMAGE = "/instagramPlaceholder.jpg";

export async function MediaMention({ url, type }: MediaMentionProps) {
  const metadata = await extractMetadata(url);
  const typeIcon = getTypeIcon(type, metadata.domain);

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-80 group"
    >
      <div className="bg-white border-2 border-neutral-100 rounded-lg overflow-hidden">
        {/* Image */}
        <div className="relative h-32 overflow-hidden">
          {metadata.image || metadata.domain.includes('instagram.com') ? (
            <Image
              src={metadata.domain.includes('instagram.com') ? PLACEHOLDER_COVER_IMAGE : metadata.image}
              alt={metadata.title}
              fill
              className="object-cover"
              unoptimized // For external images
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl">{typeIcon}</div>
            </div>
          )}
          {/* Domain badge */}
          <div className="absolute top-2 right-2">
            <span className="bg-zine-darkblue text-white text-xs font-bold px-2 py-1 rounded">
              {metadata.siteName}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-sm leading-tight text-black line-clamp-2 group-hover:text-black/80">
            {metadata.title}
          </h3>
          {metadata.description && (
            <p className="mt-1 text-xs text-black/70 line-clamp-2">
              {metadata.description}
            </p>
          )}
          <div className="mt-2 flex items-center text-xs text-black/60">
            <span>{typeIcon}</span>
            <span className="ml-1 truncate">{metadata.siteName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
