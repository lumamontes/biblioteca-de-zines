import type { PublicReaderResult } from './public-reader-types';
export type PublicReaderApiResponse = PublicReaderResult;
export function serializePublicReaderResult(result: PublicReaderResult): PublicReaderApiResponse {
  return result.status === 'ready'
    ? { status: result.status, publication: result.publication, manifest: result.manifest, fallback: result.fallback }
    : { status: result.status, publication: result.publication, reason: result.reason, fallback: result.fallback };
}
