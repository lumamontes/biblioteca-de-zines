# BookReader Viewer Beta Evaluation

This document is the release gate for the isolated BookReader beta. It records what must be measured before expanding access beyond selected publications and testers. It does not authorize general public exposure by itself.

## Current Decision

**Decision: pause at selected-publication beta.**

The repository contains deterministic application and browser coverage, but live deployment measurements, abuse review, and AGPL-3.0 source-distribution review must still be attached to this report before expansion.

## Evaluation Cohorts

Evaluate at least one publication in each cohort:

| Cohort | Required characteristics |
| --- | --- |
| Short | Fewer than 10 pages |
| P90 | At the catalogue's 90th-percentile page count |
| Long | A publication above the P90 page count |
| Image-heavy | Large or unusually high-resolution page derivatives |

Run each cohort on a desktop browser and a mobile browser. Record the canonical slug, generation ID, page count, test date, browser/device, network profile, and whether the request used the reader or embed surface.

## Measurements

Record these values for every cohort and device:

- Time to first visible page.
- First-page, adjacent-page, and revisit request count, status, elapsed time, bytes, and cache-control headers.
- Navigation latency from a page-change event to the visible page state.
- Viewer bundle and vendor asset bytes separately from the main application route.
- Iframe document load time separately from the main application document.
- JavaScript heap usage when the browser exposes it, with `null` recorded when unavailable.
- Viewer/API request rates, rate-limit responses, derivative bandwidth, and cache hit/revisit behavior.
- Embed origin/host distribution from `public_reader_viewer` events.
- Initialization, image, endpoint, fallback, and beta-denial outcomes.

The delivery probe measures manifest and derivative HTTP behavior:

```bash
READER_PERFORMANCE_URL=https://biblioteca-de-zines.com.br/api/public-reader/<canonical-slug> \
READER_BETA_TOKEN=<temporary-token> \
READER_PERFORMANCE_OUTPUT=/tmp/reader-performance.json \
pnpm reader:performance
```

The browser evidence suite covers the isolated viewer and embed route without loading vendor assets on the main application route:

```bash
pnpm exec playwright test e2e/reader/viewer-isolation.spec.ts --project=chromium
```

Use the public-reader request logs for surface, origin, status, rate-limit, and metadata-size metrics. Use storage/CDN delivery metrics and the delivery probe for derivative bandwidth; client metadata size is not a derivative bandwidth measurement.

The browser/device run must be recorded as JSON using the evidence shape consumed by the release gate. The evaluator requires one record for every cohort/device pair, exactly one initial page request, no more than two adjacent-page requests, and no unexplained failures:

```json
{
  "deployment": { "url": "https://viewer.example", "commit": "<commit>" },
  "evidence": [],
  "abuseReview": { "complete": false, "reference": "" },
  "legalReview": { "complete": false, "reference": "" }
}
```

Run the release gate after attaching the live records:

```bash
pnpm reader:beta:evaluate /path/to/reader-beta-evidence.json
```

The command exits non-zero for `pause` or `rollback`. A `rollback` decision is forced when fallback preservation is false or an abuse signal is recorded. The evaluator is deliberately separate from the request path; it cannot enable a rollout or delete page generations.

## Reliability Matrix

Before expansion, exercise and attach evidence for:

- Complete manifest and first-page render.
- Adjacent navigation and revisit behavior.
- BookReader initialization failure.
- Page image failure.
- Public-reader endpoint failure.
- Incomplete or failed page generation with the retained PDF fallback.
- Denied publication, invalid tester token, and disabled embed gate.
- Embed kill switch with the normal reader and retained PDF still available.
- Recovery after re-enabling the affected gate.

## Decision Rules

Expand only when all of these are true:

- Every cohort has a successful desktop and mobile run with attached measurements.
- No cohort loses the explicit retained PDF fallback.
- No unexplained initialization, endpoint, or page-image failure remains.
- Cache behavior and request rates are understood, with no unresolved abuse signal.
- Viewer and embed surfaces remain independently reversible.
- Legal/source-distribution review for the AGPL-3.0 BookReader dependency is complete.

Pause the beta when any cohort has a reproducible reader failure, unexpected derivative cost, unexplained embed-host pattern, or missing fallback. Keep the current allowlist and disable new publication additions while investigating.

Rollback immediately when there is abuse, a rights/access issue, or a material reliability incident:

1. Set `READER_EMBED_ENABLED=false` for embed incidents.
2. Set `READER_VIEWER_ENABLED=false` for normal viewer incidents.
3. Keep `READER_BETA_ENABLED=false` if both surfaces must close.
4. Verify the retained PDF remains available and do not delete page generations.
5. Preserve request, fallback, bandwidth, and host evidence for the follow-up decision.

## Evidence Record

Fill this section with deployment-specific evidence before requesting expansion:

- Deployment URL and commit: pending
- Cohort slugs and generation IDs: pending
- Desktop results: pending
- Mobile results: pending
- Failure matrix: automated coverage in `e2e/reader/viewer-isolation.spec.ts`; live results pending
- Abuse/bandwidth review: pending
- Legal/source-distribution review: pending
- Final decision and approver: pending

The rollout configuration must also pass the application readiness check before enabling beta. Selected-publication beta requires HTTPS and at least one explicit slug; `READER_BETA_ALLOW_ALL` remains an intentional override, not a default.
