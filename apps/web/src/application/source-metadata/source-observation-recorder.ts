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
  const outcome = await extractSourceObservation(
    { source: input.source, sourceUri: input.sourceUri, acquisition: input.acquisition },
    dependencies.inspectPdf,
    dependencies.clock,
    await dependencies.repository.findLatestFixity(input.sourceUri),
  );
  const source: SourceMetadataBatchSource = { sourceId: `publication:${input.publicationId}`, publicationId: input.publicationId, submissionId: null, sourceUri: input.sourceUri };
  const acquisition: SourceMetadataAcquisition = {
    method: input.acquisition?.method ?? 'unknown', acquiredAt: input.acquisition?.acquiredAt ?? input.source?.acquisition?.acquiredAt ?? null,
    filename: input.acquisition?.filename ?? input.source?.acquisition?.filename ?? null, declaredSize: input.acquisition?.declaredSize ?? input.source?.acquisition?.declaredSize ?? null,
    receivedByteSize: input.acquisition?.receivedByteSize ?? input.source?.acquisition?.receivedByteSize ?? (input.source ? input.source.buffer.byteLength : null),
    httpStatus: input.acquisition?.httpStatus ?? null, redirectOutcome: input.acquisition?.redirectCount === undefined ? null : `${input.acquisition.redirectCount} redirect(s)`,
    declaredMediaType: input.acquisition?.declaredMediaType ?? input.source?.acquisition?.declaredMediaType ?? null,
    detectedMediaType: input.acquisition?.detectedMediaType ?? input.source?.acquisition?.detectedMediaType ?? null,
  };
  return dependencies.repository.create(mapSourceObservation(source, outcome, acquisition, 'Observed from approved-publication source processing; values are not catalogue metadata.'));
}
