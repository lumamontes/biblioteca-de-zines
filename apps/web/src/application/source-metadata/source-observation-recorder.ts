import { extractSourceObservation } from '@/domain/source-observation';
import type { SourceDocument } from '@/domain/source-document';
import type { FixityObservation, PdfSourceInspector } from '@/domain/source-observation-types';
import type { SourceMetadataObservation, SourceMetadataRepository } from './source-metadata-types';
import { mapSourceObservation } from './source-metadata-observation-mapper';
import type { SourceMetadataBatchSource } from './source-metadata-batch-types';
import type { SourceMetadataAcquisition } from './source-metadata-contracts';

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
): Promise<number> {
  const acquisitionMetadata = {
    ...input.source?.acquisition,
    ...input.acquisition,
  };
  const extractionAcquisition = {
    ...acquisitionMetadata,
    filename: acquisitionMetadata.filename ?? undefined,
    declaredSize: acquisitionMetadata.declaredSize ?? undefined,
    acquiredAt: acquisitionMetadata.acquiredAt ?? undefined,
    receivedByteSize: acquisitionMetadata.receivedByteSize ?? undefined,
    httpStatus: acquisitionMetadata.httpStatus ?? undefined,
    declaredMediaType: acquisitionMetadata.declaredMediaType ?? undefined,
    detectedMediaType: acquisitionMetadata.detectedMediaType ?? undefined,
    redirectOutcome: acquisitionMetadata.redirectOutcome ?? undefined,
  };
  const outcome = await extractSourceObservation(
    { source: input.source, sourceUri: input.sourceUri, acquisition: extractionAcquisition },
    dependencies.inspectPdf,
    dependencies.clock,
    await dependencies.repository.findLatestFixity(input.sourceUri),
  );
  const source: SourceMetadataBatchSource = { sourceId: `publication:${input.publicationId}`, publicationId: input.publicationId, submissionId: null, sourceUri: input.sourceUri };
  const acquisition: SourceMetadataAcquisition = {
    method: acquisitionMetadata.method ?? 'unknown', acquiredAt: acquisitionMetadata.acquiredAt ?? null,
    filename: acquisitionMetadata.filename ?? null, declaredSize: acquisitionMetadata.declaredSize ?? null,
    receivedByteSize: acquisitionMetadata.receivedByteSize ?? (input.source ? input.source.buffer.byteLength : null),
    httpStatus: acquisitionMetadata.httpStatus ?? null, redirectOutcome: acquisitionMetadata.redirectOutcome ?? (acquisitionMetadata.redirectCount === undefined ? null : `${acquisitionMetadata.redirectCount} redirect(s)`),
    declaredMediaType: acquisitionMetadata.declaredMediaType ?? null,
    detectedMediaType: acquisitionMetadata.detectedMediaType ?? null,
  };
  return dependencies.repository.create(mapSourceObservation(source, outcome, acquisition, 'Observed from approved-publication source processing; values are not catalogue metadata.'));
}
