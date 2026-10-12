# Process Pages at Publication

Status: superseded for the current reader by [Cover-Only Processing at Publication](./12-cover-only-processing-at-publication.md).

## Context

Submissions in `form_uploads` are intake records awaiting review. Pre-processing those records creates private derivatives for material that may never be published and adds a second storage lifecycle. The current reader uses Google Drive preview; the current catalogue need is a public fallback cover, while full page assets remain future work.

## Decision

Process PDFs only after a submission becomes a `library_zine`, writing a first-page cover derivative directly to the public delivery bucket.

- `form_uploads` stores submission metadata and the current source URL only.
- `form_uploads` does not create derivatives.
- Publication reads the current PDF URL and creates a cover generation when no valid active generated cover exists for that exact URL.
- A changed PDF URL creates a new cover generation when the current cover is a generated fallback; it does not replace a valid external cover.
- A matching complete generated cover is reused during republish.
- Metadata-only edits do not trigger processing.
- A missing custom cover uses the first PDF page as the default WebP cover.
- The cleanup migration removes the unused form-upload processing columns and `form_upload_pages`; form uploads remain intake records only.

See the [page-processing and asset-lifecycle specification](../specs/page-processing-and-asset-lifecycle.md) for the complete lifecycle and the [runbook](../runbooks/page-processing.md) for operations.

## Alternatives Considered

### Pre-process submissions in a private bucket

Rejected because most submissions may never become publications, and the current workflow has no requirement to preview generated pages during review.

### Two buckets with private-to-public promotion

Rejected for the current workflow because it adds copying, private-generation cleanup, and a second source of lifecycle state without a current product benefit.

### One private bucket with signed public delivery URLs

Deferred. This remains an option if published assets later need restricted access, but it would require a different reader delivery model.

## Consequences

Positive consequences:

- Unpublished submissions create no derivative storage or cleanup obligations.
- A PDF edited before publication is naturally handled by reading the latest URL at publication.
- Republish can reuse the existing public generation when the URL is unchanged.
- The active storage path is simpler and easier to operate.

Tradeoffs:

- Reviewers cannot preview generated cover derivatives before publication.
- Publication waits for first-page rendering when a generated cover is missing or stale.
- Cover replacement uses immutable generation IDs and safe activation.
- Full page generation remains a future workflow using the preserved PDF rendering primitives.
