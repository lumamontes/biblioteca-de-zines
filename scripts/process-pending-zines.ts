import 'dotenv/config';
import { createAdminClient } from '../src/utils/supabase/admin';
import { createSupabaseProcessingJobStore } from '../src/infrastructure/processing/supabase-processing-job-store';
import { processClaimedZine } from '../src/application/processing/process-claimed-zine';
import { createCoverGenerationFromUrl } from '../src/infrastructure/cover-generation/cover-import-service';

const limit = getNumberArgument('--limit', 10);
const concurrency = getNumberArgument('--concurrency', 2);

async function main(): Promise<void> {
  const supabase = createAdminClient();
  const jobs = createSupabaseProcessingJobStore(supabase);
  const results: Array<{ id: number; status: string }> = [];
  let claimedCount = 0;
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (claimedCount < limit) {
      claimedCount += 1;
      const job = await jobs.claimNext();
      if (!job) return;
      results.push({
        id: job.zineId,
        status: await processClaimedZine(
          job,
          jobs,
          () => createCoverGenerationFromUrl(job.zineId, job.pdfUrl, supabase),
        ),
      });
    }
  }));

  console.table(results);
}

function getNumberArgument(name: string, fallback: number): number {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? Number(process.argv[index + 1]) : fallback;
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
