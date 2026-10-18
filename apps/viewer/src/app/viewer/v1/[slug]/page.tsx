import type { Metadata } from 'next';
import { parseReaderEmbedConfiguration } from '@biblioteca-de-zines/reader';
import { Reader } from '@/components/reader';
import type { ReaderViewMode } from '@/application/reader-types';

const readerApiOrigin = process.env.NEXT_PUBLIC_READER_API_ORIGIN ?? 'https://www.biblioteca-de-zines.com.br';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const preview = await getPreviewData(slug);
  const title = preview?.title ?? slug;
  const image = preview?.image;

  return {
    title: `${title} - Biblioteca de Zines`,
    description: `Leia ${title} na Biblioteca de Zines.`,
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      title,
      description: `Leia ${title} na Biblioteca de Zines.`,
      ...(image ? { images: [{ url: image.url, width: image.width, height: image.height, alt: `Capa de ${title}` }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description: `Leia ${title} na Biblioteca de Zines.`,
      ...(image ? { images: [image.url] } : {}),
    },
  };
}

export default async function ViewerPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ branding?: string; mode?: string; page?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const mode: ReaderViewMode = query.mode === '2up' ? '2up' : '1up';
  const configuration = parseReaderEmbedConfiguration(query);
  const page = Number.parseInt(query.page ?? '1', 10);
  return <Reader branding={configuration.branding} mode={mode} page={Number.isFinite(page) && page > 0 ? page : 1} slug={slug} surface="standalone" theme={configuration} />;
}

async function getPreviewData(slug: string): Promise<{ title: string; image?: { url: string; width: number; height: number } } | undefined> {
  try {
    const response = await fetch(`${readerApiOrigin.replace(/\/$/, '')}/api/public-reader/v1/${encodeURIComponent(slug)}?surface=standalone`, { cache: 'no-store' });
    if (!response.ok) return undefined;
    const payload = await response.json() as {
      manifest?: { pages?: Array<{ imageUrl: string; width: number; height: number }> };
      publication?: { title?: string };
    };
    const firstPage = payload.manifest?.pages?.[0];
    return {
      title: payload.publication?.title ?? slug,
      ...(firstPage ? { image: { url: firstPage.imageUrl, width: firstPage.width, height: firstPage.height } } : {}),
    };
  } catch {
    return undefined;
  }
}
