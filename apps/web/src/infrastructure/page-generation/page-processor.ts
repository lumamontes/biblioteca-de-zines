import type { ProcessingJob, ProcessingProcessor } from '@/application/processing/processing-job-types';
import type { SourceDocument } from '@/domain/source-document';
import { createPageGeneration } from '@/application/page-generation/page-generation-service';
import type { PageProcessorDependencies } from './page-processor-types';

export function createPageProcessor(dependencies: PageProcessorDependencies): ProcessingProcessor {
  return async (job: ProcessingJob) => {
    if (!job.isPublished) throw new Error('Page processing requires an approved public publication');
    let sourceObservationId: number | undefined;
    const loadSource = async (): Promise<SourceDocument> => {
      try {
        const source = await dependencies.downloadSource(job.pdfUrl);
        sourceObservationId = await recordObservation(job, source);
        return source;
      } catch (error) {
        await recordObservation(job, undefined, error instanceof Error ? error.message : 'Source download failed');
        throw error;
      }
    };
    await createPageGeneration(
      loadSource, dependencies.renderPages, dependencies.repository,
      dependencies.storage, { id: job.zineId, kind: 'zine' }, job.pdfUrl, { createCover: dependencies.createCover, sourceObservationId: () => sourceObservationId, recordDerivatives: dependencies.recordDerivatives },
    );
  };

  async function recordObservation(job: ProcessingJob, source?: SourceDocument, failureReason?: string): Promise<number> {
    if (!dependencies.recordSourceObservation) return -1;
    try {
      return await dependencies.recordSourceObservation(job, source, failureReason);
    } catch (error) {
      console.error(`Failed to record source observation for ${job.zineId}:`, error);
      return -1;
    }
  }
}
