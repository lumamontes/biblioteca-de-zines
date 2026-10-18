import { createAdminClient } from '@/utils/supabase/admin';
import { processClaimedZine } from '@/application/processing/process-claimed-zine';
import type { ProcessingWorker } from '@/application/processing/processing-job-types';
import { createZinePageProcessor } from '@/composition/server/create-zine-page-processor';
import { createSupabaseProcessingJobStore } from '@/infrastructure/processing/supabase-processing-job-store';

export function createZineProcessingWorker(): ProcessingWorker {
  const supabase = createAdminClient();
  const jobs = createSupabaseProcessingJobStore(supabase);
  const processor = createZinePageProcessor(supabase);

  return {
    claimNext: (zineId) => jobs.claimNext(zineId),
    enqueue: (zineId) => jobs.enqueue(zineId),
    processClaimed(job) {
      return processClaimedZine(job, jobs, processor);
    },
  };
}
