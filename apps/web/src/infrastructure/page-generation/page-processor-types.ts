import type { CoverRenderer, PageGenerationRepository, PageGenerationStorage, PageRenderer } from '@/application/page-generation/page-generation-types';
import type { SourceDocument } from '@/domain/source-document';
import type { ProcessingJob } from '@/application/processing/processing-job-types';
import type { PageDerivativeRecorder } from '@/application/page-generation/page-generation-types';

export type PageProcessorDependencies = {
  downloadSource: (sourceUrl: string) => Promise<SourceDocument>;
  recordSourceObservation?: (job: ProcessingJob, source?: SourceDocument, failureReason?: string) => Promise<number>;
  recordDerivatives?: PageDerivativeRecorder;
  createCover?: CoverRenderer;
  renderPages: PageRenderer;
  repository: PageGenerationRepository;
  storage: PageGenerationStorage;
};
