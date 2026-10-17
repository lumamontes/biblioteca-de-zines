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
    let sourceObservationId: number | undefined;
    const loadSource = async () => {
      try {
        const source = await dependencies.downloadSource(job.pdfUrl);
        sourceObservationId = dependencies.recordSourceObservation
          ? await dependencies.recordSourceObservation(job, source)
          : undefined;
        return source;
      } catch (error) {
        if (dependencies.recordSourceObservation) await dependencies.recordSourceObservation(job, undefined, error instanceof Error ? error.message : 'Source download failed');
        throw error;
      }
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
}
