import { detectFileTypeFromBuffer } from '@/utils/file-type-detection';
import { extractSourceObservation } from '@/domain/source-observation';
import type { SourceDocument } from '@/domain/source-document';
import type { FixityObservation, PdfSourceInspector } from '@/domain/source-observation-types';
import type { SourceMetadataObservation, SourceMetadataRepository } from './source-metadata-types';

export type SourceObservationRecordingInput = {
  publicationId: number;
  sourceUri: string;
  source?: SourceDocument;
  acquisition?: Parameters<typeof extractSourceObservation>[0]['acquisition'];
};

export type SourceObservationRecordingDependencies = {
  inspectPdf: PdfSourceInspector;
  repository: SourceMetadataRepository;
  clock?: () => Date;
};

export async function recordSourceObservation(
  input: SourceObservationRecordingInput,
  dependencies: SourceObservationRecordingDependencies,
): Promise<void> {
  const outcome = await extractSourceObservation(
    { source: input.source, sourceUri: input.sourceUri, acquisition: input.acquisition },
    dependencies.inspectPdf,
    dependencies.clock,
  );
  await dependencies.repository.create(toMetadataObservation(input, outcome));
}

function toMetadataObservation(
  input: SourceObservationRecordingInput,
  outcome: Awaited<ReturnType<typeof extractSourceObservation>>,
): SourceMetadataObservation {
  const observedAt = outcome.status === 'observed' ? outcome.observation.observedAt : outcome.observedAt;
  const source = input.source;
  const acquisition = input.acquisition;
  const base = {
    observationId: `${input.publicationId}:${observedAt}`,
    publicationId: input.publicationId,
    submissionId: null,
    assetKind: 'source' as const,
    observedAt,
    extractorVersion: outcome.status === 'observed' ? outcome.observation.extractorVersion : outcome.extractorVersion,
    sourceUri: input.sourceUri,
    acquisitionMethod: acquisition?.method ?? 'unknown',
    acquiredAt: observedAt,
    sourceFilename: acquisition?.filename ?? null,
    sourceSize: acquisition?.declaredSize ?? null,
    httpStatus: acquisition?.httpStatus ?? null,
    redirectOutcome: acquisition?.redirectCount === undefined ? null : `${acquisition.redirectCount} redirect(s)`,
    provenanceNote: 'Observed from approved-publication source processing; values are not catalogue metadata.',
    visibility: 'internal' as const,
  };

  if (outcome.status === 'failed') {
    const detectedMediaType = source ? detectFileTypeFromBuffer(source.buffer).mimeType : null;
    return {
      ...base,
      status: outcome.reason,
      failureReason: outcome.message,
      receivedByteSize: source?.buffer.byteLength ?? null,
      declaredMediaType: source?.mimeType ?? null,
      detectedMediaType,
      formatIdentificationStatus: source ? outcome.reason === 'not_pdf' ? 'identified' : 'unidentified' : 'not_attempted',
      formatIdentifier: outcome.reason === 'not_pdf' ? detectedMediaType : null,
      storageReference: null,
      pageCount: null,
      pages: [],
      textLayerStatus: 'not_applicable',
      textExtractionStatus: 'not_attempted',
      embeddedMetadata: null,
      fixity: outcome.fixity ? toFixity(outcome.fixity) : null,
    };
  }

  const observation = outcome.observation;
  return {
    ...base,
    status: 'observed',
    failureReason: null,
    receivedByteSize: observation.receivedByteSize,
    declaredMediaType: observation.mediaTypeDeclared,
    detectedMediaType: observation.mediaTypeDetected,
    formatIdentificationStatus: observation.formatIdentification,
    formatIdentifier: observation.formatIdentifier,
    storageReference: null,
    pageCount: observation.pdf.pageCount,
    pages: observation.pdf.pages,
    textLayerStatus: observation.pdf.textLayer.status === 'present'
      ? observation.pdf.textLayer.pagesWithoutText > 0 ? 'partial' : 'present'
      : observation.pdf.textLayer.status,
    textExtractionStatus: observation.pdf.textExtraction.status === 'complete' ? 'succeeded'
      : observation.pdf.textExtraction.status === 'not_attempted' ? 'not_attempted' : 'failed',
    embeddedMetadata: observation.pdf.embeddedMetadata,
    fixity: toFixity(observation.fixity),
  };
}

function toFixity(fixity: FixityObservation): SourceMetadataObservation['fixity'] {
  return {
    algorithm: fixity.algorithm.toLowerCase(),
    digest: fixity.digest,
    context: fixity.context,
    calculatedAt: fixity.calculatedAt,
    checkStatus: fixity.checkStatus,
    comparisonDetail: fixity.comparisonDetail,
  };
}
