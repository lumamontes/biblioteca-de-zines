import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createViewerRolloutConfig,
  createViewerUrl,
  isViewerPublicationAllowed,
  validateViewerRolloutConfig,
} from '../src/application/reader/viewer-rollout';

test('parses disabled viewer rollout by default', () => {
  const config = createViewerRolloutConfig({});

  assert.equal(config.enabled, false);
  assert.equal(config.embedEnabled, false);
  assert.deepEqual(config.betaTokens, []);
  assert.equal(isViewerPublicationAllowed(config, 'public-zine', 'reader'), false);
  assert.equal(isViewerPublicationAllowed(config, 'public-zine', 'embed'), false);
});

test('allows configured beta publications on each enabled surface', () => {
  const config = createViewerRolloutConfig({
    READER_BETA_ENABLED: 'true',
    READER_BETA_SLUGS: 'first-zine, second-zine',
    READER_EMBED_ENABLED: 'true',
    READER_VIEWER_ENABLED: 'true',
  });

  assert.equal(isViewerPublicationAllowed(config, 'first-zine', 'reader'), true);
  assert.equal(isViewerPublicationAllowed(config, 'first-zine', 'embed'), true);
  assert.equal(isViewerPublicationAllowed(config, 'other-zine', 'reader'), false);
});

test('creates versioned viewer URLs without treating branding as access', () => {
  const config = createViewerRolloutConfig({
    READER_VIEWER_ORIGIN: 'https://viewer.example.test',
  });

  assert.equal(
    createViewerUrl(config, 'a zine', true),
    'https://viewer.example.test/embed/v1/a%20zine?branding=biblioteca',
  );
});

test('requires a configured beta token when tester gating is enabled', () => {
  const config = createViewerRolloutConfig({
    READER_BETA_ALLOW_ALL: 'true',
    READER_BETA_ENABLED: 'true',
    READER_BETA_TOKENS: 'tester-1',
    READER_EMBED_ENABLED: 'true',
    READER_VIEWER_ENABLED: 'true',
  });

  assert.equal(isViewerPublicationAllowed(config, 'public-zine', 'embed'), false);
  assert.equal(isViewerPublicationAllowed(config, 'public-zine', 'embed', 'tester-1'), true);
  assert.equal(isViewerPublicationAllowed(config, 'public-zine', 'reader'), true);
});

test('keeps both surfaces unavailable until the beta gate is explicitly enabled', () => {
  const config = createViewerRolloutConfig({
    READER_EMBED_ENABLED: 'true',
    READER_VIEWER_ENABLED: 'true',
  });

  assert.equal(isViewerPublicationAllowed(config, 'public-zine', 'reader'), false);
  assert.equal(isViewerPublicationAllowed(config, 'public-zine', 'embed'), false);
});

test('fails closed when beta is enabled without a publication allowlist', () => {
  const config = createViewerRolloutConfig({
    READER_BETA_ENABLED: 'true',
    READER_EMBED_ENABLED: 'true',
  });

  assert.equal(isViewerPublicationAllowed(config, 'public-zine', 'embed'), false);
});

test('validates selected-publication rollout configuration before enabling beta', () => {
  const config = createViewerRolloutConfig({
    READER_BETA_ENABLED: 'true',
    READER_VIEWER_ORIGIN: 'http://viewer.example',
  });
  const readiness = validateViewerRolloutConfig(config);
  assert.equal(readiness.ready, false);
  assert.ok(readiness.issues.includes('viewer origin must use HTTPS'));
  assert.ok(readiness.issues.includes('selected-publication beta requires at least one beta slug'));
});

test('rejects malformed HTTPS viewer origins', () => {
  const config = createViewerRolloutConfig({ READER_VIEWER_ORIGIN: 'https://' });
  assert.equal(validateViewerRolloutConfig(config).ready, false);
});
