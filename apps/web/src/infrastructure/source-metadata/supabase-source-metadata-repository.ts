import type { SupabaseClient } from '@supabase/supabase-js';
import type { SourceMetadataRepository } from '@/application/source-metadata/source-metadata-types';
import type { Database, Json, TablesInsert } from '@/types/database.types';

type SourceMetadataInsert = TablesInsert<'source_metadata'>;

export function createSupabaseSourceMetadataRepository(
  supabase: SupabaseClient<Database>,
): SourceMetadataRepository {
  return {
    async create(observation) {
      const insert: SourceMetadataInsert = {
        library_zine_id: observation.libraryZineId,
        form_upload_id: observation.formUploadId,
        source_reference: observation.sourceReference,
        asset_kind: observation.assetKind,
        observed_at: observation.observedAt,
        extractor_version: observation.extractorVersion,
        source_uri: observation.sourceUri,
        acquisition_method: observation.acquisitionMethod,
        acquired_at: observation.acquiredAt,
        status: observation.status,
        failure_reason: observation.failureReason,
        source_filename: observation.sourceFilename,
        source_size_bytes: observation.sourceSizeBytes,
        http_status: observation.httpStatus,
        redirect_outcome: observation.redirectOutcome,
        received_byte_size: observation.receivedByteSize,
        declared_media_type: observation.declaredMediaType,
        detected_media_type: observation.detectedMediaType,
        format_identification_status: observation.formatIdentificationStatus,
        format_identifier: observation.formatIdentifier,
        storage_key: observation.storageKey,
        pdf_page_count: observation.pdfPageCount,
        page_observations: toJson(observation.pageObservations),
        text_layer_status: observation.textLayerStatus,
        extraction_status: observation.extractionStatus,
        embedded_metadata: toJson(observation.embeddedMetadata),
        fixity_algorithm: observation.fixityAlgorithm,
        fixity_digest: observation.fixityDigest,
        fixity_context: observation.fixityContext,
        fixity_calculated_at: observation.fixityCalculatedAt,
        fixity_check_status: observation.fixityCheckStatus,
        fixity_comparison_detail: observation.fixityComparisonDetail,
        provenance_note: observation.provenanceNote,
        value_provenance: toJson(observation.valueProvenance),
        uncertainty_status: observation.uncertaintyStatus,
        visibility_state: observation.visibilityState,
      };

      const { data, error } = await supabase.from('source_metadata').insert(insert).select('id').single();
      if (error || !data) throw new Error(`Failed to record source metadata: ${error?.message ?? 'no row returned'}`);
      return data.id;
    },
  };
}

function toJson(value: unknown): Json | null {
  return value === undefined ? null : value as Json;
}
