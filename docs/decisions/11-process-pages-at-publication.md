# Process Pages at Publication

## Context

Submissions in `form_uploads` are intake records awaiting review. Pre-processing those records creates private derivatives for material that may never be published and adds a second storage lifecycle. Published zines need public page assets, but unpublished submissions do not need page assets for the current workflow.

## Decision

Process PDFs only after a submission becomes a `library_zine`, writing the generation directly to the public delivery bucket.

- `form_uploads` stores submission metadata and the current source URL only.
- `form_uploads` does not create page derivatives.
- Publication reads the current PDF URL and creates a public generation when no valid active generation exists for that exact URL.
- A changed PDF URL creates a new generation; it never reuses stale pages.
- A matching complete active generation is reused during republish.
- Metadata-only edits do not trigger processing.
- A missing custom cover uses the first PDF page as the default.
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

- Reviewers cannot preview generated page derivatives before publication.
- Publication waits for PDF rendering when a generation is missing or stale.
- Public generation replacement still needs immutable generation IDs and safe activation.
- Legacy form-upload processing schema remains until a separately approved cleanup migration.
