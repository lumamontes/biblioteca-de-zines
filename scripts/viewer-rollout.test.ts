import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createViewerRolloutConfig,
  createViewerUrl,
  isViewerPublicationAllowed,
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
    READER_BETA_TOKENS: 'tester-1',
    READER_EMBED_ENABLED: 'true',
  });

  assert.equal(isViewerPublicationAllowed(config, 'public-zine', 'embed'), false);
  assert.equal(isViewerPublicationAllowed(config, 'public-zine', 'embed', 'tester-1'), true);
});
