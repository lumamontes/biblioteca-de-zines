import type {
  PublicReaderZine,
  ReaderPageImage,
} from '@biblioteca-de-zines/reader';

export type PublicReaderZineRecord = {
  activePageGeneration: string | null;
  id: number;
  importStatus: string | null;
  pages: ReaderPageImage[];
  pdfUrl: string | null;
  slug: string;
  title: string;
  totalPages: number | null;
};
export interface PublicReaderRepository { findPublicBySlug(slug: string): Promise<PublicReaderZineRecord | null>; }
export type { PublicReaderZine };
