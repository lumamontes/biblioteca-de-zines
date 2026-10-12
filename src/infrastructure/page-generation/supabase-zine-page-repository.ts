import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PageGenerationRepository } from '@/application/page-generation-types';
import type { AssetTarget } from '@/application/asset-storage';

export function createSupabaseZinePageRepository(
  supabase: SupabaseClient<Database>,
): PageGenerationRepository {
  return {
    async getState(target) {
      const zineId = assertZineTarget(target);
      const { data, error } = await supabase
        .from('library_zines')
        .select('id, cover_image, active_page_generation')
        .eq('id', zineId)
        .single();
      if (error || !data) throw new Error(`Zine with ID ${zineId} not found`);
      return {
        activePageGeneration: data.active_page_generation,
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
      if (updateError) {
        await supabase
          .from('zine_pages')
          .delete()
          .eq('zine_id', zineId)
          .eq('generation_id', generation.generationId);
        throw new Error(`Failed to finish page processing: ${updateError.message}`);
      }

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

export async function hasCompleteZineGeneration(
  supabase: SupabaseClient<Database>,
  zineId: number,
  pdfUrl: string,
): Promise<boolean> {
  const { data: zine, error: zineError } = await supabase
    .from('library_zines')
    .select('active_page_generation, import_status, processed_pdf_url, total_pages')
    .eq('id', zineId)
    .single();
  if (zineError || !zine || !zine.active_page_generation || zine.active_page_generation === 'legacy') {
    return false;
  }
  if (zine.import_status !== 'completed' || zine.processed_pdf_url !== pdfUrl || !zine.total_pages) {
    return false;
  }

  const { count, error: pagesError } = await supabase
    .from('zine_pages')
    .select('id', { count: 'exact', head: true })
    .eq('zine_id', zineId)
    .eq('generation_id', zine.active_page_generation);
  return !pagesError && count === zine.total_pages;
}

export async function restoreFirstPageCover(
  supabase: SupabaseClient<Database>,
  zineId: number,
): Promise<void> {
  const { data: zine } = await supabase
    .from('library_zines')
    .select('active_page_generation')
    .eq('id', zineId)
    .single();
  if (!zine?.active_page_generation || zine.active_page_generation === 'legacy') return;

  const { data: firstPage } = await supabase
    .from('zine_pages')
    .select('image_url')
    .eq('zine_id', zineId)
    .eq('generation_id', zine.active_page_generation)
    .eq('page_number', 1)
    .single();
  if (!firstPage) return;

  const { error } = await supabase
    .from('library_zines')
    .update({ cover_image: firstPage.image_url })
    .eq('id', zineId);
  if (error) throw new Error(`Failed to restore first-page cover: ${error.message}`);
}

function assertZineTarget(target: AssetTarget): number {
  if (target.kind !== 'zine') throw new Error('Expected a zine page-generation target');
  return target.id;
}
