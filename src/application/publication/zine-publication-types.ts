import type { ProcessingRequester } from '@/application/processing/processing-request-types';

export type PublicationAuthor = {
  name: string;
  socialLinks: string[];
};

export type PublicationUpload = {
  title: string;
  description: string | null;
  collectionTitle: string | null;
  coverImage: string | null;
  pdfUrl: string | null;
  tags: unknown;
  publishedYear: number | null;
  authors: PublicationAuthor[];
};

export type PublicationRecord = {
  id: number;
  tags: unknown;
  sourceUploadId: number | null;
  coverImage: string | null;
  activePageGeneration?: string;
  pdfUrl: string | null;
  importStatus: string | null;
  processedPdfUrl: string | null;
  totalPages?: number | null;
};

export type PublicationUpdate = {
  title?: string;
  description?: string | null;
  collectionTitle?: string | null;
  coverImage?: string | null;
  pdfUrl?: string | null;
  tags?: unknown;
  publishedYear?: number | null;
  importStatus?: 'pending' | 'processing' | 'completed' | 'failed';
};

export type PublicationInsert = {
  title: string;
  description: string | null;
  collectionTitle: string | null;
  coverImage: string | null;
  pdfUrl: string | null;
  tags: unknown;
  publishedYear: number | null;
  importStatus: 'pending' | 'completed';
  sourceUploadId: number;
  slug: string;
};

export type UploadUpdate = PublicationUpload;

export type UpdateUploadInput = {
  slug?: string;
  title: string;
  description?: string;
  collectionTitle?: string;
  authors: PublicationAuthor[];
  pdfUrl?: string;
  coverImage?: string;
  publishedYear?: number;
  categories?: string[];
};

export interface PublicationRepository {
  findUpload(uploadId: number): Promise<PublicationUpload | null>;
  findBySlug(slug: string): Promise<PublicationRecord | null>;
  findById(zineId: number): Promise<PublicationRecord | null>;
  updateUpload(uploadId: number, input: UploadUpdate): Promise<void>;
  markUploadPublished(uploadId: number): Promise<void>;
  insert(input: PublicationInsert): Promise<number>;
  update(zineId: number, input: PublicationUpdate): Promise<void>;
  setPublished(zineId: number, isPublished: boolean): Promise<void>;
}

export interface PublicationAuthors {
  sync(zineId: number, authors: PublicationAuthor[]): Promise<void>;
}

export interface CoverAvailability {
  isAvailable(zineId: number, coverImage: string): Promise<boolean>;
}

export type { ProcessingRequester } from '@/application/processing/processing-request-types';

export interface ZinePublicationDependencies {
  publications: PublicationRepository;
  authors: PublicationAuthors;
  covers: CoverAvailability;
  processing: ProcessingRequester;
}
