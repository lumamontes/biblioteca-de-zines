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
  generationId: string;
  pages: StoredPage[];
  sourceUrl: string;
  target: AssetTarget;
};

export type PageRenderer = (
  source: SourceDocument,
  onPage: (page: RenderedPage) => Promise<void>,
) => Promise<number>;

export type PageUpload = RenderedPage & {
  generationId: string;
  target: AssetTarget;
};

export interface PageGenerationStorage {
  deleteGeneration(target: AssetTarget, generationId: string): Promise<void>;
  uploadPage(page: PageUpload): Promise<string>;
}

export type PageActivationResult = {
  activated: boolean;
  previousGenerationId?: string;
};

export interface PageGenerationRepository {
  activate(generation: PageGeneration): Promise<PageActivationResult>;
  markFailed(target: AssetTarget): Promise<void>;
  markProcessing(target: AssetTarget): Promise<void>;
}
