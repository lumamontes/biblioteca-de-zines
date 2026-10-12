import type { PageGenerationRepository } from '@/application/page-generation/page-generation-types';
import type { AssetTarget } from '@/application/asset-storage';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isGeneratedCover, isPlaceholderCover } from '@/utils/cover-image';

export function createSupabasePageGenerationRepository(
  supabase: SupabaseClient<Database>,
): PageGenerationRepository {
  return {
    async isProcessable(target, sourceUrl) {
      const zineId = assertZineTarget(target);
      const { data, error } = await supabase
        .from('library_zines')
        .select('is_published, pdf_url')
        .eq('id', zineId)
        .single();
      if (error || !data) throw new Error(`Zine with ID ${zineId} not found`);
      return data.is_published === true && data.pdf_url === sourceUrl;
    },

    async markProcessing(target) {
      await updateStatus(assertZineTarget(target), 'processing');
    },

    async markFailed(target) {
      await updateStatus(assertZineTarget(target), 'failed');
    },

    async activate(generation) {
      const zineId = assertZineTarget(generation.target);
      const { data: current, error: currentError } = await supabase
        .from('library_zines')
        .select('active_page_generation, cover_image, is_published, pdf_url')
        .eq('id', zineId)
        .single();
      if (currentError || !current) throw new Error(`Zine with ID ${zineId} not found`);
      if (!current.is_published || current.pdf_url !== generation.sourceUrl) return { activated: false };

      const useCover = Boolean(
        generation.coverImage
        && (isPlaceholderCover(current.cover_image) || isGeneratedCover(current.cover_image, zineId)),
      );

      const { error: pagesError } = await supabase.from('zine_pages').insert(generation.pages.map((page) => ({
        generation_id: generation.generationId,
        height: page.height,
        image_url: page.imageUrl,
        page_number: page.pageNumber,
        width: page.width,
        zine_id: zineId,
      })));
      if (pagesError) {
        await removeGenerationRows(zineId, generation.generationId);
        throw new Error(`Failed to store page generation: ${pagesError.message}`);
      }

      const { data: updated, error: updateError } = await supabase
        .from('library_zines')
        .update({
          active_page_generation: generation.generationId,
          ...(useCover ? { cover_image: generation.coverImage } : {}),
          import_status: 'completed',
          processed_pdf_url: generation.sourceUrl,
          total_pages: generation.pages.length,
        })
        .eq('id', zineId)
        .eq('active_page_generation', current.active_page_generation)
        .eq('is_published', true)
        .eq('pdf_url', generation.sourceUrl)
        .select('id')
        .maybeSingle();
      if (updateError) {
        await removeGenerationRows(zineId, generation.generationId);
        throw new Error(`Failed to activate page generation: ${updateError.message}`);
      }
      if (!updated) {
        await removeGenerationRows(zineId, generation.generationId);
        return { activated: false };
      }

      return {
        activated: true,
        coverImageUsed: useCover,
        previousGenerationId: current.active_page_generation === 'legacy'
          ? undefined
          : current.active_page_generation,
      };
    },
  };

  async function updateStatus(zineId: number, status: 'processing' | 'failed'): Promise<void> {
    const { error } = await supabase.from('library_zines').update({ import_status: status }).eq('id', zineId);
    if (error) throw new Error(`Failed to update zine status: ${error.message}`);
  }

  async function removeGenerationRows(zineId: number, generationId: string): Promise<void> {
    await supabase.from('zine_pages').delete().eq('zine_id', zineId).eq('generation_id', generationId);
  }
}

function assertZineTarget(target: AssetTarget): number {
  if (target.kind !== 'zine') throw new Error('Expected a zine page-generation target');
  return target.id;
}
