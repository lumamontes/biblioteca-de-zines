import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createPageGenerationFromUrl } from './zine-import-service';
import type { ProcessingJob, ProcessingJobStore } from './processing-job-module';

export async function processClaimedZine(
  job: ProcessingJob,
  supabase: SupabaseClient<Database>,
  jobs: ProcessingJobStore,
): Promise<'completed' | 'failed'> {
  try {
    await createPageGenerationFromUrl(job.zineId, job.pdfUrl, supabase);
    await jobs.complete(job.id);
    return 'completed';
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown processing error';
    await jobs.fail(job.id, message);
    console.error(`Failed to process ${job.zineId} (${job.title}):`, error);
    return 'failed';
  }
}
