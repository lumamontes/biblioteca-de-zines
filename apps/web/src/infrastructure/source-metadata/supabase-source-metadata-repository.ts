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
        observation_id: observation.observationId,
        asset_identity: observation.assetIdentity,
        source_observation_id: observation.sourceObservationId,
        library_zine_id: observation.publicationId,
        form_upload_id: observation.submissionId,
        source_reference: observation.sourceUri ?? observation.assetIdentity,
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
          : observation.textExtractionStatus === 'partial' ? 'partial'
            : observation.textExtractionStatus === 'failed' ? 'failed'
              : observation.textExtractionStatus === 'not_applicable' ? 'not_applicable' : 'not_attempted',
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
    async findLatestFixity(sourceUri) {
      const { data, error } = await supabase.from('source_metadata')
        .select('fixity_algorithm, fixity_digest, fixity_context')
        .eq('source_uri', sourceUri).not('fixity_digest', 'is', null)
        .order('observed_at', { ascending: false }).limit(1).maybeSingle();
      if (error) throw new Error(`Failed to read prior source fixity: ${error.message}`);
      return data?.fixity_digest && data.fixity_algorithm && data.fixity_context
        ? { algorithm: data.fixity_algorithm, digest: data.fixity_digest, context: data.fixity_context }
        : null;
    },
  };
}

function toJson(value: unknown): Json | null {
  return value === undefined ? null : value as Json;
}
