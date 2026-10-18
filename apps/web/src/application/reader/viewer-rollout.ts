import type { ViewerRolloutReadiness } from './viewer-rollout-types';
import type { ReaderDeliveryMode } from '@biblioteca-de-zines/reader';

export type ViewerRolloutConfig = {
  enabled: boolean;
  allowInsecureLocalOrigin: boolean;
  viewerOrigin: string;
};

export function createViewerRolloutConfig(env: Record<string, string | undefined>): ViewerRolloutConfig {
  return {
    enabled: env.READER_VIEWER_ENABLED === 'true',
    allowInsecureLocalOrigin: env.NODE_ENV === 'development',
    viewerOrigin: env.READER_VIEWER_ORIGIN ?? 'https://viewer.biblioteca-de-zines.com.br',
  };
}

export function validateViewerRolloutConfig(config: ViewerRolloutConfig): ViewerRolloutReadiness {
  const issues: string[] = [];
  try {
    const origin = new URL(config.viewerOrigin);
    const localOrigin = origin.hostname === 'localhost' || origin.hostname === '127.0.0.1';
    if ((!config.allowInsecureLocalOrigin && origin.protocol !== 'https:') || !origin.hostname || (origin.protocol !== 'https:' && !localOrigin)) {
      issues.push('viewer origin must use HTTPS');
    }
  } catch {
    issues.push('viewer origin must use HTTPS');
  }
  return { issues, ready: issues.length === 0 };
}

export function isViewerPublicationAllowed(config: ViewerRolloutConfig): boolean {
  return config.enabled;
}

export function createViewerUrl(
  config: ViewerRolloutConfig,
  slug: string,
  branding = false,
  surface: ReaderDeliveryMode = 'embed',
): string {
  const route = surface === 'standalone' ? 'viewer' : 'embed';
  const url = new URL(`${config.viewerOrigin}/${route}/v1/${encodeURIComponent(slug)}`);
  if (branding) url.searchParams.set('branding', 'biblioteca');
  return url.toString();
}
