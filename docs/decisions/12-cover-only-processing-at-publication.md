# Cover-Only Processing at Publication

## Context

The current public reader uses Google Drive's PDF preview. The catalogue needs a reliable cover when a submission has no usable cover image, but it does not currently need locally hosted page images. Rendering every PDF page during publication would add unnecessary source downloads, compute, storage, and cleanup for a capability the reader does not use.

## Decision

The current publication processing workflow renders only the first PDF page and stores one optimized WebP cover derivative in the public R2 bucket.

- A generated cover is stored under the publication's immutable cover-generation namespace.
- A valid external or manually supplied cover remains authoritative.
- Empty, known-placeholder, or unreachable covers may be replaced when the source PDF is usable.
- The existing processed PDF source marker identifies which source produced the active generated cover.
- An unchanged source and complete generated cover are reused across unpublish/republish cycles.
- A changed source creates a new generated cover only when the active cover is generated; valid external covers are preserved.
- Full PDF-to-image rendering remains reusable infrastructure for a future page-generation workflow and is not invoked by current cover processing.

## Consequences

Positive consequences:

- Cover generation is materially cheaper than rendering every page.
- The current reader remains unchanged.
- Generated covers are optimized for web delivery and can be cached immutably.
- Unreviewed submissions create no derivatives.
- Existing full-page rendering capability is preserved without coupling it to current publication behavior.

Tradeoffs:

- The catalogue cover may differ from the Google Drive preview's first-page rendering details.
- A generated cover must be regenerated when its source PDF changes.
- Cover migration needs source-health evidence and careful invalid-cover detection.
