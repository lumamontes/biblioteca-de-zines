import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PageGenerationRepository } from './page-generation-module';
import type { AssetTarget } from './asset-storage';
import { isPlaceholderCover } from '@/utils/cover-image';

export async function promoteFormUploadPageGeneration(
  supabase: SupabaseClient<Database>,
  formUploadId: number,
  zineId: number,
): Promise<boolean> {
  const { data: upload, error: uploadError } = await supabase
    .from('form_uploads')
    .select('active_page_generation, cover_image, pdf_url, processed_pdf_url, total_pages')
    .eq('id', formUploadId)
    .single();
  if (uploadError || !upload?.active_page_generation || upload.pdf_url !== upload.processed_pdf_url) {
    return false;
  }

  const { data: pages, error: pagesError } = await supabase
    .from('form_upload_pages')
    .select('generation_id, image_url, page_number')
    .eq('form_upload_id', formUploadId)
    .eq('generation_id', upload.active_page_generation)
    .order('page_number', { ascending: true });
  if (pagesError || !pages?.length || pages.length !== upload.total_pages) return false;

  const { data: zine, error: zineError } = await supabase
    .from('library_zines')
    .select('cover_image')
    .eq('id', zineId)
    .single();
  if (zineError || !zine) return false;

  const { error: insertError } = await supabase.from('zine_pages').upsert(
    pages.map((page) => ({
      generation_id: page.generation_id,
      image_url: page.image_url,
      page_number: page.page_number,
      zine_id: zineId,
    })),
    { onConflict: 'zine_id,generation_id,page_number' },
  );
  if (insertError) throw new Error(`Failed to promote form-upload pages: ${insertError.message}`);

  const { error: updateError } = await supabase
    .from('library_zines')
    .update({
      ...(isPlaceholderCover(zine.cover_image) && upload.cover_image
        ? { cover_image: upload.cover_image }
        : {}),
      active_page_generation: upload.active_page_generation,
      import_status: 'completed',
      total_pages: upload.total_pages,
    })
    .eq('id', zineId);
  if (updateError) throw new Error(`Failed to promote form-upload generation: ${updateError.message}`);

  return true;
}

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
