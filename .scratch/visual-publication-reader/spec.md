# Visual Publication Reader

Status: ready-for-agent

## Problem Statement

Biblioteca de Zines currently presents publications through a basic external PDF viewer. This preserves access to the file but provides a generic document experience rather than an intentional online reading experience for short-form visual publications.

Readers want to view zines as visual works: see the original page composition, move through pages naturally, use touch and pointer gestures, and experience a clean interface that keeps attention on the publication. The current viewer does not provide a consistent page-turn interaction, responsive spreads, progressive page loading, or a reusable integration contract for other websites.

The existing catalogue generally has only an external PDF URL. Some sources may not allow browser-side fetching because of CORS, redirects, authentication, or missing range-request support. The improved experience must therefore enhance compatible sources without assuming that Biblioteca or the reader owns, transforms, proxies, or preserves every PDF.

## Solution

Create an independent, open-source visual publication reader for short-form fixed-layout publications.

The reader will expose a framework-independent public contract around a visual publication representation. It will support external PDF URLs and ordered page images, while keeping source acquisition and visual rendering behind replaceable adapters.

The default presentation will be a realistic page-turn interaction using an existing open-source animation mechanism when the feasibility spike validates one. A slide transition will be available as an alternative mode. The reader will support pointer dragging on desktop, touch gestures on mobile, responsive one-page/two-page layouts, and real-zine cover behavior.

If the custom reader cannot consume or render a representation, the host application will show the existing standard PDF viewer. Consumers will explicitly configure providers and fallback behavior; the reader will not silently try multiple providers or require a paid proxy service.

The first deliverable is a feasibility spike. Production implementation begins only after direct external-PDF rendering, page-turn integration, mobile behavior, and fallback behavior have been evaluated against representative fixtures.

## User Stories

1. As a reader, I want to see a zine's original page composition, so that the online experience respects the artist's visual work.
2. As a reader, I want the first page to appear progressively, so that I can begin reading without waiting for the entire publication to load.
3. As a reader, I want to move from page to page with a realistic page-turn interaction, so that reading feels closer to handling a physical zine.
4. As a desktop reader, I want to drag a page with my mouse or pointer, so that I can turn it through a physical-feeling gesture.
5. As a mobile reader, I want to swipe between pages, so that the reader works naturally on a touch device.
6. As a reader, I want an alternative slide transition, so that I can use a simpler presentation when page-turn animation is not desirable.
7. As a reader, I want to see the front cover as a single page, so that the publication opens like a real zine.
8. As a reader, I want interior pages to form spreads on a sufficiently wide screen, so that the layout resembles the physical publication.
9. As a reader on a narrow screen, I want spreads to become single-page views, so that the content remains readable without shrinking excessively.
10. As a reader, I want the back cover to be presented as a single page, so that the end of the publication retains its physical structure.
11. As a reader, I want adjacent pages to load before I navigate to them, so that normal page turns feel immediate.
12. As a reader, I want the reader to avoid loading all high-resolution pages at once, so that long or image-heavy zines remain usable on mobile devices.
13. As a reader, I want to switch to the standard PDF viewer, so that I retain access to the familiar document presentation when I prefer it.
14. As a reader, I want the standard viewer to be available when the custom reader cannot load a source, so that a reader failure does not remove access to the publication.
15. As a reader, I want a clear loading state, so that I understand whether the publication is still being prepared.
16. As a reader, I want a clear failure state and fallback action, so that I am not left with a blank reader when a page or source cannot be rendered.
17. As a reader, I want the reader to preserve page order, so that the publication is not accidentally rearranged by a responsive layout.
18. As a reader, I want common landscape and mixed-dimension pages to remain visible without distortion, so that unusual page layouts are not damaged by the reader.
19. As a reader, I want rotated PDF pages to display in their intended orientation, so that the publication remains legible.
20. As a reader, I want the reader controls to remain usable on desktop and mobile, so that navigation is not dependent on one input method.
21. As a reader who prefers reduced motion, I want a less animated presentation when the chosen renderer supports it, so that the experience remains comfortable.
22. As a website consumer, I want to pass an external PDF URL, so that I can improve reading without moving the PDF into new storage.
23. As a website consumer, I want to pass ordered page-image URLs, so that I can use pre-generated page derivatives when they become available.
24. As a website consumer, I want to provide publication metadata and a standard-viewer URL, so that the reader can present useful context and preserve a reliable fallback.
25. As a website consumer, I want to configure the initial reader mode, so that I can choose the default presentation appropriate to my publication.
26. As a website consumer, I want to configure page layout behavior, so that I can override responsive defaults when a publication has known editorial requirements.
27. As a website consumer, I want the reader to report source and rendering failures, so that I can observe why the standard viewer was used.
28. As a website consumer, I want to choose providers explicitly, so that the reader does not create unexpected network, storage, or processing costs.
29. As a website consumer, I want to use the reader without adopting a specific frontend framework, so that the component can reach websites beyond React.
30. As a website consumer, I want the reader's core contract to be independent of renderer-specific APIs, so that I can replace a renderer without rewriting the integration.
31. As a website consumer, I want the default solution to require no paid service or API key, so that small independent projects can adopt it.
32. As a website consumer, I want the reader to work without a mandatory backend proxy, so that deployment remains simple and inexpensive.
33. As an open-source maintainer, I want the project to evaluate licenses before adopting dependencies, so that the distribution model remains compatible with the project goals.
34. As an open-source maintainer, I want a demo application with representative fixtures, so that contributors can evaluate the reading experience outside a catalogue application.
35. As an open-source maintainer, I want source adapters and renderers to be replaceable, so that future image, IIIF, or other representations can be supported without replacing the reader shell.
36. As an open-source maintainer, I want the reader to be tested against incompatible external sources, so that its limitations and fallback behavior are documented honestly.
37. As a Biblioteca de Zines maintainer, I want to integrate the reader without changing the catalogue's ownership of publication files, so that the reading feature remains separate from preservation and storage concerns.
38. As a Biblioteca de Zines maintainer, I want to keep the existing standard viewer available, so that a custom-reader regression does not block publication access.
39. As an artist, I want the first version to preserve my publication rather than reflowing it into generic text, so that the work remains recognizably mine.

