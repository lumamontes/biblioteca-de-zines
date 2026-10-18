import type { PageGenerationRepository } from '@/application/page-generation/page-generation-types';
import type { AssetTarget } from '@/application/asset-storage';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isPlaceholderCover } from '@/utils/cover-image';

export function createSupabasePageGenerationRepository(supabase: SupabaseClient<Database>): PageGenerationRepository {
  return {
    async isProcessable(target, sourceUrl) {
      const zineId = assertZineTarget(target);
      const { data, error } = await supabase.from('library_zines')
        .select('active_page_generation, cover_image, import_status, is_published, pdf_url, processed_pdf_url, total_pages')
        .eq('id', zineId).single();
      if (error || !data) throw new Error(`Zine with ID ${zineId} not found`);
      if (data.is_published !== true || data.pdf_url !== sourceUrl) return false;
      const { data: pages, error: pagesError } = await supabase.from('zine_pages')
        .select('page_number, width, height').eq('zine_id', zineId)
        .eq('generation_id', data.active_page_generation).order('page_number', { ascending: true });
      if (pagesError) throw new Error(`Failed to verify active page generation: ${pagesError.message}`);
      const completePages = Boolean(data.active_page_generation) && pages.length === data.total_pages
        && pages.every((page, index) => page.page_number === index + 1 && Boolean(page.width) && Boolean(page.height));
      const complete = data.import_status === 'completed' && data.processed_pdf_url === sourceUrl
        && data.active_page_generation !== 'legacy' && completePages;
      return !complete || isPlaceholderCover(data.cover_image);
    },
    markProcessing: (target) => updateStatus(assertZineTarget(target), 'processing'),
    markFailed: (target) => updateStatus(assertZineTarget(target), 'failed'),
    async activate(generation) {
      const zineId = assertZineTarget(generation.target);
      const { data, error } = await supabase.rpc('activate_zine_page_generation', {
        p_cover_image: generation.coverImage ?? null,
        p_generation_id: generation.generationId,
        p_pages: generation.pages.map(({ generationId, height, imageUrl, pageNumber, width }) => ({ generation_id: generationId, height, image_url: imageUrl, page_number: pageNumber, width })),
        p_source_url: generation.sourceUrl,
        p_zine_id: zineId,
      });
      if (error) throw new Error(`Failed to activate page generation: ${error.message}`);
      const result = data?.[0];
      if (!result) throw new Error('Page generation activation returned no result');
      return {
        activated: result.activated,
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
