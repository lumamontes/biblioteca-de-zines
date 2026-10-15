import type { ReaderFallback } from './reader-contracts';
import type { ReaderPageImage, ReaderPageManifest } from '@/domain/reader/page-manifest-types';

export type PublicReaderPublicationRecord = {
  activePageGeneration: string | null;
  id: number;
  importStatus: string | null;
  pages: ReaderPageImage[];
  pdfUrl: string | null;
  slug: string;
  title: string;
  totalPages: number | null;
};
export interface PublicReaderRepository { findPublicBySlug(slug: string): Promise<PublicReaderPublicationRecord | null>; }
export type PublicReaderFallbackReason = 'incomplete-page-generation' | 'page-generation-failed' | 'page-generation-unavailable' | 'source-unavailable';
export type PublicReaderPublication = Pick<PublicReaderPublicationRecord, 'id' | 'slug' | 'title'>;
export type PublicReaderFallback = { fallback: ReaderFallback; publication: PublicReaderPublication; reason: PublicReaderFallbackReason; status: 'fallback' };
export type PublicReaderReady = { fallback: ReaderFallback; manifest: ReaderPageManifest; publication: PublicReaderPublication; status: 'ready' };
export type PublicReaderResult = PublicReaderFallback | PublicReaderReady;
