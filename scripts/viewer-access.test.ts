import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveViewerAccess } from '../src/application/reader/viewer-access';
import { createViewerRolloutConfig } from '../src/application/reader/viewer-rollout';

const ready = {
  fallback: { label: 'Open PDF', url: '/zine.pdf' },
  manifest: { generationId: 'generation-1', pageCount: 1, pages: [{ generationId: 'generation-1', pageNumber: 1, imageUrl: '/page.webp', width: 100, height: 150 }] },
  publication: { id: 42, slug: 'canonical-zine', title: 'Canonical Zine' },
  status: 'ready' as const,
};

test('checks beta access against the canonical slug resolved from an alias', () => {
  const config = createViewerRolloutConfig({
    READER_BETA_ENABLED: 'true',
    READER_BETA_SLUGS: 'canonical-zine',
    READER_EMBED_ENABLED: 'true',
  });

  assert.deepEqual(resolveViewerAccess(ready, 'old-zine', config, 'embed'), {
    allowed: true,
    canonicalSlug: 'canonical-zine',
  });
});

test('keeps the normal reader and embed surfaces independently gated', () => {
  const config = createViewerRolloutConfig({
    READER_BETA_ALLOW_ALL: 'true',
    READER_BETA_ENABLED: 'true',
    READER_VIEWER_ENABLED: 'true',
  });

  assert.equal(resolveViewerAccess(ready, 'canonical-zine', config, 'reader').allowed, true);
  assert.equal(resolveViewerAccess(ready, 'canonical-zine', config, 'embed').allowed, false);
});
