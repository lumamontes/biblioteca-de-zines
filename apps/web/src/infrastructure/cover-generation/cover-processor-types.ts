import type { CoverGenerationDependencies } from '@/application/cover-generation/cover-generation-types';
import type { SourceDocument } from '@/domain/source-document';
import type { CoverDerivativeRecorder } from '@/application/cover-generation/cover-generation-types';
import type { ProcessingJob } from '@/application/processing/processing-job-types';

export type CoverProcessorDependencies = CoverGenerationDependencies & {
  downloadSource: (sourceUrl: string) => Promise<SourceDocument>;
  recordSourceObservation?: (job: ProcessingJob, source?: SourceDocument, failureReason?: string) => Promise<number>;
  recordDerivative?: CoverDerivativeRecorder;
};

export type CoverProcessorOptions = {
  expectedCoverImage?: string | null;
  replaceExternalCover?: boolean;
};
