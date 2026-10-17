import type { SourceObservationOutcome } from '@/domain/source-observation-types';
import type { SourceMetadataBatchSource } from './source-metadata-batch-types';
import type { SourceMetadataObservation } from './source-metadata-types';

type Acquisition = {
  method: string;
  acquiredAt: string;
  filename: string | null;
  declaredSize: number | null;
  httpStatus: number | null;
  redirectOutcome: string | null;
  declaredMediaType: string | null;
};

export function createSourceMetadataObservation(
  source: SourceMetadataBatchSource,
  outcome: SourceObservationOutcome,
  acquisition: Acquisition,
): SourceMetadataObservation {
  const observedAt = outcome.status === 'observed' ? outcome.observation.observedAt : outcome.observedAt;
  const extractorVersion = outcome.status === 'observed'
    ? outcome.observation.extractorVersion
    : outcome.extractorVersion;
  const base = {
    observationId: `${source.sourceId}:${observedAt}`,
    publicationId: source.publicationId,
    submissionId: source.submissionId,
    assetKind: 'source' as const,
    observedAt,
    extractorVersion,
    sourceUri: source.sourceUri,
    acquisitionMethod: acquisition.method,
    acquiredAt: acquisition.acquiredAt,
    sourceFilename: acquisition.filename,
    sourceSize: acquisition.declaredSize,
    httpStatus: acquisition.httpStatus,
    redirectOutcome: acquisition.redirectOutcome,
    declaredMediaType: acquisition.declaredMediaType,
    storageReference: null,
    provenanceNote: 'Observed from an existing source during batch inventory; values are not catalogue metadata.',
    visibility: 'internal' as const,
  };

  if (outcome.status === 'failed') {
    return {
      ...base,
      status: outcome.reason,
      failureReason: outcome.message,
      receivedByteSize: outcome.fixity ? acquisition.declaredSize : null,
      detectedMediaType: null,
      formatIdentificationStatus: 'not_attempted',
      formatIdentifier: null,
      pageCount: null,
      pages: [],
      textLayerStatus: 'not_applicable',
      textExtractionStatus: 'not_attempted',
      embeddedMetadata: null,
      fixity: outcome.fixity ? {
        ...outcome.fixity,
        algorithm: outcome.fixity.algorithm.toLowerCase() as 'sha-256',
      } : null,
    };
  }

  const observation = outcome.observation;
  return {
    ...base,
    status: 'observed',
    failureReason: null,
    receivedByteSize: observation.receivedByteSize,
    detectedMediaType: observation.mediaTypeDetected,
    formatIdentificationStatus: observation.formatIdentification,
    formatIdentifier: observation.formatIdentifier,
    pageCount: observation.pdf.pageCount,
    pages: observation.pdf.pages,
    textLayerStatus: observation.pdf.textLayer.status === 'present'
      && observation.pdf.textLayer.pagesWithoutText > 0 ? 'partial' : observation.pdf.textLayer.status,
    textExtractionStatus: observation.pdf.textExtraction.status === 'complete'
      ? 'succeeded' : observation.pdf.textExtraction.status === 'partial' ? 'failed' : observation.pdf.textExtraction.status,
    embeddedMetadata: observation.pdf.embeddedMetadata,
    fixity: {
      ...observation.fixity,
      algorithm: observation.fixity.algorithm.toLowerCase() as 'sha-256',
    },
  };
}
