import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { CoverMigrationZine } from '@/application/cover-generation/cover-migration-types';

export async function createCoverMigrationDependencies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
  return {
    processCandidate: async (zine: CoverMigrationZine) => {
      if (!zine.pdf_url) return;
      const { createZineCoverProcessor, createZineCoverRepairProcessor } = await import('../server/create-zine-cover-processor');
      const { data: firstPage } = zine.active_page_generation
        ? await supabase.from('zine_pages')
          .select('image_url')
          .eq('zine_id', zine.id)
          .eq('generation_id', zine.active_page_generation)
          .eq('page_number', 1)
          .maybeSingle()
        : { data: null };

      if (firstPage?.image_url) {
        await createZineCoverRepairProcessor(supabase, firstPage.image_url, {
          expectedCoverImage: zine.cover_image,
          replaceExternalCover: true,
        })({
          attemptCount: 0,
          id: zine.id,
          isPublished: true,
          pdfUrl: zine.pdf_url,
          title: zine.title,
          zineId: zine.id,
        });
        return;
      }

      await createZineCoverProcessor(supabase, {
        expectedCoverImage: zine.cover_image,
        replaceExternalCover: true,
      })({
        attemptCount: 0,
        id: zine.id,
        isPublished: true,
        pdfUrl: zine.pdf_url,
        title: zine.title,
        zineId: zine.id,
      });
    },
    supabase,
  };
}
