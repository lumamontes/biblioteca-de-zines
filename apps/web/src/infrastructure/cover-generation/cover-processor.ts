import type {
  ProcessingJob,
  ProcessingProcessor,
} from '@/application/processing/processing-job-types';
import { createCoverGeneration } from '@/application/cover-generation/cover-generation-service';
import type {
  CoverProcessorDependencies,
  CoverProcessorOptions,
} from './cover-processor-types';

export function createCoverProcessor(
  dependencies: CoverProcessorDependencies,
  options: CoverProcessorOptions = {},
): ProcessingProcessor {
  return async (job: ProcessingJob) => {
    await createCoverGeneration(
      () => dependencies.downloadSource(job.pdfUrl),
      { id: job.zineId, kind: 'zine' },
      dependencies.repository,
      dependencies.storage,
      job.pdfUrl,
      dependencies.renderFirstPage,
      dependencies.optimizeCover,
      options,
    );
  };
}
