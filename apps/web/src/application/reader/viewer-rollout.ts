import type { ViewerRolloutReadiness } from './viewer-rollout-types';

export type ViewerRolloutConfig = {
  allowAllPublications: boolean;
  betaEnabled: boolean;
  enabled: boolean;
  embedEnabled: boolean;
  betaSlugs: readonly string[];
  betaTokens: readonly string[];
  allowInsecureLocalOrigin: boolean;
  viewerOrigin: string;
};

export function createViewerRolloutConfig(env: Record<string, string | undefined>): ViewerRolloutConfig {
  return {
    allowAllPublications: env.READER_BETA_ALLOW_ALL === 'true',
    betaEnabled: env.READER_BETA_ENABLED === 'true',
    enabled: env.READER_VIEWER_ENABLED === 'true',
    embedEnabled: env.READER_EMBED_ENABLED === 'true',
    betaSlugs: (env.READER_BETA_SLUGS ?? '').split(',').map((slug) => slug.trim()).filter(Boolean),
    betaTokens: (env.READER_BETA_TOKENS ?? '').split(',').map((token) => token.trim()).filter(Boolean),
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
  if (config.betaEnabled && !config.allowAllPublications && config.betaSlugs.length === 0) {
    issues.push('selected-publication beta requires at least one beta slug');
  }
  if (config.allowAllPublications && !config.betaEnabled) {
    issues.push('allow-all cannot be active while the master beta gate is disabled');
  }
  return { issues, ready: issues.length === 0 };
}

export function isViewerPublicationAllowed(
  config: ViewerRolloutConfig,
  slug: string,
  surface: 'reader' | 'embed',
  betaToken?: string,
): boolean {
  if (!config.betaEnabled) return false;
  if (surface === 'reader' && !config.enabled) return false;
  if (surface === 'embed' && !config.embedEnabled) return false;
  const publicationAllowed = config.allowAllPublications || config.betaSlugs.includes(slug);
  const testerAllowed = surface !== 'embed' || config.betaTokens.length === 0
    || Boolean(betaToken && config.betaTokens.includes(betaToken));
  return publicationAllowed && testerAllowed;
}

export function createViewerUrl(
  config: ViewerRolloutConfig,
  slug: string,
  branding = false,
  surface: 'reader' | 'embed' = 'embed',
): string {
  const route = surface === 'reader' ? 'viewer' : 'embed';
  const url = new URL(`${config.viewerOrigin}/${route}/v1/${encodeURIComponent(slug)}`);
  if (branding) url.searchParams.set('branding', 'biblioteca');
  return url.toString();
}
