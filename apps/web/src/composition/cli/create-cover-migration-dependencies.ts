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
      const { createZineCoverProcessor } = await import('../server/create-zine-cover-processor');
      if (!zine.pdf_url) return;
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
