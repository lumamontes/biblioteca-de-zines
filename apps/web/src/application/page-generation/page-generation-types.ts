import type { AssetTarget } from '@/application/asset-storage';
import type { SourceDocument } from '@/domain/source-document';

export type RenderedPage = {
  contentType: string;
  data: Buffer;
  height: number;
  pageNumber: number;
  width: number;
};

export type StoredPage = Omit<RenderedPage, 'data'> & {
  generationId: string;
  imageUrl: string;
};

export type PageGeneration = {
  coverImage?: string;
  generationId: string;
  pages: StoredPage[];
  sourceUrl: string;
  target: AssetTarget;
};

export type PageRenderer = (
  source: SourceDocument,
  onPage: (page: RenderedPage) => Promise<void>,
) => Promise<number>;

export type CoverRenderer = (page: RenderedPage) => Promise<{ contentType: string; data: Buffer }>;

export type PageUpload = RenderedPage & { generationId: string; target: AssetTarget };
export type CoverUpload = { contentType: string; data: Buffer; generationId: string; target: AssetTarget };

export interface PageGenerationStorage {
  deleteCover(target: AssetTarget, generationId: string): Promise<void>;
  deleteGeneration(target: AssetTarget, generationId: string): Promise<void>;
  isPageAvailable(target: AssetTarget, page: StoredPage): Promise<boolean>;
  uploadCover(cover: CoverUpload): Promise<string>;
  uploadPage(page: PageUpload): Promise<string>;
}

export type PageActivationResult = {
  activated: boolean;
  coverImageUsed?: boolean;
  previousGenerationId?: string;
};

export interface PageGenerationRepository {
  activate(generation: PageGeneration): Promise<PageActivationResult>;
  isProcessable(target: AssetTarget, sourceUrl: string): Promise<boolean>;
  markFailed(target: AssetTarget): Promise<void>;
  markProcessing(target: AssetTarget): Promise<void>;
}
