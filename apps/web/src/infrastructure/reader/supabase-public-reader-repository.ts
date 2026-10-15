import type { SupabaseClient } from '@supabase/supabase-js';
import type { PublicReaderRepository } from '@/application/reader/public-reader-types';
import type { Database } from '@/types/database.types';

export function createSupabasePublicReaderRepository(supabase: SupabaseClient<Database>): PublicReaderRepository {
  return {
    async findPublicBySlug(slug) {
      const initial = await supabase.from('library_zines')
        .select('id, slug, title, pdf_url, active_page_generation, total_pages, import_status, is_published')
        .eq('slug', slug).eq('is_published', true).maybeSingle();
      if (initial.error) throw new Error(`Failed to load public reader publication: ${initial.error.message}`);
      let data = initial.data;

      if (!data) {
        const alias = await supabase.from('zine_slug_aliases').select('zine_id').eq('slug', slug).maybeSingle();
        if (alias.error) throw new Error(`Failed to load public reader slug alias: ${alias.error.message}`);
        if (alias.data) {
          const canonical = await supabase.from('library_zines')
            .select('id, slug, title, pdf_url, active_page_generation, total_pages, import_status, is_published')
            .eq('id', alias.data.zine_id).eq('is_published', true).maybeSingle();
          if (canonical.error) throw new Error(`Failed to load public reader publication: ${canonical.error.message}`);
          data = canonical.data;
        }
      }
      if (!data || !data.is_published || !data.slug) return null;

      const pages = data.active_page_generation
        ? await supabase.from('zine_pages').select('generation_id, page_number, image_url, width, height')
          .eq('zine_id', data.id).eq('generation_id', data.active_page_generation).order('page_number', { ascending: true })
        : { data: [], error: null };
      if (pages.error) throw new Error(`Failed to load active reader pages: ${pages.error.message}`);

      return {
        activePageGeneration: data.active_page_generation,
        id: data.id,
        importStatus: data.import_status,
        pages: (pages.data ?? []).map((page) => ({
          generationId: page.generation_id,
          pageNumber: page.page_number,
          imageUrl: page.image_url,
          width: page.width ?? 0,
          height: page.height ?? 0,
        })),
        pdfUrl: data.pdf_url,
        slug: data.slug,
        title: data.title,
        totalPages: data.total_pages,
      };
    },
  };
}
