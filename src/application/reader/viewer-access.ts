import type { PublicReaderResult } from './public-reader-types';
import { isViewerPublicationAllowed, type ViewerRolloutConfig } from './viewer-rollout';

export function resolveViewerAccess(
  result: PublicReaderResult,
  requestedSlug: string,
  config: ViewerRolloutConfig,
  surface: 'reader' | 'embed',
  betaToken?: string,
) {
  const canonicalSlug = result.status === 'ready'
    ? result.publication.slug
    : result.publication?.slug ?? requestedSlug;
  return {
    allowed: isViewerPublicationAllowed(config, canonicalSlug, surface, betaToken),
    canonicalSlug,
  };
}
