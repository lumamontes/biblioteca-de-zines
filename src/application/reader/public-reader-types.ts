import type { ReaderFallback } from './reader-contracts';
import type { ReaderPageManifest } from '@/domain/reader/page-manifest-types';
import type { ReaderPageImage } from '@/domain/reader/page-manifest-types';

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

export interface PublicReaderRepository {
  findPublicBySlug(slug: string): Promise<PublicReaderPublicationRecord | null>;
}

export type PublicReaderFallbackReason =
  | 'incomplete-page-generation'
  | 'page-generation-failed'
  | 'page-generation-unavailable'
  | 'reader-failure'
  | 'source-unavailable';

export type PublicReaderFallback = {
  fallback: ReaderFallback;
  publication?: Pick<PublicReaderPublicationRecord, 'id' | 'slug' | 'title'>;
  reason: PublicReaderFallbackReason;
  status: 'fallback';
};

export type PublicReaderReady = {
  fallback: ReaderFallback;
  manifest: ReaderPageManifest;
  publication: Pick<PublicReaderPublicationRecord, 'id' | 'slug' | 'title'>;
  status: 'ready';
};

export type PublicReaderResult = PublicReaderFallback | PublicReaderReady;
