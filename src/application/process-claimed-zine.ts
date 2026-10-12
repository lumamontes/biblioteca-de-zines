import type { ProcessingJob, ProcessingJobStore } from '@/application/processing-job-types';

export async function processClaimedZine(
  job: ProcessingJob,
  jobs: ProcessingJobStore,
  process: () => Promise<void>,
): Promise<'completed' | 'failed'> {
  try {
    await process();
    await jobs.complete(job.id);
    return 'completed';
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown processing error';
    await jobs.fail(job.id, message);
    console.error(`Failed to process ${job.zineId} (${job.title}):`, error);
    return 'failed';
  }
}
