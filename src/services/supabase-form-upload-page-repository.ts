import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AssetTarget } from './asset-storage';
import type { PageGenerationRepository } from './page-generation-module';

export function createSupabaseFormUploadPageRepository(
  supabase: SupabaseClient<Database>,
): PageGenerationRepository {
  return {
    async getState(target) {
      const formUploadId = assertFormUploadTarget(target);
      const { data, error } = await supabase
        .from('form_uploads')
        .select('cover_image')
        .eq('id', formUploadId)
        .single();
      if (error || !data) throw new Error(`Form upload with ID ${formUploadId} not found`);
      return { coverImage: data.cover_image };
    },

    async markProcessing(target) {
      await updateStatus(assertFormUploadTarget(target), 'processing');
    },

    async markFailed(target) {
      await updateStatus(assertFormUploadTarget(target), 'failed');
    },

    async publish(generation) {
      const formUploadId = assertFormUploadTarget(generation.target);
      const { error: insertError } = await supabase.from('form_upload_pages').insert(
        generation.pages.map((page) => ({
          form_upload_id: formUploadId,
          generation_id: generation.generationId,
          image_url: page.imageUrl,
          page_number: page.pageNumber,
        })),
      );
      if (insertError) throw new Error(`Failed to store form-upload pages: ${insertError.message}`);

      const { error: updateError } = await supabase
        .from('form_uploads')
        .update({
          ...(generation.coverImage ? { cover_image: generation.coverImage } : {}),
          active_page_generation: generation.generationId,
          processing_status: 'completed',
          processed_pdf_url: generation.sourceUrl ?? null,
          total_pages: generation.totalPages,
        })
        .eq('id', formUploadId);
      if (updateError) throw new Error(`Failed to finish form-upload processing: ${updateError.message}`);

      const { error: oldPagesError } = await supabase
        .from('form_upload_pages')
        .delete()
        .eq('form_upload_id', formUploadId)
        .neq('generation_id', generation.generationId);
      if (oldPagesError) console.error(`Failed to remove old form-upload pages: ${oldPagesError.message}`);
    },
  };

  async function updateStatus(
    formUploadId: number,
    status: 'processing' | 'failed',
  ): Promise<void> {
    const { error } = await supabase
      .from('form_uploads')
      .update({ processing_status: status })
      .eq('id', formUploadId);
    if (error) throw new Error(`Failed to update form-upload status: ${error.message}`);
  }
}

function assertFormUploadTarget(target: AssetTarget): number {
  if (target.kind !== 'form-upload') throw new Error('Expected a form-upload page-generation target');
  return target.id;
}
