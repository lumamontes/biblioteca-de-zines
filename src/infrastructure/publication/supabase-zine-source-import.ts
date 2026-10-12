import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createZineProcessingRequester } from '@/infrastructure/processing/zine-processing-requester';
import { createZineSourceImportModule } from '@/application/source-import/source-import-module';

export function createSupabaseZineSourceImportService(
  supabase: SupabaseClient<Database>,
) {
  return createZineSourceImportModule({
    zines: {
      async updatePdfUrl(zineId, pdfUrl) {
        const { error } = await supabase
          .from('library_zines')
          .update({ pdf_url: pdfUrl, import_status: 'pending' })
          .eq('id', zineId);
        if (error) throw new Error(`Failed to queue zine processing: ${error.message}`);
      },
    },
    processing: createZineProcessingRequester(),
  });
}
