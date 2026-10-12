import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CoverGenerationRepository } from '@/application/cover-generation-service';
import type { AssetTarget } from '@/application/asset-storage';

export function createSupabaseZineCoverRepository(
  supabase: SupabaseClient<Database>,
): CoverGenerationRepository {
  return {
    async getState(target) {
      const zineId = assertZineTarget(target);
      const { data, error } = await supabase
        .from('library_zines')
        .select('cover_image')
        .eq('id', zineId)
        .single();
      if (error || !data) throw new Error(`Zine with ID ${zineId} not found`);
      return { coverImage: data.cover_image };
    },

    async markProcessing(target) {
      await updateStatus(assertZineTarget(target), 'processing');
    },

    async markFailed(target) {
      await updateStatus(assertZineTarget(target), 'failed');
    },

    async publish(generation) {
      const { error } = await supabase
        .from('library_zines')
        .update({
          cover_image: generation.coverImage,
          import_status: 'completed',
          processed_pdf_url: generation.sourceUrl,
        })
        .eq('id', assertZineTarget(generation.target));
      if (error) throw new Error(`Failed to finish cover processing: ${error.message}`);
    },
  };

  async function updateStatus(zineId: number, status: 'processing' | 'failed'): Promise<void> {
    const { error } = await supabase
      .from('library_zines')
      .update({ import_status: status })
      .eq('id', zineId);
    if (error) throw new Error(`Failed to update zine status: ${error.message}`);
  }
}

function assertZineTarget(target: AssetTarget): number {
  if (target.kind !== 'zine') throw new Error('Expected a zine cover-generation target');
  return target.id;
}
