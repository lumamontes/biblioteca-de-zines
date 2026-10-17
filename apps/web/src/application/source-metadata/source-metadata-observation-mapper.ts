import { randomUUID } from 'node:crypto';
import type { SourceObservationOutcome } from '@/domain/source-observation-types';
import type { SourceMetadataBatchSource } from './source-metadata-batch-types';
import type { FixityContext, SourceMetadataObservation } from './source-metadata-types';
import type { SourceMetadataAcquisition } from './source-metadata-contracts';

export function mapSourceObservation(
  source: SourceMetadataBatchSource,
  outcome: SourceObservationOutcome,
  acquisition: SourceMetadataAcquisition,
  provenanceNote: string,
): SourceMetadataObservation {
  const observedAt = outcome.status === 'observed' ? outcome.observation.observedAt : outcome.observedAt;
  const base = {
    observationId: `${source.sourceId}:${observedAt}:${randomUUID()}`,
    assetIdentity: source.sourceId,
    sourceObservationId: null,
    publicationId: source.publicationId,
    submissionId: source.submissionId,
    assetKind: 'source' as const,
    observedAt,
    extractorVersion: outcome.status === 'observed' ? outcome.observation.extractorVersion : outcome.extractorVersion,
    sourceUri: source.sourceUri,
    acquisitionMethod: acquisition.method,
    acquiredAt: acquisition.acquiredAt,
    sourceFilename: acquisition.filename,
    sourceSize: acquisition.declaredSize,
    httpStatus: acquisition.httpStatus,
    redirectOutcome: acquisition.redirectOutcome,
    provenanceNote,
    visibility: 'internal' as const,
  };

  if (outcome.status === 'failed') {
    return {
      ...base,
      status: outcome.reason,
      failureReason: outcome.message,
      receivedByteSize: acquisition.receivedByteSize,
      declaredMediaType: acquisition.declaredMediaType,
      detectedMediaType: acquisition.detectedMediaType ?? outcome.detectedMediaType,
      formatIdentificationStatus: outcome.formatIdentification,
      formatIdentifier: outcome.formatIdentifier,
      storageReference: null,
      pageCount: null,
      pages: [],
      textLayerStatus: 'not_applicable',
      textExtractionStatus: 'not_attempted',
      embeddedMetadata: null,
      fixity: outcome.fixity ? toFixity(outcome.fixity) : null,
      valueProvenance: { acquisition: 'source-supplied', detectedMediaType: 'system-observed', formatIdentificationStatus: 'system-observed', fixity: 'system-observed' },
      uncertaintyStatus: outcome.reason === 'unreachable' ? 'unknown' : 'failed',
    };
  }

  const observation = outcome.observation;
  return {
    ...base,
    status: 'observed',
    failureReason: null,
    receivedByteSize: observation.receivedByteSize,
    declaredMediaType: acquisition.declaredMediaType,
    detectedMediaType: acquisition.detectedMediaType ?? observation.mediaTypeDetected,
    formatIdentificationStatus: observation.formatIdentification,
    formatIdentifier: observation.formatIdentifier,
    storageReference: null,
    pageCount: observation.pdf.pageCount,
    pages: observation.pdf.pages,
    textLayerStatus: observation.pdf.textLayer.status === 'present' && observation.pdf.textLayer.pagesWithoutText > 0 ? 'partial' : observation.pdf.textLayer.status,
    textExtractionStatus: observation.pdf.textExtraction.status === 'complete' ? 'succeeded' : observation.pdf.textExtraction.status,
    embeddedMetadata: observation.pdf.embeddedMetadata,
    fixity: toFixity(observation.fixity),
    valueProvenance: observation.provenance.valueProvenance,
    uncertaintyStatus: observation.provenance.uncertaintyStatus,
  };
}

function toFixity(fixity: { algorithm: string; digest: string; context: string; calculatedAt: string; checkStatus: 'not_compared' | 'matched' | 'mismatch'; comparisonDetail: string | null }): SourceMetadataObservation['fixity'] {
  return { ...fixity, algorithm: fixity.algorithm.toLowerCase() as 'sha-256', context: fixity.context as FixityContext };
}
