import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateViewerBeta, parseBetaEvaluationInput } from '../src/application/reader/beta-evaluation';
import { BETA_COHORTS, type BetaEvidenceRecord } from '../src/application/reader/beta-evaluation-types';

function record(cohort: BetaEvidenceRecord['cohort'], device: BetaEvidenceRecord['device']): BetaEvidenceRecord {
  return {
    abuseSignal: false,
    adjacentPageRequests: 2,
    cacheBehavior: 'miss',
    cacheControl: 'public, max-age=31536000, immutable',
    cohort,
    derivativeBandwidthBytes: 1000,
    device,
    embedHost: 'example.test',
    endpointFailures: 0,
    failureCount: 0,
    fallbackPreserved: true,
    firstVisiblePageMs: 100,
    generationId: 'generation-1',
    heapBytes: null,
    imageFailures: 0,
    imageFormat: 'webp',
    imageQuality: 85,
    iframeLoadMs: 80,
    initializationFailures: 0,
    initialPageRequests: 1,
    maxImageDimension: 1600,
    navigationLatencyMs: 60,
    pageCount: 10,
    revisitPageRequests: 0,
    requestRatePerMinute: 1,
    responseStatus: 200,
    slug: `${cohort}-${device}`,
    viewerBundleBytes: 1000,
    fallbackEvents: 0,
  };
}

function completeEvidence(): BetaEvidenceRecord[] {
  return BETA_COHORTS.flatMap((cohort) => [record(cohort, 'desktop'), record(cohort, 'mobile')]);
}

test('expands only when every cohort, review, and fallback gate passes', () => {
  assert.deepEqual(evaluateViewerBeta({
    abuseReview: { complete: true, reference: 'abuse-report.md' },
    deployment: { commit: 'abc123', url: 'https://viewer.example' },
    evidence: completeEvidence(),
    legalReview: { complete: true, reference: 'legal-review.md' },
  }), { decision: 'expand', reasons: [] });
});

test('pauses when evidence or reviews are incomplete', () => {
  const result = evaluateViewerBeta({
    abuseReview: { complete: false, reference: '' },
    deployment: { commit: '', url: '' },
    evidence: completeEvidence().slice(1),
    legalReview: { complete: false, reference: '' },
  });
  assert.equal(result.decision, 'pause');
  assert.ok(result.reasons.includes('deployment evidence is incomplete'));
  assert.ok(result.reasons.includes('missing short/desktop evidence'));
});

test('rolls back when fallback is lost or an abuse signal is present', () => {
  const evidence = completeEvidence();
  evidence[0] = { ...evidence[0], abuseSignal: true };
  const result = evaluateViewerBeta({
    abuseReview: { complete: true, reference: 'abuse-report.md' },
    deployment: { commit: 'abc123', url: 'https://viewer.example' },
    evidence,
    legalReview: { complete: true, reference: 'legal-review.md' },
  });
  assert.equal(result.decision, 'rollback');
});

test('rejects eager initial page loading and unexplained failures', () => {
  const evidence = completeEvidence();
  evidence[0] = { ...evidence[0], failureCount: 1, initialPageRequests: 4 };
  const result = evaluateViewerBeta({
    abuseReview: { complete: true, reference: 'abuse-report.md' },
    deployment: { commit: 'abc123', url: 'https://viewer.example' },
    evidence,
    legalReview: { complete: true, reference: 'legal-review.md' },
  });
  assert.equal(result.decision, 'pause');
  assert.ok(result.reasons.includes('short/desktop did not load exactly one initial page'));
  assert.ok(result.reasons.includes('short/desktop has unexplained failures'));
});

test('rejects malformed release evidence before evaluation', () => {
  assert.throws(() => parseBetaEvaluationInput({}), /requires deployment/);
  assert.throws(() => parseBetaEvaluationInput({
    abuseReview: { complete: true, reference: '' },
    deployment: { commit: 'abc123', url: 'https://viewer.example' },
    evidence: [],
    legalReview: { complete: true, reference: 'legal-review.md' },
  }), /requires deployment/);
});
