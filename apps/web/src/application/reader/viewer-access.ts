import type { PublicReaderResponse } from '@biblioteca-de-zines/reader';
import { isViewerPublicationAllowed, type ViewerRolloutConfig } from './viewer-rollout';

export function resolveViewerAccess(
  result: PublicReaderResponse,
  requestedSlug: string,
  config: ViewerRolloutConfig,
) {
  const canonicalSlug = result.status === 'ready' ? result.publication.slug : result.publication?.slug ?? requestedSlug;
  return { allowed: isViewerPublicationAllowed(config), canonicalSlug };
}
