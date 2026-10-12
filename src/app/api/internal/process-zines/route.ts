import { NextResponse } from 'next/server';
import { createZineProcessingWorker } from '@/composition/server/create-zine-processing-worker';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET ?? process.env.ZINE_PROCESSOR_SECRET;
  const authorization = request.headers.get('authorization');
  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const worker = createZineProcessingWorker();
  const { jobs } = worker;
  const job = await jobs.claimNext();
  if (!job) {
    return NextResponse.json({ processed: false, message: 'No pending zines' });
  }

  try {
    const status = await worker.process(job);
    return NextResponse.json({ processed: true, status, zineId: job.zineId });
  } catch (error) {
    return NextResponse.json({
      processed: true,
      zineId: job.zineId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown processing error',
    }, { status: 500 });
  }
}
