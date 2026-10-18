import 'dotenv/config';
import { createZineProcessingWorker } from '../src/composition/server/create-zine-processing-worker';
import { parseProcessingOptions } from './process-pending-zines-options';

async function main(): Promise<void> {
  const { concurrency, force, limit, onlyId } = parseProcessingOptions(process.argv.slice(2));
  const worker = createZineProcessingWorker();
  if (force) await worker.enqueue(onlyId!);
  const results: Array<{ id: number; status: string }> = [];
  let claimedCount = 0;
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (claimedCount < limit) {
      claimedCount += 1;
      const job = await worker.claimNext(onlyId);
      if (!job) return;
      results.push({
        id: job.zineId,
        status: await worker.processClaimed(job),
      });
    }
  }));

  console.table(results);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
