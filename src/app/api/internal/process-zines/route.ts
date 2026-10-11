import { NextResponse } from 'next/server';
import { createSupabaseProcessingJobStore } from '@/services/processing-job-module';
import { createAdminClient } from '@/utils/supabase/admin';
import { processClaimedZine } from '@/services/process-claimed-zine';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET ?? process.env.ZINE_PROCESSOR_SECRET;
  const authorization = request.headers.get('authorization');
  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const jobs = createSupabaseProcessingJobStore(supabase);
  const job = await jobs.claimNext();
  if (!job) {
    return NextResponse.json({ processed: false, message: 'No pending zines' });
  }

  try {
    const status = await processClaimedZine(job, supabase, jobs);
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
