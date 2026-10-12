# BookReader Reading Path

## Purpose

Define the application boundary for using Internet Archive BookReader to read published Biblioteca de Zines publications.

This is a target integration specification. It does not activate full-page processing by itself.

## Application Boundary

The reader is application code in Biblioteca de Zines. It is not a separately released reader package and does not make the Viveiro Digital wiki a runtime dependency.

The host application owns:

- Publication metadata and route state.
- Discovery, reading, download, preservation, and reuse access decisions.
- Selection of the active complete page generation.
- Fallback to the PDF reading/download representation.
- Publication and derivative failure messaging.

The BookReader adapter owns:

- Loading the pinned BookReader assets.
- Translating the active page manifest into BookReader data.
- Translating page-change events to host state.
- Exposing `next`, `previous`, and `goTo` operations as needed.
- Cleaning up BookReader listeners and DOM on route change/unmount.

## Page Manifest

BookReader receives an ordered manifest derived from the active generation:

```ts
type ReaderPageImage = {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
  generationId: string;
};
```

The adapter must reject or fail visibly when the manifest is empty, has duplicate page numbers, skips required pages, mixes generations, or lacks dimensions.

The reader must never construct a manifest by guessing from filenames or by mixing the current and a previous generation.

## Processing Lifecycle

1. A submission becomes an approved public catalogue publication.
2. A retryable processing job downloads the current PDF source.
3. The worker renders each page into the selected derivative format and dimensions.
4. Page objects are written under a new immutable generation namespace.
5. The worker validates page count, object presence, dimensions, and upload completion.
6. Database page rows and the active generation pointer are updated only after the generation is complete.
7. The reader selects the active generation and passes its ordered manifest to BookReader.

A failed generation must not replace the last successful active generation. A changed PDF source creates a new generation rather than overwriting existing page objects.

## Delivery and Caching

Page URLs should be versioned and immutable. Once a generation is active, its page responses may use long-lived shared caching, for example:

```http
Cache-Control: public, max-age=31536000, immutable
```

Catalogue metadata and active-generation pointers remain revalidatable and must not receive immutable caching merely because page objects do.

Browser and service-worker caches are per client. CDN/shared caches and persisted page objects are the layers that allow different clients to reuse the same page delivery and processing result.

## Fallbacks

The PDF remains available when:

- No complete page generation exists.
- A page generation fails or is unavailable.
- BookReader assets fail to load.
- The browser/device does not meet the reader support baseline.
- A user requests the original reading/download representation.

Fallback must be an explicit, accessible application action and must not silently substitute a different publication or generation.

## Performance Gate

Before enabling the reader for the full public catalogue, measure:

- Time to first visible page on desktop and mobile.
- Initial page requests and adjacent-page requests.
- Revisit/cache behavior.
- Memory use for short, P90, long, and image-heavy publications.
- Processing time and derivative size at the selected format/quality.
- Failure and retry behavior for incomplete generations.

The archive inventory and rendering benchmark provide the initial sample and must be repeated when renderer scale, format, or quality changes.
