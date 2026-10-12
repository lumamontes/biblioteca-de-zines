# Cover-Only Generation and Migration

## Status

This document remains normative for explicit cover migration and diagnostic commands. The publication queue now uses the complete page-generation workflow defined in `page-processing-and-asset-lifecycle.md`; references below to the current cover workflow apply to this legacy cover-only path.

## Problem Statement

The Biblioteca currently uses Google Drive's PDF preview for reading. When a submission or catalogue publication does not have a valid cover image, the application displays the Biblioteca placeholder instead.

The intended improvement is narrower than full PDF page processing: generate one web-ready cover from the first page of the submitted PDF, store that derivative in the public R2 bucket, and use it as the publication cover. The existing full PDF-to-image renderer must remain available for a future reader or page-derivative workflow, but it must not run as part of the current cover workflow.

The repository also needs a safe migration for already-published zines that use an empty, placeholder, or unreachable cover URL. The migration must skip PDF sources already known to be unavailable or invalid according to the existing monitor report.

## Solution

Introduce a cover-only application workflow shared by:

- New publication processing.
- Republish and changed-PDF processing.
- The existing-published-zine migration.
- Local diagnostic cover generation.

The workflow downloads the current PDF source, renders only its first page, optimizes the image for web delivery, and uploads one immutable cover derivative to R2. The catalogue's `cover_image` is updated only when the current cover is empty, the known Biblioteca placeholder, or an invalid/unreachable image reference.

Generated covers use the existing processed-source marker to determine whether the current PDF has already produced the active generated cover. No new source-marker column is required.

The full PDF renderer remains separate from this cover-only workflow and is not used by explicit cover migration or diagnostic processing to write `zine_pages`.

## User Stories

1. As a reviewer, I want a published zine without a submitted cover to receive a cover from the first PDF page, so that the catalogue does not display the generic Biblioteca placeholder.
2. As a reviewer, I want a valid submitted cover URL to remain unchanged, so that an author-provided cover takes precedence over an automatically generated one.
3. As a reviewer, I want an empty cover field to trigger first-page cover generation, so that missing cover metadata has a useful default.
4. As a reviewer, I want an unreachable cover URL to be replaced by a generated cover when the PDF is available, so that broken catalogue images do not remain public.
5. As a maintainer, I want generated covers to be smaller and web-ready, so that browser delivery and R2 storage remain efficient.
6. As a maintainer, I want generated covers to use WebP with bounded dimensions and controlled quality, so that optimization is consistent across new and migrated covers.
7. As a maintainer, I want generated covers to use immutable generation-specific R2 keys, so that a replacement cannot corrupt an image currently being served.
8. As a maintainer, I want the active cover URL to change only after the new R2 object is stored successfully, so that a failed generation does not break the existing cover.
9. As a maintainer, I want the previous generated cover removed only after the replacement is active, so that cleanup cannot delete the only usable derivative prematurely.
10. As a maintainer, I want a changed PDF URL to produce a new fallback cover, so that the cover reflects the current source document.
11. As a maintainer, I want an unchanged PDF URL and complete generated cover to be reused, so that republishing does not perform unnecessary work.
12. As a maintainer, I want metadata-only edits to avoid PDF downloads and rendering, so that ordinary catalogue editing remains fast and inexpensive.
13. As a maintainer, I want cover generation to run through the processing queue, so that publication requests do not depend on a long synchronous web request.
14. As a maintainer, I want failed cover processing to be retryable, so that temporary source, network, or worker failures can recover.
15. As a maintainer, I want failed partial R2 uploads removed, so that unsuccessful work does not accumulate orphaned objects.
16. As a maintainer, I want a local command that renders the first page of one existing form upload without changing the database, so that I can inspect the output before changing a publication.
17. As a maintainer, I want a migration dry run to list every eligible published zine, so that I can inspect the candidate set before writing assets.
18. As a maintainer, I want one apply command to process all eligible migration candidates, so that the migration does not require manually repeating a command for every zine.
19. As a maintainer, I want the migration to skip PDF URLs listed as inaccessible or invalid by the monitor report, so that known failures are not repeatedly retried.
20. As a maintainer, I want the migration to continue after an individual zine fails, so that one bad source does not prevent other valid covers from being generated.
21. As a maintainer, I want the migration to support processing one explicit zine ID, so that a single candidate can be tested safely.
22. As a maintainer, I want the migration to be idempotent, so that rerunning it does not replace already-correct generated covers unnecessarily.
23. As a maintainer, I want publication-triggered processing to dispatch to GitHub Actions, so that production cover generation runs outside the web application process.
24. As a maintainer, I want a scheduled GitHub Actions fallback, so that queued work is eventually processed if an event dispatch fails.
25. As a maintainer, I want to run one pending queue job locally with a bounded limit and concurrency, so that production behavior can be tested without processing the entire queue.
26. As a future reader maintainer, I want the full PDF-to-image renderer preserved behind a separate boundary, so that page derivatives can be added later without redesigning cover generation.
27. As a future contributor, I want application, domain, infrastructure, UI, and script responsibilities documented, so that new code follows consistent repository boundaries.

## Implementation Decisions

