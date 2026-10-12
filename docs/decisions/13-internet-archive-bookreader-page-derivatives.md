# Internet Archive BookReader with Page Derivatives

## Context

Biblioteca de Zines needs an interactive reader for published zines. Internet Archive BookReader was selected as the strongest existing reader candidate after comparison with the other demo engines. BookReader's application data contract is an ordered set of page images with dimensions; it is not a direct PDF-preview replacement for Biblioteca's current iframe.

The reader should serve the Biblioteca catalogue rather than become a general-purpose package. The archive inventory contains 309 public PDFs and 3,242 pages. A rendering benchmark produced 16.1 MB of WebP output for 187 representative pages, with an average of 86 KB per page. The current renderer estimates approximately 45.8 minutes for serial processing of all archive pages, so processing must be asynchronous and retryable.

## Decision

Biblioteca will integrate Internet Archive BookReader as an application feature in the Biblioteca repository, behind a Biblioteca-owned adapter. It will not be maintained as a reusable reader package.

The production reader path will be:

```text
approved public publication
  -> asynchronous PDF page processing
  -> complete immutable page generation
  -> ordered page-image manifest
  -> Internet Archive BookReader
```

- The retained PDF remains available as the reading/download representation and fallback.
- Page images are reading derivatives, not replacements for the retained PDF or evidence of rights.
- Full-page processing starts only for an approved public publication, not for an intake submission.
- A generation becomes active only after every required page succeeds.
- Page URLs are immutable and versioned by generation.
- BookReader receives page number, image URL, width, and height from the active generation.
- The adapter owns BookReader initialization, navigation methods, event translation, and cleanup.
- The surrounding application owns catalogue metadata, access policy, fallback behavior, and publication lifecycle.
- The Viveiro Digital wiki may document or link to the reader but is not a runtime dependency.

This decision defines the target reader path. The current cover-only processing workflow remains active until the full-page generation implementation is completed and enabled deliberately.

## Alternatives Considered

### Keep the PDF iframe as the primary reader

This has the lowest implementation and storage cost and remains a required fallback. It does not provide Biblioteca-controlled page navigation, stable page-image URLs, predictable mobile behavior, or the BookReader interaction model.

### Render every PDF page in the browser

This avoids server-side derivative storage and processing jobs. Browser HTTP caches may reuse PDF bytes after a reload, but PDF.js parsing and canvas rendering still repeat because they are client memory. It also makes performance dependent on the device and does not provide the image manifest BookReader expects.

### Generate pages on the first reader request

This avoids upfront processing for rarely viewed publications, but makes the first reader wait, complicates concurrency and retries, and risks processing spikes. It is not appropriate for the initial public path.

### Keep the reader as a reusable package

This would preserve a framework-independent boundary, but no community requirement currently justifies the additional package maintenance and release surface. The reader is a Biblioteca application feature, so its integration boundary belongs in the application repository.

### Fork Internet Archive BookReader

A fork would provide deeper control but would transfer upstream rendering, browser, accessibility, and security maintenance to Biblioteca. The adapter approach preserves a reversible integration without taking ownership of the upstream implementation.

## Justification

The archive is modest in total page count and the measured derivative storage is operationally plausible. The benchmark also demonstrates that processing is expensive enough to require background execution, while page delivery is compact enough to benefit from CDN and browser caching.

Pre-generated page derivatives move repeated PDF parsing and rasterization out of every reader session. Shared immutable page URLs allow different clients to reuse CDN responses, while each browser still manages its own decoded image memory. Keeping the PDF preserves a simple access path when processing fails or when a user wants the original reading representation.

The decision also respects the existing publication lifecycle: unpublished submissions should not create public derivatives, and a failed replacement generation must not displace the last successful active generation.

## Consequences

Positive consequences:

- BookReader can provide ordered pages, spreads, zoom, thumbnails, and adjacent-page loading.
- Mobile clients perform less PDF parsing and rendering work.
- Page responses can be cached across clients through immutable CDN URLs.
- The original PDF remains available as a fallback and download path.
- Processing and access policy stay inside Biblioteca's existing publication boundaries.
- The integration can be replaced without redefining the catalogue or storage model.

Tradeoffs:

- Biblioteca must operate asynchronous full-page processing and retryable generation jobs.
- Page derivatives require additional storage and a cleanup/retention policy.
- Raster page images do not preserve all PDF-native semantics such as selectable text, links, and annotations.
- The BookReader dependency is AGPL-3.0 and requires legal/source-distribution review before production distribution.
- The current benchmark is local and does not yet establish mobile-device performance or final image quality.

## Links

- [Reading derivative inventory spike](../spikes/reading-derivative-inventory/report.md)
- [Measured rendering benchmark](../spikes/reading-derivative-inventory/benchmark.md)
- [BookReader integration path](../specs/bookreader-reading-path.md)
- [Page processing and asset lifecycle](../specs/page-processing-and-asset-lifecycle.md)
- [Current cover-only processing](./12-cover-only-processing-at-publication.md)
- [Internet Archive BookReader](https://github.com/internetarchive/bookreader)
