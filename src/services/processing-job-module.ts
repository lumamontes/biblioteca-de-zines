import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ProcessingJob = {
  attemptCount: number;
  id: number;
  pdfUrl: string;
  title: string;
  zineId: number;
};

export type ProcessingJobStore = {
  claimNext: () => Promise<ProcessingJob | null>;
  complete: (jobId: number) => Promise<void>;
  enqueue: (zineId: number) => Promise<void>;
  fail: (jobId: number, errorMessage: string) => Promise<void>;
};

const leaseDurationMs = 15 * 60_000;
const maxAttempts = 3;

export function createSupabaseProcessingJobStore(
  supabase: SupabaseClient<Database>,
): ProcessingJobStore {
  return {
    async enqueue(zineId) {
      const { error } = await supabase.from('zine_processing_jobs').upsert({
        zine_id: zineId,
        status: 'pending',
        last_error: null,
        lease_until: null,
        next_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'zine_id' });
      if (error) throw new Error(`Failed to enqueue zine ${zineId}: ${error.message}`);
    },

    async claimNext() {
      const now = new Date();
      const nowIso = now.toISOString();
      const leaseUntil = new Date(now.getTime() + leaseDurationMs).toISOString();

      await supabase
        .from('zine_processing_jobs')
        .update({ status: 'pending', lease_until: null, updated_at: nowIso })
        .eq('status', 'processing')
        .lt('lease_until', nowIso);

      const { data: candidate, error: selectError } = await supabase
        .from('zine_processing_jobs')
        .select('id, zine_id, attempt_count')
        .eq('status', 'pending')
        .lte('next_attempt_at', nowIso)
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (selectError) throw new Error(`Failed to find processing job: ${selectError.message}`);
      if (!candidate) return null;

      const { data: claimed, error: claimError } = await supabase
        .from('zine_processing_jobs')
        .update({
          status: 'processing',
          attempt_count: candidate.attempt_count + 1,
          lease_until: leaseUntil,
          updated_at: nowIso,
        })
        .eq('id', candidate.id)
        .eq('status', 'pending')
        .select('id, zine_id, attempt_count')
        .maybeSingle();
      if (claimError) throw new Error(`Failed to claim processing job: ${claimError.message}`);
      if (!claimed) return null;

      const { data: zine, error: zineError } = await supabase
        .from('library_zines')
        .select('id, title, pdf_url')
        .eq('id', claimed.zine_id)
        .single();
      if (zineError || !zine?.pdf_url) {
        await failJob(claimed.id, 'Published zine has no PDF URL');
        return null;
      }

      return {
        attemptCount: claimed.attempt_count,
        id: claimed.id,
        pdfUrl: zine.pdf_url,
        title: zine.title,
        zineId: zine.id,
      };
    },

    async complete(jobId) {
      const { error } = await supabase
        .from('zine_processing_jobs')
        .update({ status: 'completed', lease_until: null, updated_at: new Date().toISOString() })
        .eq('id', jobId);
      if (error) throw new Error(`Failed to complete processing job: ${error.message}`);
    },

    async fail(jobId, errorMessage) {
      await failJob(jobId, errorMessage);
    },
  };

  async function failJob(jobId: number, errorMessage: string): Promise<void> {
    const { data: job } = await supabase
      .from('zine_processing_jobs')
      .select('attempt_count')
      .eq('id', jobId)
      .single();
    const exhausted = (job?.attempt_count ?? maxAttempts) >= maxAttempts;
    const nextAttempt = new Date(Date.now() + 2 ** (job?.attempt_count ?? 1) * 60_000).toISOString();
    const { error } = await supabase
      .from('zine_processing_jobs')
      .update({
        status: exhausted ? 'failed' : 'pending',
        last_error: errorMessage.slice(0, 4000),
        lease_until: null,
        next_attempt_at: nextAttempt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
    if (error) throw new Error(`Failed to record processing failure: ${error.message}`);
  }
}