- The legacy cover-only capability is **cover-only processing**: one first-page derivative per explicit migration or diagnostic run.
- The current public reader continues to use Google Drive PDF preview. Generated R2 covers do not replace the PDF reader.
- A generated cover is a derivative, not the source PDF, reading copy, or preservation copy.
- `form_uploads` remain intake records and do not create R2 derivatives before publication.
- Publication processing uses the current `library_zines.pdf_url`.
- A valid submitted or manually managed cover remains authoritative. Empty, known-placeholder, or unreachable cover references are eligible for replacement by the migration; publication treats a non-empty submitted cover as authoritative unless it is explicitly removed.
- Generated cover identity is inferred from the configured public R2 cover namespace. A generated cover is stored under a key shaped like `zines/{zineId}/covers/{generationId}.webp`.
- The `covers` segment is plural because immutable historical generations may exist over time, even though only one cover is active for a publication. A separate `generated` segment is unnecessary because this namespace is reserved for generated cover derivatives.
- The existing processed PDF source marker is reused to identify which PDF produced the active generated cover. No new cover-source column is introduced.
- A complete generated cover for the same PDF source is reused. A changed PDF source creates a new generation.
- Generated covers are converted to WebP, resized without enlargement to a bounded long edge of approximately 1600 pixels, and encoded at an agreed quality around 85. The exact encoding options remain implementation details subject to representative-image comparison.
- Generated cover objects receive the correct WebP content type and long-lived immutable cache headers.
- New R2 objects are written before the catalogue cover reference changes. Superseded generated objects are deleted only after the new reference is active.
- A failed generation leaves the previously active cover untouched and removes any partial objects from the new generation.
- Cover generation runs through the existing processing-job queue and worker boundary. The worker processes one claimed publication at a time and records completion or retryable failure.
- Publication dispatch requests GitHub Actions execution. The workflow also has a scheduled fallback and a manual dispatch path.
- The migration command has three modes: dry run by default, one-candidate selection with `--only-id`, and all-candidate application with `--apply`.
- The all-candidate migration reads the existing monitor report, excludes known `inaccessible` and `invalid` PDF resources, processes eligible published zines sequentially or with bounded concurrency, reports individual failures, and exits with an operational summary.
- The migration never replaces a valid reachable external cover automatically.
- Local cover generation is diagnostic only: it downloads one existing form-upload source, renders page 1, writes a local image, and does not update Supabase or R2.
- The reusable PDF rendering primitive remains separate from the cover workflow. Future full page generation may use that primitive and its own application service, repository contract, storage layout, and page-generation lifecycle.
- The existing page-derivative schema and renderer are used by the separate publication page-generation workflow. They are not written by this cover-only workflow.
- New server actions remain thin adapters that create clients, call application services, and revalidate paths.
- Application services own use cases and orchestration. Domain rules remain independent of Next.js, Supabase, R2, Google Drive, and PDF.js. Infrastructure owns persistence, storage, source acquisition, and rendering adapters. Scripts call application services explicitly.
- The application boundary should remain lightweight. Full DDD ceremony, aggregates, factories, and value objects are not required without a concrete domain need.

## Testing Decisions

- The primary seam is the cover-generation application service with injected source acquisition, repository, and storage adapters. Tests assert external behavior: source handling, image output contract, persistence ordering, cleanup, and failure behavior.
- Tests should not assert private helper structure, specific PDF.js calls, or the internal image-library pipeline beyond observable output properties such as format, dimensions, and successful storage.
- Cover-generation tests should cover a valid PDF, a PDF with no pages, an unsupported source, a successful generated cover, a failed upload, a failed catalogue activation, and replacement cleanup.
- Reuse-decision tests should cover matching source URLs, changed source URLs, missing processing markers, valid external covers, empty covers, placeholder covers, and unreachable covers.
- Publication integration tests should verify that publication enqueues cover work, metadata-only edits do not enqueue work, PDF changes enqueue work, and republish reuses a complete generated cover.
- Queue worker tests should verify bounded claiming, completion, retryable failure, exhausted failure, and that a job reads the current publication PDF URL.
- The migration should have a dry-run seam using fixture zine rows and monitor-report entries. Tests should verify exclusion of known invalid/inaccessible PDFs, selection of eligible covers, `--only-id`, `--apply`, continuation after an individual failure, and idempotent reruns.
- The local diagnostic command should be tested for first-page output and for its lack of database or R2 mutation.
- R2 adapter tests should verify the cover key shape, WebP content type, cache metadata, generation cleanup, and that page-generation keys remain compatible for future use.
- GitHub Actions should be checked as configuration behavior: manual dispatch, repository dispatch, scheduled fallback, secrets wiring, bounded worker arguments, and serialized concurrency.
- Existing repository test prior art is the Node test suite under `scripts/`. New tests should prefer the highest application seam available and use fakes at infrastructure boundaries rather than live Supabase, Google Drive, or R2 calls.
- Manual verification should include one real form-upload cover rendered locally, one controlled published-zine migration, an unchanged republish, a changed-PDF regeneration, removal of a custom cover, and inspection of the resulting R2 object.

## Out of Scope

- Replacing the current Google Drive PDF reader.
- Generating or serving full PDF page images in this cover-only workflow.
- Creating `zine_pages` rows during cover-only processing.
- Pre-processing unreviewed form uploads.
- Creating a private R2 derivative bucket.
- Re-encoding or rewriting valid external/manual cover URLs without evidence that they are unreachable or invalid.
- Storing original PDFs in R2.
- Adding responsive cover variants before the single optimized cover is measured in production.
- Introducing full DDD ceremony across the repository.
- Rewriting unrelated dashboard, catalogue, reader, or archive workflows.

## Further Notes

- The current public R2 bucket is `biblioteca-de-zines-pb`, served through the configured assets domain.
- R2 egress is not the primary concern for this workflow; the relevant costs are derivative storage, object operations, source downloads, and GitHub Actions runtime.
- One cover per published zine keeps the current processing cost materially lower than rendering every PDF page.
- The monitor report is operational evidence. It excludes known source failures from migration work; it does not change the publication record or silently mark those sources permanently resolved.
- The architecture and domain vocabulary should be kept in the repository agent guidance and root glossary so future contributors preserve the cover-only boundary.
