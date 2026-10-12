import type { PageGenerationRepository } from '@/application/page-generation/page-generation-types';
import type { AssetTarget } from '@/application/asset-storage';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isPlaceholderCover } from '@/utils/cover-image';

export function createSupabasePageGenerationRepository(
  supabase: SupabaseClient<Database>,
): PageGenerationRepository {
  return {
    async isProcessable(target, sourceUrl) {
      const zineId = assertZineTarget(target);
      const { data, error } = await supabase
        .from('library_zines')
        .select('active_page_generation, cover_image, import_status, is_published, pdf_url, processed_pdf_url')
        .eq('id', zineId)
        .single();
      if (error || !data) throw new Error(`Zine with ID ${zineId} not found`);
      if (data.is_published !== true || data.pdf_url !== sourceUrl) return false;
      const complete = data.import_status === 'completed'
        && data.processed_pdf_url === sourceUrl
        && data.active_page_generation !== 'legacy'
        && Boolean(data.active_page_generation);
      return !complete || isPlaceholderCover(data.cover_image);
    },

    async markProcessing(target) {
      await updateStatus(assertZineTarget(target), 'processing');
    },

    async markFailed(target) {
      await updateStatus(assertZineTarget(target), 'failed');
    },

    async activate(generation) {
      const zineId = assertZineTarget(generation.target);
      const { data, error } = await supabase.rpc('activate_zine_page_generation', {
        p_cover_image: generation.coverImage ?? null,
        p_generation_id: generation.generationId,
        p_pages: generation.pages.map((page) => ({
          generation_id: page.generationId,
          height: page.height,
          image_url: page.imageUrl,
          page_number: page.pageNumber,
          width: page.width,
        })),
        p_source_url: generation.sourceUrl,
        p_zine_id: zineId,
      });
      if (error) throw new Error(`Failed to activate page generation: ${error.message}`);
      const result = data?.[0];
      if (!result) throw new Error('Page generation activation returned no result');
      if (!result.activated) return { activated: false };
      return {
        activated: true,
        coverImageUsed: result.cover_image_used,
        previousGenerationId: result.previous_generation_id ?? undefined,
      };
    },
  };

  async function updateStatus(zineId: number, status: 'processing' | 'failed'): Promise<void> {
    const { error } = await supabase.from('library_zines').update({ import_status: status }).eq('id', zineId);
    if (error) throw new Error(`Failed to update zine status: ${error.message}`);
  }

}

function assertZineTarget(target: AssetTarget): number {
  if (target.kind !== 'zine') throw new Error('Expected a zine page-generation target');
  return target.id;
}
