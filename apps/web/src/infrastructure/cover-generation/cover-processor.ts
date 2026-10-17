import type {
  ProcessingJob,
  ProcessingProcessor,
} from '@/application/processing/processing-job-types';
import { createCoverGeneration } from '@/application/cover-generation/cover-generation-service';
import { SourceAcquisitionError, type SourceDocument } from '@/domain/source-document';
import type {
  CoverProcessorDependencies,
  CoverProcessorOptions,
} from './cover-processor-types';

export function createCoverProcessor(
  dependencies: CoverProcessorDependencies,
  options: CoverProcessorOptions = {},
): ProcessingProcessor {
  return async (job: ProcessingJob) => {
    let sourceObservationId: number | undefined;
    const loadSource = async () => {
      let source: Awaited<ReturnType<CoverProcessorDependencies['downloadSource']>>;
      try {
        source = await dependencies.downloadSource(job.pdfUrl);
      } catch (error) {
        await recordObservation(
          job,
          undefined,
          error instanceof Error ? error.message : 'Source download failed',
          error instanceof SourceAcquisitionError ? error.acquisition : undefined,
        );
        throw error;
      }

      sourceObservationId = await recordObservation(job, source);
      return source;
    };
    await createCoverGeneration(
      loadSource,
      { id: job.zineId, kind: 'zine' },
      dependencies.repository,
      dependencies.storage,
      job.pdfUrl,
      dependencies.renderFirstPage,
      dependencies.optimizeCover,
      { ...options, sourceObservationId: () => sourceObservationId, recordDerivative: dependencies.recordDerivative },
    );
  };

  async function recordObservation(
    job: ProcessingJob,
    source?: Awaited<ReturnType<CoverProcessorDependencies['downloadSource']>>,
    failureReason?: string,
    acquisition?: SourceDocument['acquisition'],
  ): Promise<number | undefined> {
    if (!dependencies.recordSourceObservation) return undefined;
    try {
      return await dependencies.recordSourceObservation(job, source, failureReason, acquisition);
    } catch (error) {
      console.error(`Failed to record source observation for ${job.zineId}:`, error);
      return undefined;
    }
  }
}
