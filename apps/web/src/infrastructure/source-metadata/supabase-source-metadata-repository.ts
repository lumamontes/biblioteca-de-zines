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
        library_zine_id: observation.publicationId,
        form_upload_id: observation.submissionId,
        source_reference: observation.sourceUri,
        asset_kind: observation.assetKind,
        observed_at: observation.observedAt,
        extractor_version: observation.extractorVersion,
        source_uri: observation.sourceUri,
        acquisition_method: observation.acquisitionMethod,
        acquired_at: observation.acquiredAt,
        status: observation.status,
        failure_reason: observation.failureReason,
        source_filename: observation.sourceFilename,
        source_size_bytes: observation.sourceSize,
        http_status: observation.httpStatus,
        redirect_outcome: observation.redirectOutcome,
        received_byte_size: observation.receivedByteSize,
        declared_media_type: observation.declaredMediaType,
        detected_media_type: observation.detectedMediaType,
        format_identification_status: observation.formatIdentificationStatus,
        format_identifier: observation.formatIdentifier,
        storage_key: observation.storageReference,
        pdf_page_count: observation.pageCount,
        page_observations: toJson(observation.pages),
        text_layer_status: observation.textLayerStatus,
        extraction_status: observation.textExtractionStatus === 'succeeded'
          ? 'completed'
          : observation.textExtractionStatus === 'failed' ? 'failed' : 'not_attempted',
        embedded_metadata: toJson(observation.embeddedMetadata),
        fixity_algorithm: observation.fixity?.algorithm,
        fixity_digest: observation.fixity?.digest,
        fixity_context: observation.fixity?.context,
        fixity_calculated_at: observation.fixity?.calculatedAt,
        fixity_check_status: observation.fixity?.checkStatus,
        fixity_comparison_detail: observation.fixity?.comparisonDetail,
        provenance_note: observation.provenanceNote,
        value_provenance: toJson(observation.valueProvenance),
        uncertainty_status: observation.uncertaintyStatus,
        visibility_state: observation.visibility,
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
