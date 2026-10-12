import 'dotenv/config';
import { createZineProcessingWorker } from '../src/composition/server/create-zine-processing-worker';

const limit = getNumberArgument('--limit', 10);
const concurrency = getNumberArgument('--concurrency', 2);

async function main(): Promise<void> {
  const worker = createZineProcessingWorker();
  const results: Array<{ id: number; status: string }> = [];
  let claimedCount = 0;
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (claimedCount < limit) {
      claimedCount += 1;
      const job = await worker.claimNext();
      if (!job) return;
      results.push({
        id: job.zineId,
        status: await worker.processClaimed(job),
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
