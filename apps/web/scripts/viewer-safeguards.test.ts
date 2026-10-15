import assert from 'node:assert/strict';
import test from 'node:test';
import { isViewerEvent } from '@/application/reader/viewer-events';
import { resolveViewerAccess } from '@/application/reader/viewer-access';
import { createViewerRolloutConfig, validateViewerRolloutConfig } from '@/application/reader/viewer-rollout';
import { createViewerPreflightHeaders } from '@/application/reader/viewer-cors';
import { getViewerReader } from '@/application/reader/viewer-reader-service';
import { createViewerTrafficGuard } from '@/infrastructure/reader/viewer-traffic-guard';
import { IMMUTABLE_DERIVATIVE_CACHE_CONTROL } from '@/infrastructure/storage/cache-policy';
import { evaluateViewerBeta, parseBetaEvaluationInput } from '@/application/reader/beta-evaluation';

const ready = {
  fallback: { label: 'Open PDF', url: '/zine.pdf' },
  manifest: { generationId: 'generation-1', pageCount: 1, pages: [{ generationId: 'generation-1', pageNumber: 1, imageUrl: '/page.webp', width: 100, height: 150 }] },
  publication: { id: 42, slug: 'canonical-zine', title: 'Canonical Zine' },
  status: 'ready' as const,
};

test('uses the canonical publication slug and keeps surfaces independently gated', () => {
  const config = createViewerRolloutConfig({ READER_BETA_ENABLED: 'true', READER_BETA_SLUGS: 'canonical-zine', READER_EMBED_ENABLED: 'true' });
  assert.equal(resolveViewerAccess(ready, 'old-zine', config, 'embed').allowed, true);
  assert.equal(resolveViewerAccess(ready, 'old-zine', config, 'reader').allowed, false);
});

test('returns only the canonical, access-filtered reader response for an alias', async () => {
  const config = createViewerRolloutConfig({
    READER_BETA_ALLOW_ALL: 'false',
    READER_BETA_ENABLED: 'true',
    READER_BETA_SLUGS: 'canonical-zine',
    READER_VIEWER_ENABLED: 'true',
  });
  const result = await getViewerReader({
    findPublicBySlug: async () => ({
      activePageGeneration: 'generation-1',
      id: 42,
      importStatus: 'completed',
      pages: [{ generationId: 'generation-1', pageNumber: 1, imageUrl: '/page.webp', width: 100, height: 150 }],
      pdfUrl: '/zine.pdf',
      slug: 'canonical-zine',
      title: 'Canonical Zine',
      totalPages: 1,
    }),
  }, 'old-zine', config, 'reader');

  assert.equal(result.status, 'available');
  if (result.status === 'available') {
    assert.equal(result.reader.status, 'ready');
    assert.equal(result.reader.publication.slug, 'canonical-zine');
    assert.deepEqual(Object.keys(result.reader).sort(), ['fallback', 'manifest', 'publication', 'status']);
  }
});

test('only the configured viewer origin receives CORS permission', () => {
  const allowed = createViewerPreflightHeaders('https://viewer.example.test', 'https://viewer.example.test');
  const denied = createViewerPreflightHeaders('https://attacker.example.test', 'https://viewer.example.test');
  assert.equal(allowed.get('Access-Control-Allow-Origin'), 'https://viewer.example.test');
  assert.equal(denied.has('Access-Control-Allow-Origin'), false);
  assert.equal(allowed.get('Access-Control-Allow-Headers'), 'Content-Type, X-Reader-Beta-Token');
});

test('rejects unsafe rollout configuration and preserves immutable derivative policy', () => {
  const config = createViewerRolloutConfig({ READER_BETA_ENABLED: 'true', READER_VIEWER_ORIGIN: 'http://viewer.example.test' });
  assert.equal(validateViewerRolloutConfig(config).ready, false);
  assert.equal(IMMUTABLE_DERIVATIVE_CACHE_CONTROL, 'public, max-age=31536000, immutable');
});

test('accepts only bounded public-reader telemetry', () => {
  assert.equal(isViewerEvent({ slug: 'zine', surface: 'embed', type: 'ready' }), true);
  assert.equal(isViewerEvent({
    slug: 'zine', surface: 'embed', type: 'ready', requestCount: 4,
    cacheBehavior: 'hit', bundleBytes: 100, derivativeBandwidthBytes: 200, memoryBytes: 300,
  }), true);
  assert.equal(isViewerEvent({ slug: 'zine', surface: 'embed', type: 'request-database' }), false);
  assert.equal(isViewerEvent({ slug: 'zine', surface: 'embed', type: 'page-load', durationMs: -1 }), false);
  assert.equal(isViewerEvent({ slug: 'zine', surface: 'embed', type: 'ready', memoryBytes: 10_000_000_001 }), false);
});

test('limits traffic per key and resets after the window', () => {
  let now = 1000;
  const guard = createViewerTrafficGuard({ limit: 1, windowMs: 100, now: () => now });
  assert.deepEqual(guard.check('viewer-a'), { allowed: true, remaining: 0 });
  assert.deepEqual(guard.check('viewer-a'), { allowed: false, remaining: 0 });
  now += 100;
  assert.deepEqual(guard.check('viewer-a'), { allowed: true, remaining: 0 });
});

test('pauses beta rollout when cohort evidence or reviews are incomplete', () => {
  const input = parseBetaEvaluationInput({
    deployment: { url: 'https://viewer.example.test', commit: 'abc123' },
    evidence: [],
    abuseReview: { complete: false, reference: '' },
    legalReview: { complete: true, reference: 'review-1' },
  });
  const evaluation = evaluateViewerBeta(input);
  assert.equal(evaluation.decision, 'pause');
  assert.match(evaluation.reasons[0] ?? '', /missing short\/desktop evidence/);
});
