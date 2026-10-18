import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createPageProcessor } from '@/infrastructure/page-generation/page-processor';
import { renderPdfPages } from '@/infrastructure/page-generation/pdf-page-renderer';
import { createR2PageGenerationStorage } from '@/infrastructure/page-generation/r2-page-generation-storage';
import { createSupabasePageGenerationRepository } from '@/infrastructure/page-generation/supabase-page-generation-repository';
import { downloadSource } from '@/infrastructure/source-acquisition/source-download-service';
import { optimizeCoverImage } from '@/infrastructure/cover-generation/cover-image-optimizer';
import { inspectPdfSource } from '@/infrastructure/rendering/pdf-source-inspector';
import { createSupabaseSourceMetadataRepository } from '@/infrastructure/source-metadata/supabase-source-metadata-repository';
import { recordSourceObservation } from '@/application/source-metadata/source-observation-recorder';
import { recordSourceMetadataDerivative } from '@/application/source-metadata/record-source-metadata-derivative';

export function createZinePageProcessor(supabase: SupabaseClient<Database>) {
  return createPageProcessor({
    downloadSource,
    recordSourceObservation: (job, source, failureReason, sourceAcquisition) => recordSourceObservation({
      publicationId: job.zineId,
      sourceUri: job.pdfUrl,
      source,
      acquisition: {
        ...sourceAcquisition,
        method: job.pdfUrl.includes('drive.google.com') ? 'google-drive' : 'http',
        status: source ? 'acquired' : 'unreachable',
        failureReason,
      },
     }, { inspectPdf: inspectPdfSource, repository: createSupabaseSourceMetadataRepository(supabase) }),
     recordDerivatives: async ({ sourceObservationId, assets }) => {
       const repository = createSupabaseSourceMetadataRepository(supabase);
       for (const [index, asset] of assets.entries()) await recordSourceMetadataDerivative(repository, {
         sourceObservationId, observationId: `${sourceObservationId}:derivative:${index}:${asset.assetIdentity}`,
         ...asset, observedAt: new Date().toISOString(), provenanceNote: 'Generated derivative linked to the acquired source observation; not an original.',
       });
     },
    createCover: async (page) => ({ contentType: 'image/webp', data: await optimizeCoverImage(page.data) }),
    renderPages: renderPdfPages,
    repository: createSupabasePageGenerationRepository(supabase),
    storage: createR2PageGenerationStorage(),
  });
}
