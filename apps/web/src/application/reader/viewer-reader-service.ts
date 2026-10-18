import { getPublicReaderZine } from './public-reader-service';
import type { PublicReaderRepository } from './public-reader-types';
import { resolveViewerAccess } from './viewer-access';
import type { ViewerRolloutConfig } from './viewer-rollout';
import type { ViewerReaderResult } from './viewer-reader-types';

export async function getViewerReader(
  repository: PublicReaderRepository,
  requestedSlug: string,
  rollout: ViewerRolloutConfig,
): Promise<ViewerReaderResult> {
  const reader = await getPublicReaderZine(repository, requestedSlug);
  if (!reader) return { status: 'not-found' };
  if (!resolveViewerAccess(reader, requestedSlug, rollout).allowed) {
    return { status: 'unavailable' };
  }
  return { reader, status: 'available' };
}
