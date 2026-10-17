import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CoverGenerationRepository } from '@/application/cover-generation/cover-generation-types';
import type { AssetTarget } from '@/application/asset-storage';
import { isGeneratedCover, isPlaceholderCover } from '@/utils/cover-image';

export function createSupabaseZineCoverRepository(
  supabase: SupabaseClient<Database>,
  options: { repairOnly?: boolean } = {},
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
      if (options.repairOnly) return;
      await updateStatus(assertZineTarget(target), 'processing');
    },

    async markFailed(target) {
      if (options.repairOnly) return;
      await updateStatus(assertZineTarget(target), 'failed');
    },

    async publish(generation) {
      const zineId = assertZineTarget(generation.target);
      const { data: current, error: currentError } = await supabase
        .from('library_zines')
        .select('cover_image, pdf_url')
        .eq('id', zineId)
        .single();
      if (currentError || !current) throw new Error(`Zine with ID ${zineId} not found`);
      if (current.pdf_url !== generation.sourceUrl) {
        throw new Error('The publication PDF changed while cover processing was running');
      }
      if (!isPlaceholderCover(current.cover_image)
        && !isGeneratedCover(current.cover_image, zineId)
        && !generation.replaceExternalCover) {
        await updateStatus(zineId, 'completed');
        return false;
      }
      if (generation.replaceExternalCover && current.cover_image !== generation.expectedCoverImage) {
        return false;
      }

    const update = options.repairOnly
      ? { cover_image: generation.coverImage }
      : {
        cover_image: generation.coverImage,
        import_status: 'completed' as const,
        processed_pdf_url: generation.sourceUrl,
      };
    const { error } = await supabase
      .from('library_zines')
      .update(update)
        .eq('id', zineId)
        .eq('pdf_url', generation.sourceUrl)
        .select('id')
        .single();
      if (error) throw new Error(`Failed to finish cover processing: ${error.message}`);
      return true;
    },
  };

  async function updateStatus(zineId: number, status: 'processing' | 'failed' | 'completed'): Promise<void> {
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
