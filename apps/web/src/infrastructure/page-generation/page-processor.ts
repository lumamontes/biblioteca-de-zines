import type { ProcessingJob, ProcessingProcessor } from '@/application/processing/processing-job-types';
import type { SourceDocument } from '@/domain/source-document';
import { createPageGeneration } from '@/application/page-generation/page-generation-service';
import type { PageProcessorDependencies } from './page-processor-types';

export function createPageProcessor(dependencies: PageProcessorDependencies): ProcessingProcessor {
  return async (job: ProcessingJob) => {
    if (!job.isPublished) throw new Error('Page processing requires an approved public publication');
    const loadSource = async (): Promise<SourceDocument> => {
      try {
        const source = await dependencies.downloadSource(job.pdfUrl);
        await recordObservation(job, source);
        return source;
      } catch (error) {
        await recordObservation(job, undefined, error instanceof Error ? error.message : 'Source download failed');
        throw error;
      }
    };
    await createPageGeneration(
      loadSource, dependencies.renderPages, dependencies.repository,
      dependencies.storage, { id: job.zineId, kind: 'zine' }, job.pdfUrl, { createCover: dependencies.createCover },
    );
  };

  async function recordObservation(job: ProcessingJob, source?: SourceDocument, failureReason?: string) {
    if (!dependencies.recordSourceObservation) return;
    try {
      await dependencies.recordSourceObservation(job, source, failureReason);
    } catch (error) {
      console.error(`Failed to record source observation for ${job.zineId}:`, error);
    }
  }
}
