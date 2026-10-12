import type { PublicReaderResult } from './public-reader-types';

export type PublicReaderApiResponse =
  | Extract<PublicReaderResult, { status: 'ready' }>
  | Extract<PublicReaderResult, { status: 'fallback' }>;

export function serializePublicReaderResult(result: PublicReaderResult): PublicReaderApiResponse {
  if (result.status === 'fallback') {
    return {
      fallback: result.fallback,
      ...(result.publication ? { publication: result.publication } : {}),
      reason: result.reason,
      status: result.status,
    };
  }

  return {
    fallback: result.fallback,
    manifest: result.manifest,
    publication: result.publication,
    status: result.status,
  };
}
