export const BETA_COHORTS = ['short', 'p90', 'long', 'image-heavy'] as const;
export type BetaCohort = (typeof BETA_COHORTS)[number];
export type BetaDevice = 'desktop' | 'mobile';
export type BetaEvidenceRecord = {
  cohort: BetaCohort; device: BetaDevice; slug: string; generationId: string; pageCount: number;
  firstVisiblePageMs: number; navigationLatencyMs: number; initialPageRequests: number;
  adjacentPageRequests: number; revisitPageRequests: number; viewerBundleBytes: number;
  iframeLoadMs: number; heapBytes: number | null; derivativeBandwidthBytes: number;
  cacheBehavior: 'hit' | 'miss' | 'unknown'; cacheControl: string | null; responseStatus: number;
  requestRatePerMinute: number; embedHost: string | null; initializationFailures: number;
  imageFailures: number; endpointFailures: number; fallbackEvents: number; imageFormat: string;
  maxImageDimension: number; imageQuality: number | null; fallbackPreserved: boolean;
  failureCount: number; abuseSignal: boolean;
};
export type BetaReview = { complete: boolean; reference: string };
export type BetaEvaluationInput = {
  deployment: { url: string; commit: string }; evidence: readonly BetaEvidenceRecord[];
  abuseReview: BetaReview; legalReview: BetaReview;
};
export type BetaEvaluation = { decision: 'expand' | 'pause' | 'rollback'; reasons: string[] };
