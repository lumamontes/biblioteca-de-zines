import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PageGenerationRepository } from './page-generation-module';
import type { AssetTarget } from './asset-storage';

export function createSupabaseZinePageRepository(
  supabase: SupabaseClient<Database>,
): PageGenerationRepository {
  return {
    async getState(target) {
      const zineId = assertZineTarget(target);
      const { data, error } = await supabase
        .from('library_zines')
        .select('id, cover_image')
        .eq('id', zineId)
        .single();
      if (error || !data) throw new Error(`Zine with ID ${zineId} not found`);
      return {
        coverImage: data.cover_image,
      };
    },

    async markProcessing(target) {
      const zineId = assertZineTarget(target);
      await updateStatus(zineId, 'processing');
    },

    async markFailed(target) {
      const zineId = assertZineTarget(target);
      await updateStatus(zineId, 'failed');
    },

    async publish(generation) {
      const zineId = assertZineTarget(generation.target);
      const { error: insertError } = await supabase.from('zine_pages').insert(
        generation.pages.map((page) => ({
          generation_id: generation.generationId,
          image_url: page.imageUrl,
          page_number: page.pageNumber,
          zine_id: zineId,
        })),
      );
      if (insertError) throw new Error(`Failed to store rendered pages: ${insertError.message}`);

      const { error: updateError } = await supabase
        .from('library_zines')
        .update({
          ...(generation.coverImage ? { cover_image: generation.coverImage } : {}),
          active_page_generation: generation.generationId,
          import_status: 'completed',
          processed_pdf_url: generation.sourceUrl ?? null,
          total_pages: generation.totalPages,
        })
        .eq('id', zineId);
      if (updateError) throw new Error(`Failed to finish page processing: ${updateError.message}`);

      const { error: oldPagesError } = await supabase
        .from('zine_pages')
        .delete()
        .eq('zine_id', zineId)
        .neq('generation_id', generation.generationId);
      if (oldPagesError) console.error(`Failed to remove old page rows: ${oldPagesError.message}`);
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
  if (target.kind !== 'zine') throw new Error('Expected a zine page-generation target');
  return target.id;
}
