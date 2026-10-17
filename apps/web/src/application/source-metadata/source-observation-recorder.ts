import { extractSourceObservation } from '@/domain/source-observation';
import type { SourceDocument } from '@/domain/source-document';
import type { FixityObservation, PdfSourceInspector } from '@/domain/source-observation-types';
import type { SourceMetadataObservation, SourceMetadataRepository } from './source-metadata-types';
import { mapSourceObservation } from './source-metadata-observation-mapper';
import type { SourceMetadataBatchSource } from './source-metadata-batch-types';

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
    await dependencies.repository.findLatestFixity(input.sourceUri),
  );
  const source: SourceMetadataBatchSource = { sourceId: `publication:${input.publicationId}`, publicationId: input.publicationId, submissionId: null, sourceUri: input.sourceUri };
  await dependencies.repository.create(mapSourceObservation(source, outcome, {
    method: input.acquisition?.method ?? 'unknown', acquiredAt: outcome.status === 'observed' ? outcome.observation.observedAt : outcome.observedAt,
    filename: input.acquisition?.filename ?? null, declaredSize: input.acquisition?.declaredSize ?? input.source?.buffer.byteLength ?? null,
    httpStatus: input.acquisition?.httpStatus ?? null, redirectOutcome: input.acquisition?.redirectCount === undefined ? null : `${input.acquisition.redirectCount} redirect(s)`,
    declaredMediaType: input.source?.mimeType ?? null,
  }, 'Observed from approved-publication source processing; values are not catalogue metadata.'));
}
