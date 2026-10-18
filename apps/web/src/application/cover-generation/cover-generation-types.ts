import type { AssetTarget } from '@/application/asset-storage';
import type { SourceDocument } from '@/domain/source-document';

export type CoverGenerationState = {
  coverImage: string | null;
};

export type CoverGenerationRecord = {
  cover_image: string | null;
  import_status: string | null;
  processed_pdf_url: string | null;
};

export type CoverGeneration = {
  coverImage: string;
  expectedCoverImage?: string | null;
  replaceExternalCover?: boolean;
  sourceUrl: string;
  target: AssetTarget;
};

export interface CoverGenerationRepository {
  getState(target: AssetTarget): Promise<CoverGenerationState>;
  markFailed(target: AssetTarget): Promise<void>;
  markProcessing(target: AssetTarget): Promise<void>;
  publish(generation: CoverGeneration): Promise<boolean>;
}

export type FirstPageRenderer = (source: SourceDocument) => Promise<Buffer>;
export type CoverOptimizer = (image: Buffer) => Promise<Buffer>;

export type CoverGenerationDependencies = {
  repository: CoverGenerationRepository;
  storage: CoverAssetStore;
  renderFirstPage: FirstPageRenderer;
  optimizeCover: CoverOptimizer;
};

export type CoverDerivativeRecorder = (input: {
  sourceObservationId: number;
  assetIdentity: string;
  storageReference: string;
  generationId: string;
}) => Promise<void>;

export type CoverAsset = {
  data: Buffer;
  generationId: string;
  target: AssetTarget;
};

export interface CoverAssetStore {
  storeCover(asset: CoverAsset): Promise<string>;
  discardGeneration(target: AssetTarget, generationId: string): Promise<void>;
  removeCover(target: AssetTarget, coverUrl: string): Promise<void>;
  isAvailable(target: AssetTarget, coverUrl: string): Promise<boolean>;
}
