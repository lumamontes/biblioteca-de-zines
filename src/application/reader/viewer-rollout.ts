export type ViewerRolloutConfig = {
  enabled: boolean;
  embedEnabled: boolean;
  betaSlugs: readonly string[];
  betaTokens: readonly string[];
  viewerOrigin: string;
};

export function createViewerRolloutConfig(env: Record<string, string | undefined>): ViewerRolloutConfig {
  return {
    enabled: env.READER_VIEWER_ENABLED === 'true',
    embedEnabled: env.READER_EMBED_ENABLED === 'true',
    betaSlugs: (env.READER_BETA_SLUGS ?? '')
      .split(',')
      .map((slug) => slug.trim())
      .filter(Boolean),
    betaTokens: (env.READER_BETA_TOKENS ?? '')
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean),
    viewerOrigin: env.READER_VIEWER_ORIGIN ?? 'https://viewer.biblioteca-de-zines.com.br',
  };
}

export function isViewerPublicationAllowed(
  config: ViewerRolloutConfig,
  slug: string,
  surface: 'reader' | 'embed',
  betaToken?: string,
): boolean {
  if (surface === 'reader' && !config.enabled) return false;
  if (surface === 'embed' && !config.embedEnabled) return false;
  const publicationAllowed = config.betaSlugs.length === 0 || config.betaSlugs.includes(slug);
  const testerAllowed = config.betaTokens.length === 0 || Boolean(betaToken && config.betaTokens.includes(betaToken));
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
