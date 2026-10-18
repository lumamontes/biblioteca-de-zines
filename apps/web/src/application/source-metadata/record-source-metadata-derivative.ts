import type { SourceMetadataDerivative } from './source-metadata-contracts';
import type { SourceMetadataObservation, SourceMetadataRepository } from './source-metadata-types';

export async function recordSourceMetadataDerivative(
  repository: Pick<SourceMetadataRepository, 'create'>,
  derivative: SourceMetadataDerivative,
): Promise<number> {
  const observation: SourceMetadataObservation = {
    observationId: derivative.observationId,
    assetIdentity: derivative.assetIdentity,
    sourceObservationId: derivative.sourceObservationId,
    publicationId: null,
    submissionId: null,
    assetKind: derivative.assetKind,
    observedAt: derivative.observedAt,
    extractorVersion: 'asset-derivative/v1',
    sourceUri: null,
    acquisitionMethod: 'derived',
    acquiredAt: null,
    status: 'observed',
    failureReason: null,
    sourceFilename: null,
    sourceSize: null,
    httpStatus: null,
    redirectOutcome: null,
    receivedByteSize: derivative.byteSize,
    declaredMediaType: null,
    detectedMediaType: derivative.mediaType,
    formatIdentificationStatus: 'identified',
    formatIdentifier: derivative.mediaType,
    storageReference: derivative.storageReference,
    pageCount: null,
    pages: [],
    textLayerStatus: 'not_applicable',
    textExtractionStatus: 'not_applicable',
    embeddedMetadata: null,
    fixity: null,
    provenanceNote: derivative.provenanceNote,
    valueProvenance: { assetIdentity: 'system-observed', sourceObservationId: 'system-observed', storageReference: 'system-observed' },
    uncertaintyStatus: 'complete',
    visibility: 'internal',
  };
  return repository.create(observation);
}
