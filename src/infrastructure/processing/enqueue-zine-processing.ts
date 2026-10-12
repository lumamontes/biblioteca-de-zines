import { createAdminClient } from '@/utils/supabase/admin';
import { createSupabaseProcessingJobStore } from './supabase-processing-job-store';

export async function enqueueZineProcessing(zineId: number): Promise<void> {
  await createSupabaseProcessingJobStore(createAdminClient()).enqueue(zineId);
}
