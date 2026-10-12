import type { PublicReaderRepository } from '@/application/reader/public-reader-types';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createSupabasePublicReaderRepository(
  supabase: SupabaseClient<Database>,
): PublicReaderRepository {
  return {
    async findPublicBySlug(slug) {
      const { data, error } = await supabase
        .from('library_zines')
        .select('id, slug, title, pdf_url, active_page_generation, total_pages, import_status, is_published')
        .eq('slug', slug)
        .eq('is_published', true)
        .order('page_number', { ascending: true, referencedTable: 'zine_pages' })
        .maybeSingle();
      if (error) throw new Error(`Failed to load public reader publication: ${error.message}`);
      if (!data || !data.is_published || !data.slug) return null;

      const { data: pages, error: pagesError } = data.active_page_generation
        ? await supabase
          .from('zine_pages')
          .select('generation_id, page_number, image_url, width, height')
          .eq('zine_id', data.id)
          .eq('generation_id', data.active_page_generation)
          .order('page_number', { ascending: true })
        : { data: [], error: null };
      if (pagesError) throw new Error(`Failed to load active reader pages: ${pagesError.message}`);

      return {
        activePageGeneration: data.active_page_generation,
        id: data.id,
        importStatus: data.import_status,
        pages: (pages ?? []).map((page) => ({
          generationId: page.generation_id,
          height: page.height ?? 0,
          imageUrl: page.image_url,
          pageNumber: page.page_number,
          width: page.width ?? 0,
        })),
        pdfUrl: data.pdf_url,
        slug: data.slug,
        title: data.title,
        totalPages: data.total_pages,
      };
    },
  };
}
