import { createAdminClient } from '@/utils/supabase/admin';
import { processClaimedZine } from '@/application/processing/process-claimed-zine';
import { createCoverGenerationFromUrl } from '@/infrastructure/cover-generation/cover-import-service';
import { createSupabaseProcessingJobStore } from '@/infrastructure/processing/supabase-processing-job-store';

export function createZineProcessingWorker() {
  const supabase = createAdminClient();
  const jobs = createSupabaseProcessingJobStore(supabase);

  return {
    jobs,
    process(job: Parameters<typeof processClaimedZine>[0]) {
      return processClaimedZine(
        job,
        jobs,
        () => createCoverGenerationFromUrl(job.zineId, job.pdfUrl, supabase),
      );
    },
  };
}
