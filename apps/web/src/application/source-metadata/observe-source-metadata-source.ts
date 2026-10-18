import { extractSourceObservation } from '@/domain/source-observation';
import type { SourceDocument } from '@/domain/source-document';
import { createSourceMetadataObservation } from './source-metadata-observation-factory';
import type { SourceMetadataBatchSource } from './source-metadata-batch-types';
import type { SourceMetadataAcquisition } from './source-metadata-contracts';
import type { SourceMetadataRepository, SourceMetadataObservation } from './source-metadata-types';

export async function observeSourceMetadataSource(
  source: SourceMetadataBatchSource,
  dependencies: {
    repository: Pick<SourceMetadataRepository, 'findLatestFixity'>;
    download: (sourceUri: string) => Promise<SourceDocument>;
    inspect: Parameters<typeof extractSourceObservation>[1];
    clock?: () => Date;
  },
): Promise<SourceMetadataObservation> {
  const acquisition: SourceMetadataAcquisition = {
    method: source.sourceUri.includes('drive.google.com') ? 'google-drive' : 'http',
    acquiredAt: null,
    filename: null,
    declaredSize: null,
    receivedByteSize: null,
    httpStatus: null,
    redirectOutcome: null,
    declaredMediaType: null,
    detectedMediaType: null,
  };
  const priorFixity = await dependencies.repository.findLatestFixity(source.sourceUri);
  try {
    const downloaded = await dependencies.download(source.sourceUri);
    Object.assign(acquisition, downloaded.acquisition ?? {
      acquiredAt: null,
      filename: null,
      declaredSize: null,
      receivedByteSize: downloaded.buffer.byteLength,
      httpStatus: null,
      redirectOutcome: null,
      declaredMediaType: downloaded.mimeType,
      detectedMediaType: null,
    });
    const outcome = await extractSourceObservation({
      source: downloaded,
      sourceUri: source.sourceUri,
      acquisition: { method: acquisition.method as 'http' | 'google-drive', status: 'acquired', filename: acquisition.filename ?? undefined, declaredSize: acquisition.declaredSize ?? undefined, acquiredAt: acquisition.acquiredAt ?? undefined, receivedByteSize: acquisition.receivedByteSize ?? undefined, declaredMediaType: acquisition.declaredMediaType ?? undefined, detectedMediaType: acquisition.detectedMediaType ?? undefined, httpStatus: acquisition.httpStatus ?? undefined, redirectOutcome: acquisition.redirectOutcome ?? undefined },
    }, dependencies.inspect, dependencies.clock, priorFixity);
    return createSourceMetadataObservation(source, outcome, acquisition);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Source acquisition failed';
    const downloadedAcquisition = error && typeof error === 'object' && 'acquisition' in error ? error.acquisition : null;
    if (downloadedAcquisition && typeof downloadedAcquisition === 'object') Object.assign(acquisition, downloadedAcquisition);
    const status = message.match(/\b([1-5]\d{2})\b/);
    acquisition.httpStatus = status ? Number(status[1]) : null;
    acquisition.acquiredAt ??= (dependencies.clock ?? (() => new Date()))().toISOString();
    const outcome = await extractSourceObservation({
      sourceUri: source.sourceUri,
      acquisition: { method: acquisition.method as 'http' | 'google-drive', status: 'unreachable', failureReason: message },
    }, dependencies.inspect, dependencies.clock, priorFixity);
    return createSourceMetadataObservation(source, outcome, acquisition);
  }
}