## Implementation Decisions

- The project is a standalone open-source reader, not a feature whose public contract is owned by Biblioteca de Zines or Viveiro Digital.
- The domain is a visual publication reader, not a general ebook reader. Traditional reflowable books, bookmarks, reading persistence, and semantic book navigation are outside the product goal.
- The core public contract is framework-independent and must not import React or expose renderer-library types.
- The primary integration seam is the reader boundary: a host provides a publication representation, reader configuration, publication metadata, and a standard-viewer fallback.
- External PDF URLs and ordered page-image URLs are supported representations for the first public contract.
- A PDF representation must be rendered directly in the browser when possible; persistent PDF-to-image conversion is not a prerequisite for the external-PDF path.
- The direct-PDF path is conditional on browser security and source-server behavior. Cross-origin sources must provide suitable CORS headers. Efficient progressive loading may depend on HTTP range-request support.
- The reader must not include a mandatory server-side proxy, paid API, storage service, or API key.
- Source acquisition and page rendering are separate concepts. A source adapter makes a representation available as ordered pages; a renderer presents those pages in a reader mode.
- Consumers explicitly configure provider selection. The reader must not silently try multiple providers or create hidden fallback processing costs.
- The standard viewer is an explicit host-provided fallback and user-selectable alternative. A custom-reader failure must not remove access to the original publication.
- The default mode is realistic page-turn interaction, subject to feasibility validation of an existing open-source animation mechanism.
- The implementation must prefer a robust existing page-turn library over implementing page-turn physics from scratch.
- A slide renderer/mode is required as an alternative to page-turn interaction and as a potential reduced-motion or low-capability path.
- The page-turn dependency is an implementation detail behind the renderer contract. Its API must not become the reader's public API.
- Page layout follows real-zine semantics: the front cover is single, interior pages form spreads when the viewport permits, and the back cover is single.
- The layout must fall back to single-page presentation on narrow screens and must support a host override when publication-specific behavior is known.
- The reader progressively loads the first visible page, preloads adjacent pages, and avoids retaining every high-resolution page in memory.
- Pointer dragging on desktop and touch gestures on mobile are required interactions. Simple navigation controls may supplement gestures.
- Zoom and pan are conditional on the selected rendering stack. Fit-to-reader behavior is expected; unrestricted zoom/pan must not be built through excessive custom logic for v1.
- Keyboard navigation is not a v1 requirement unless it is provided naturally by the selected renderer or control layer without significant custom implementation.
- Common mixed dimensions, landscape pages, and rotated pages are part of the supported visual boundary. Right-to-left direction and password-protected PDFs are deferred.
- The first implementation phase is a feasibility spike, not production reader development.
- The feasibility spike must compare direct PDF rendering, PDF-to-page-turn integration, ordered image rendering, mobile behavior, source restrictions, and standard-viewer fallback.
- Candidate dependencies must be evaluated for license compatibility, browser support, bundle/runtime cost, accessibility implications, and ability to be replaced.
- Sharing, page cropping, frame selection, attribution overlays, and social-media export are post-v1 capabilities.

