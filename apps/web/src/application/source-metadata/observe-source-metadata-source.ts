import { extractSourceObservation } from '@/domain/source-observation';
import { createSourceMetadataObservation } from './source-metadata-observation-factory';
import type { SourceMetadataBatchSource } from './source-metadata-batch-types';
import type { SourceMetadataAcquisition } from './source-metadata-observation-mapper';
import type { SourceMetadataRepository, SourceMetadataObservation } from './source-metadata-types';

export async function observeSourceMetadataSource(
  source: SourceMetadataBatchSource,
  dependencies: {
    repository: Pick<SourceMetadataRepository, 'findLatestFixity'>;
    download: (sourceUri: string) => Promise<{ buffer: Buffer; mimeType: string }>;
    inspect: Parameters<typeof extractSourceObservation>[1];
    clock?: () => Date;
  },
): Promise<SourceMetadataObservation> {
  const acquiredAt = (dependencies.clock ?? (() => new Date()))().toISOString();
  const acquisition: SourceMetadataAcquisition = {
    method: source.sourceUri.includes('drive.google.com') ? 'google-drive' : 'http',
    acquiredAt,
    filename: source.sourceUri.split('/').pop()?.split('?')[0] ?? null,
    declaredSize: null,
    httpStatus: null,
    redirectOutcome: null,
    declaredMediaType: null,
  };
  const priorFixity = await dependencies.repository.findLatestFixity(source.sourceUri);
  try {
    const downloaded = await dependencies.download(source.sourceUri);
    acquisition.declaredMediaType = downloaded.mimeType;
    acquisition.declaredSize = downloaded.buffer.byteLength;
    const outcome = await extractSourceObservation({
      source: downloaded,
      sourceUri: source.sourceUri,
      acquisition: { method: acquisition.method as 'http' | 'google-drive', status: 'acquired', filename: acquisition.filename ?? undefined, declaredSize: acquisition.declaredSize },
    }, dependencies.inspect, dependencies.clock, priorFixity);
    return createSourceMetadataObservation(source, outcome, acquisition);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Source acquisition failed';
    const status = message.match(/\b([1-5]\d{2})\b/);
    acquisition.httpStatus = status ? Number(status[1]) : null;
    const outcome = await extractSourceObservation({
      sourceUri: source.sourceUri,
      acquisition: { method: acquisition.method as 'http' | 'google-drive', status: 'unreachable', failureReason: message },
    }, dependencies.inspect, dependencies.clock, priorFixity);
    return createSourceMetadataObservation(source, outcome, acquisition);
  }
}
