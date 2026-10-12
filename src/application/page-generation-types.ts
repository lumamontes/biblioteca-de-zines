import type { AssetTarget } from '@/application/asset-storage';

export type PageGenerationState = {
  activePageGeneration: string | null;
  coverImage: string | null;
};

export type GeneratedPage = {
  imageUrl: string;
  pageNumber: number;
};

export type PageGeneration = {
  coverImage?: string;
  generationId: string;
  pages: GeneratedPage[];
  sourceUrl?: string;
  totalPages: number;
  target: AssetTarget;
};

export interface PageGenerationRepository {
  getState(target: AssetTarget): Promise<PageGenerationState>;
  markFailed(target: AssetTarget): Promise<void>;
  markProcessing(target: AssetTarget): Promise<void>;
  publish(generation: PageGeneration): Promise<void>;
}
