import { BETA_COHORTS } from './beta-evaluation-types';
import type { BetaEvaluation, BetaEvaluationInput, BetaEvidenceRecord } from './beta-evaluation-types';

export { BETA_COHORTS } from './beta-evaluation-types';
export type { BetaEvaluation, BetaEvaluationInput, BetaEvidenceRecord } from './beta-evaluation-types';

export function parseBetaEvaluationInput(value: unknown): BetaEvaluationInput {
  if (!value || typeof value !== 'object') throw new Error('Beta evidence must be an object');
  const input = value as Record<string, unknown>;
  if (!isDeployment(input.deployment) || !isReview(input.abuseReview) || !isReview(input.legalReview)) {
    throw new Error('Beta evidence requires deployment, abuseReview, and legalReview');
  }
  if (!Array.isArray(input.evidence)) throw new Error('Beta evidence requires an evidence array');
  const evidence = input.evidence.map((record) => parseEvidenceRecord(record));
  const keys = new Set(evidence.map((record) => `${record.cohort}/${record.device}`));
  if (keys.size !== evidence.length) throw new Error('Beta evidence contains duplicate cohort/device records');
  return { abuseReview: input.abuseReview, deployment: input.deployment, evidence, legalReview: input.legalReview };
}

export function evaluateViewerBeta(input: BetaEvaluationInput): BetaEvaluation {
  const reasons: string[] = [];
  if (!input.deployment.url || !input.deployment.commit) reasons.push('deployment evidence is incomplete');
  for (const cohort of BETA_COHORTS) {
    for (const device of ['desktop', 'mobile'] as const) {
      const record = input.evidence.find((item) => item.cohort === cohort && item.device === device);
      if (!record) reasons.push(`missing ${cohort}/${device} evidence`);
      else validateRecord(record, reasons);
    }
  }
  if (!input.abuseReview.complete) reasons.push('abuse and bandwidth review is incomplete');
  if (!input.legalReview.complete) reasons.push('AGPL source-distribution review is incomplete');

  const rollbackRecords = input.evidence.filter((record) => record.abuseSignal || !record.fallbackPreserved);
  if (rollbackRecords.some((record) => record.abuseSignal)) reasons.push('abuse signal requires rollback');
  if (rollbackRecords.some((record) => !record.fallbackPreserved)) reasons.push('PDF fallback was not preserved');
  return {
    decision: rollbackRecords.length > 0 ? 'rollback' : reasons.length === 0 ? 'expand' : 'pause',
    reasons,
  };
}

function validateRecord(record: BetaEvidenceRecord, reasons: string[]): void {
  if (record.firstVisiblePageMs < 0 || record.navigationLatencyMs < 0) reasons.push(`${record.cohort}/${record.device} has invalid timings`);
  if (record.initialPageRequests !== 1) reasons.push(`${record.cohort}/${record.device} did not load exactly one initial page`);
  if (record.adjacentPageRequests > 2) reasons.push(`${record.cohort}/${record.device} loaded too many adjacent pages`);
  if (record.failureCount > 0) reasons.push(`${record.cohort}/${record.device} has unexplained failures`);
  if (record.responseStatus < 200 || record.responseStatus >= 400) reasons.push(`${record.cohort}/${record.device} has an unsuccessful response`);
  if (record.requestRatePerMinute < 0 || record.derivativeBandwidthBytes < 0) reasons.push(`${record.cohort}/${record.device} has invalid delivery metrics`);
  if (record.pageCount <= 0 || record.firstVisiblePageMs <= 0 || record.iframeLoadMs <= 0 || record.viewerBundleBytes <= 0) {
    reasons.push(`${record.cohort}/${record.device} is missing browser performance measurements`);
  }
  if (record.cacheBehavior === 'unknown') reasons.push(`${record.cohort}/${record.device} has unknown cache behavior`);
  if (record.initializationFailures + record.imageFailures + record.endpointFailures > 0) {
    reasons.push(`${record.cohort}/${record.device} has reader failure outcomes`);
  }
  if (!record.imageFormat || record.maxImageDimension <= 0 || (record.imageQuality !== null && record.imageQuality <= 0)) {
    reasons.push(`${record.cohort}/${record.device} has incomplete image metadata`);
  }
}

function isDeployment(value: unknown): value is BetaEvaluationInput['deployment'] {
  return isRecord(value) && typeof value.url === 'string' && value.url.length > 0
    && typeof value.commit === 'string' && value.commit.length > 0;
}

function isReview(value: unknown): value is BetaEvaluationInput['abuseReview'] {
  return isRecord(value) && typeof value.complete === 'boolean'
    && typeof value.reference === 'string' && (!value.complete || value.reference.length > 0);
}

function parseEvidenceRecord(value: unknown): BetaEvidenceRecord {
  if (!isRecord(value)) throw new Error('Each beta evidence record must be an object');
  const requiredStrings = ['slug', 'generationId', 'imageFormat'] as const;
  if (!requiredStrings.every((key) => typeof value[key] === 'string' && value[key].length > 0)) {
    throw new Error('Beta evidence records require slug, generationId, and imageFormat');
  }
  if (!BETA_COHORTS.includes(value.cohort as BetaEvidenceRecord['cohort']) || (value.device !== 'desktop' && value.device !== 'mobile')) {
    throw new Error('Beta evidence has an invalid cohort or device');
  }
  const numericKeys = ['pageCount', 'firstVisiblePageMs', 'navigationLatencyMs', 'initialPageRequests', 'adjacentPageRequests', 'revisitPageRequests', 'viewerBundleBytes', 'iframeLoadMs', 'derivativeBandwidthBytes', 'responseStatus', 'requestRatePerMinute', 'initializationFailures', 'imageFailures', 'endpointFailures', 'fallbackEvents', 'maxImageDimension', 'failureCount'] as const;
  if (!numericKeys.every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]) && value[key] >= 0)) throw new Error('Beta evidence has invalid numeric metrics');
  if (value.heapBytes !== null && (typeof value.heapBytes !== 'number' || value.heapBytes < 0)) throw new Error('Beta evidence has invalid heap bytes');
  if (value.imageQuality !== null && (typeof value.imageQuality !== 'number' || value.imageQuality <= 0)) throw new Error('Beta evidence has invalid image quality');
  if (value.cacheBehavior !== 'hit' && value.cacheBehavior !== 'miss' && value.cacheBehavior !== 'unknown') throw new Error('Beta evidence has invalid cache behavior');
  if (typeof value.cacheControl !== 'string' && value.cacheControl !== null) throw new Error('Beta evidence has invalid cache headers');
  if (typeof value.embedHost !== 'string' && value.embedHost !== null) throw new Error('Beta evidence has invalid embed host');
  if (typeof value.fallbackPreserved !== 'boolean' || typeof value.abuseSignal !== 'boolean') throw new Error('Beta evidence has invalid safety outcomes');
  return value as unknown as BetaEvidenceRecord;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
