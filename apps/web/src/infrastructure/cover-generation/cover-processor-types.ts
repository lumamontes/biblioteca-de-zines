import type { CoverGenerationDependencies } from '@/application/cover-generation/cover-generation-types';
import type { SourceDocument } from '@/domain/source-document';

export type CoverProcessorDependencies = CoverGenerationDependencies & {
  downloadSource: (sourceUrl: string) => Promise<SourceDocument>;
};

export type CoverProcessorOptions = {
  expectedCoverImage?: string | null;
  replaceExternalCover?: boolean;
};
