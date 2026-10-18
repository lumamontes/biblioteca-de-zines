import { createPageManifest } from '@/domain/reader/page-manifest';
import type { PublicReaderRepository, PublicReaderResult } from './public-reader-types';

export async function getPublicReaderPublication(repository: PublicReaderRepository, slug: string): Promise<PublicReaderResult | null> {
  const publication = await repository.findPublicBySlug(slug);
  if (!publication) return null;
  const fallback = { label: 'Abrir o PDF original', url: publication.pdfUrl ?? '' };
  const summary = { id: publication.id, slug: publication.slug, title: publication.title };
  if (!publication.pdfUrl) return { fallback, publication: summary, reason: 'source-unavailable', status: 'fallback' };
  if (publication.importStatus === 'failed') {
    return { fallback, publication: summary, reason: 'page-generation-failed', status: 'fallback' };
  }
  if (!publication.activePageGeneration || publication.activePageGeneration === 'legacy') {
    return { fallback, publication: summary, reason: 'page-generation-unavailable', status: 'fallback' };
  }
  try {
    const manifest = createPageManifest({
      generationId: publication.activePageGeneration,
      pageCount: publication.totalPages ?? 0,
      pages: [...publication.pages].sort((left, right) => left.pageNumber - right.pageNumber),
    });
    return { fallback, manifest, publication: summary, status: 'ready' };
  } catch {
    return { fallback, publication: summary, reason: 'incomplete-page-generation', status: 'fallback' };
  }
}
