import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createCoverProcessor } from '@/infrastructure/cover-generation/cover-processor';
import type { CoverProcessorOptions } from '@/infrastructure/cover-generation/cover-processor-types';
import { extractFirstPageFromPdf } from '@/infrastructure/rendering/pdf-service';
import { createR2CoverAssetStore } from '@/infrastructure/storage/r2-storage-service';
import { optimizeCoverImage } from '@/infrastructure/cover-generation/cover-image-optimizer';
import { createSupabaseZineCoverRepository } from '@/infrastructure/cover-generation/supabase-zine-cover-repository';
import { downloadSource } from '@/infrastructure/source-acquisition/source-download-service';
import { inspectPdfSource } from '@/infrastructure/rendering/pdf-source-inspector';
import { createSupabaseSourceMetadataRepository } from '@/infrastructure/source-metadata/supabase-source-metadata-repository';
import { recordSourceObservation } from '@/application/source-metadata/source-observation-recorder';
import { recordSourceMetadataDerivative } from '@/application/source-metadata/record-source-metadata-derivative';

export function createZineCoverProcessor(
  supabase: SupabaseClient<Database>,
  options: CoverProcessorOptions = {},
) {
  return createCoverProcessor({
    downloadSource,
    repository: createSupabaseZineCoverRepository(supabase),
    storage: createR2CoverAssetStore(),
    renderFirstPage: (source) => extractFirstPageFromPdf(source.buffer),
    optimizeCover: optimizeCoverImage,
    recordSourceObservation: async (job, source, failureReason, sourceAcquisition) => recordSourceObservation({
      publicationId: job.zineId, sourceUri: job.pdfUrl, source,
      acquisition: { ...sourceAcquisition, method: job.pdfUrl.includes('drive.google.com') ? 'google-drive' : 'http', status: source ? 'acquired' : 'unreachable', failureReason },
    }, { inspectPdf: inspectPdfSource, repository: createSupabaseSourceMetadataRepository(supabase) }),
    recordDerivative: async ({ sourceObservationId, assetIdentity, storageReference, generationId }) => {
      await recordSourceMetadataDerivative(createSupabaseSourceMetadataRepository(supabase), {
        sourceObservationId, observationId: `${sourceObservationId}:cover:${generationId}`, assetIdentity, storageReference,
        assetKind: 'derivative', mediaType: 'image/webp', byteSize: null, observedAt: new Date().toISOString(),
        provenanceNote: 'Generated cover linked to the acquired source observation; not an original.',
      });
    },
  }, options);
}
