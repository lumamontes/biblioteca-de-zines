import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PageGenerationRepository } from './page-generation-module';

export function createSupabaseZinePageRepository(
  supabase: SupabaseClient<Database>,
): PageGenerationRepository {
  return {
    async getState(zineId) {
      const { data, error } = await supabase
        .from('library_zines')
        .select('id, cover_image')
        .eq('id', zineId)
        .single();
      if (error || !data) throw new Error(`Zine with ID ${zineId} not found`);
      return {
        coverImage: data.cover_image,
        zineId: data.id,
      };
    },

    async markProcessing(zineId) {
      await updateStatus(zineId, 'processing');
    },

    async markFailed(zineId) {
      await updateStatus(zineId, 'failed');
    },

    async publish(generation) {
      const { error: insertError } = await supabase.from('zine_pages').insert(
        generation.pages.map((page) => ({
          generation_id: generation.generationId,
          image_url: page.imageUrl,
          page_number: page.pageNumber,
          zine_id: generation.zineId,
        })),
      );
      if (insertError) throw new Error(`Failed to store rendered pages: ${insertError.message}`);

      const { error: updateError } = await supabase
        .from('library_zines')
        .update({
          ...(generation.coverImage ? { cover_image: generation.coverImage } : {}),
          active_page_generation: generation.generationId,
          import_status: 'completed',
          total_pages: generation.totalPages,
        })
        .eq('id', generation.zineId);
      if (updateError) throw new Error(`Failed to finish page processing: ${updateError.message}`);

      const { error: oldPagesError } = await supabase
        .from('zine_pages')
        .delete()
        .eq('zine_id', generation.zineId)
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
