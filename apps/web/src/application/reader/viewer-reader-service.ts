import { getPublicReaderPublication } from './public-reader-service';
import { serializePublicReaderResult } from './public-reader-api';
import type { PublicReaderRepository } from './public-reader-types';
import { resolveViewerAccess } from './viewer-access';
import type { ViewerRolloutConfig } from './viewer-rollout';
import type { ViewerReaderResult } from './viewer-reader-types';

export async function getViewerReader(
  repository: PublicReaderRepository,
  requestedSlug: string,
  rollout: ViewerRolloutConfig,
  surface: 'reader' | 'embed',
  betaToken?: string,
): Promise<ViewerReaderResult> {
  const reader = await getPublicReaderPublication(repository, requestedSlug);
  if (!reader) return { status: 'not-found' };
  if (!resolveViewerAccess(reader, requestedSlug, rollout, surface, betaToken).allowed) {
    return { status: 'unavailable' };
  }
  return { reader: serializePublicReaderResult(reader), status: 'available' };
}
