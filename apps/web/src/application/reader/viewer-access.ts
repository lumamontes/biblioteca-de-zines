import type { PublicReaderResponse } from '@biblioteca-de-zines/reader';
import type { ReaderDeliveryMode } from '@biblioteca-de-zines/reader';
import { isViewerPublicationAllowed, type ViewerRolloutConfig } from './viewer-rollout';

export function resolveViewerAccess(
  result: PublicReaderResponse,
  requestedSlug: string,
  config: ViewerRolloutConfig,
  surface: ReaderDeliveryMode,
  betaToken?: string,
) {
  const canonicalSlug = result.status === 'ready' ? result.publication.slug : result.publication?.slug ?? requestedSlug;
  return { allowed: isViewerPublicationAllowed(config, canonicalSlug, surface, betaToken), canonicalSlug };
}
