import type { PageGenerationRepository, PageGenerationStorage, PageRenderer } from '@/application/page-generation/page-generation-types';
import type { SourceDocument } from '@/domain/source-document';

export type PageProcessorDependencies = {
  downloadSource: (sourceUrl: string) => Promise<SourceDocument>;
  renderPages: PageRenderer;
  repository: PageGenerationRepository;
  storage: PageGenerationStorage;
};
