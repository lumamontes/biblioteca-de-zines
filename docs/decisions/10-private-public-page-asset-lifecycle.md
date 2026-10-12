# Private and Public Page Asset Lifecycle

## Context

Biblioteca processes submitted PDFs into page and cover derivatives before or during publication. Submissions are private review material, while published zines need stable public delivery URLs. The same submission may be edited, published, unpublished, republished, rejected, or withdrawn.

The system must avoid exposing unpublished derivatives, avoid unnecessary PDF processing, preserve a successful published generation while replacements are processed, and clean up stale storage.

## Decision

Use separate private and public R2 buckets with immutable generation IDs.

- `biblioteca-de-zines` stores private submission generations.
- `biblioteca-de-zines-pb` stores published delivery generations.
- A complete unchanged private generation is copied to public storage at publication.
- A changed or unknown PDF source is regenerated instead of copied.
- R2 objects are never overwritten in place.
- Public generations remain available through ordinary unpublish/republish cycles.
- Private rejected or withdrawn generations are retained for 30 days before cleanup.
- A missing custom cover falls back to the first PDF page, and the submission form discloses this behavior.

The detailed behavior, state transitions, scripts, migrations, and cleanup rules are documented in the [page-processing and asset-lifecycle specification](../specs/page-processing-and-asset-lifecycle.md).

## Alternatives Considered

### One public bucket

Rejected because unpublished submission derivatives would become publicly readable.

### One private bucket with signed URLs

Viable, but it requires signed URL delivery throughout the public reader and more complex expiration and caching behavior. The two-bucket design fits the current direct public asset delivery model with a smaller implementation surface.

### Reprocess on every publication

Rejected because it adds source downloads, runtime, latency, and failure opportunities when a complete matching generation already exists.

## Consequences

Positive consequences:

- Private review assets have a storage boundary.
- Public asset delivery uses a stable custom domain.
- Unchanged sources can be reused without PDF rendering.
- New generations can be verified before replacing active pages.
- Normal unpublish/republish cycles avoid reprocessing.

Tradeoffs:

- Publication requires a private-to-public copy operation.
- Storage adapters must support two buckets and generation copy.
- Explicit rejected/withdrawn state is required for safe 30-day cleanup.
- Existing public derivatives require a one-time migration into the public bucket.

## Links

- [Page Processing and Asset Lifecycle](../specs/page-processing-and-asset-lifecycle.md)
- [Page Processing Runbook](../runbooks/page-processing.md)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