## Testing Decisions

- Tests should verify externally visible reader behavior and contracts rather than implementation details of PDF.js, page-turn libraries, or framework adapters.
- The core reader contract must be testable with fixture representations that do not require a browser PDF engine.
- Source adapters must be tested with compatible and incompatible source conditions, including CORS failure, redirects, missing range support, and failed page retrieval.
- Renderer adapters must be tested for page navigation, current-page reporting, cover handling, spread behavior, mode switching, cleanup, and failure reporting.
- The reader shell must be tested across loading, ready, navigating, source failure, renderer failure, fallback, and destroy/unmount states.
- Layout tests must cover front cover, interior spreads, back cover, odd page counts, narrow viewports, wide viewports, mixed dimensions, landscape pages, and rotated pages.
- Interaction tests must cover pointer dragging, touch swiping, navigation controls, mode switching, and the standard-viewer action.
- Performance tests must measure first visible page time, adjacent-page readiness, memory growth, retained page count, and animation smoothness on representative desktop and mobile fixtures.
- Browser tests must include current Chromium-based browser, Safari/mobile Safari, and Android Chrome where practical.
- Reduced-motion behavior should be tested when the selected renderer supports a non-animated or reduced-animation path.
- Accessibility tests for v1 focus on usable controls, labels, focus behavior supplied by the chosen solution, and the absence of animation-only access to essential actions. Full semantic text navigation is not a v1 requirement.
- The demo application is a test fixture and integration contract, not merely marketing documentation.
- Biblioteca de Zines integration tests should remain at the host boundary and verify that a reader failure exposes the configured standard viewer.
- Existing Biblioteca de Zines end-to-end test conventions should be reused for the integration rather than coupling the standalone project's core tests to Supabase or catalogue internals.

## Out of Scope

- Building custom page-turn physics from scratch.
- Replacing the existing standard PDF viewer before the custom reader is proven.
- Requiring all external PDFs to be directly consumable despite browser CORS restrictions.
- Adding a mandatory backend proxy or paid PDF-processing service.
- Persisting PDF files or page derivatives as part of the standalone reader.
- Treating generated page images as the original publication.
- A general EPUB or ebook reading platform.
- Reflowable text layout.
- Bookmarks, reading history, resume position, or user accounts.
- Semantic table-of-contents navigation.
- Full-text search or text selection as a launch requirement.
- Right-to-left publication direction.
- Password-protected PDF support.
- Social sharing, page screenshots, frame cropping, attribution overlays, or share-image generation.
- Automatic frame/panel detection.
- Support for every frontend framework in the first release.
- Silent automatic provider switching.
- A guarantee that attribution survives screenshots or downstream reposting.

## Further Notes

- The current Biblioteca de Zines codebase uses an iframe-based standard PDF viewer for public reading. The main branch also contains a planned page-image derivative path, but the public reader does not yet consume that path consistently.
- The current catalogue's external PDF URL should remain an input representation rather than becoming a new storage contract for the standalone reader.
- The direct PDF hypothesis is technically plausible: PDF.js can fetch a URL, use a worker, request ranges when supported, obtain individual pages, and render visible pages into canvases. It remains unproven for the desired page-turn experience and must be measured rather than assumed.
- A page-turn library such as StPageFlip is a candidate renderer dependency, not an architectural commitment. It accepts page-like images or HTML rather than PDFs directly, so the spike must test the bridge between PDF page rendering and animation.
- A successful first release is not defined by supporting every PDF. It is defined by delivering a polished experience for browser-consumable sources and gracefully preserving access through the standard viewer for incompatible sources.
- The future sharing capability should be designed as a separate distribution experience with deep links, selected page or region exports, and configurable artist/catalogue attribution. It should not enlarge the v1 reader contract prematurely.
