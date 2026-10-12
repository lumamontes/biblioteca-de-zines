import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { enqueueZineProcessing } from '@/infrastructure/processing/enqueue-zine-processing';
import { dispatchZineProcessing } from '@/infrastructure/processing/zine-processing-dispatch-service';
import { createZineSourceImportService } from '@/application/source-import/zine-source-import-service';

export function createSupabaseZineSourceImportService(
  supabase: SupabaseClient<Database>,
) {
  return createZineSourceImportService({
    zines: {
      async updatePdfUrl(zineId, pdfUrl) {
        const { error } = await supabase
          .from('library_zines')
          .update({ pdf_url: pdfUrl, import_status: 'pending' })
          .eq('id', zineId);
        if (error) throw new Error(`Failed to queue zine processing: ${error.message}`);
      },
    },
    processing: {
      async request(zineId) {
        await enqueueZineProcessing(zineId);
        await dispatchZineProcessing();
      },
    },
  });
}
