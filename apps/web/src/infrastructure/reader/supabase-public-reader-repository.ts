import type { SupabaseClient } from '@supabase/supabase-js';
import type { PublicReaderRepository } from '@/application/reader/public-reader-types';
import type { Database } from '@/types/database.types';
import { findPublishedZineBySlug } from './supabase-published-zine-slug';

export function createSupabasePublicReaderRepository(supabase: SupabaseClient<Database>): PublicReaderRepository {
  return {
    async findPublicBySlug(slug) {
      const resolution = await findPublishedZineBySlug<ReaderPublicationRow>(
        supabase,
        slug,
        'id, slug, title, pdf_url, active_page_generation, total_pages, import_status, is_published',
      );
      const data = resolution?.data;
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

type ReaderPublicationRow = {
  id: number;
  slug: string | null;
  title: string;
  pdf_url: string | null;
  active_page_generation: string | null;
  total_pages: number | null;
  import_status: string | null;
  is_published: boolean | null;
};
