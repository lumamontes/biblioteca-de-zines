import type { ProcessingJob, ProcessingProcessor } from '@/application/processing/processing-job-types';
import { createPageGeneration } from '@/application/page-generation/page-generation-service';
import type { PageProcessorDependencies } from '@/infrastructure/page-generation/page-processor-types';

export function createPageProcessor(dependencies: PageProcessorDependencies): ProcessingProcessor {
  return async (job: ProcessingJob) => {
    if (!job.isPublished) throw new Error('Page processing requires an approved public publication');

    await createPageGeneration(
      () => dependencies.downloadSource(job.pdfUrl),
      dependencies.renderPages,
      dependencies.repository,
      dependencies.storage,
      { id: job.zineId, kind: 'zine' },
      job.pdfUrl,
    );
  };
}
