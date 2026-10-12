import { createAdminClient } from '@/utils/supabase/admin';
import { processClaimedZine } from '@/application/processing/process-claimed-zine';
import type { ProcessingWorker } from '@/application/processing/processing-job-types';
import { createZineCoverProcessor } from '@/composition/server/create-zine-cover-processor';
import { createSupabaseProcessingJobStore } from '@/infrastructure/processing/supabase-processing-job-store';

export function createZineProcessingWorker(): ProcessingWorker {
  const supabase = createAdminClient();
  const jobs = createSupabaseProcessingJobStore(supabase);
  const processor = createZineCoverProcessor(supabase);

  return {
    claimNext: () => jobs.claimNext(),
    processClaimed(job) {
      return processClaimedZine(job, jobs, processor);
    },
  };
}
