# Visual Publication Reader: Findings

**Status: historical spike; superseded as an engine recommendation by [the
BookReader engine selection ADR](../decisions/15-reader-engine-selection.md).**

## Fixtures

| Fixture | URL or description | CORS | Range requests | Browser/device | Result |
| --- | --- | --- | --- | --- | --- |
| PDF.js sample | `https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf` | `*` | `Accept-Ranges: bytes` | Desktop Chrome | Loaded and rendered |
| CORS/format failure | `https://example.com/` | Not usable as a PDF source | n/a | Desktop Chrome | Failed cleanly |
| Image sequence | Six generated SVG page URLs and `https://placehold.co/600x840/png?text=Page+1` through `Page+4` | n/a | n/a | Desktop Chrome and 390px viewport | Loaded and navigated |

## Measurements

| Scenario | First page | Adjacent page | Peak memory | Retained pages | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| PDF slide mode | 112-135 ms warm load | Visible page rendered | To measure | Three page surfaces requested | 14-page sample |
| PDF page-turn mode | 112-135 ms warm load | Visible page rendered | To measure | Three high-resolution page surfaces requested; wrappers retained | Canvas pages feed animation |
| Image page-turn mode | Immediate | Immediate | To measure | HTML page surfaces retained | Six-page fixture |

## Dependency audit

| Dependency | Role | License | Browser/runtime notes | Decision |
| --- | --- | --- | --- | --- |
| PDF.js | PDF source rendering | Apache-2.0 | Browser CORS; worker required; range support is source-dependent | Use as a source/rendering adapter candidate |
| StPageFlip | Page-turn animation | MIT | Browser DOM/canvas; page surfaces are retained by the animation layer | Use behind a disposable renderer mount, subject to mobile testing |

## Findings

### Direct PDF rendering

The PDF.js sample loaded directly from the browser with a `200` response,
`Access-Control-Allow-Origin: *`, `Accept-Ranges: bytes`, and a 1,016,315-byte
payload. The reader obtained the page count and rendered page 1 into a canvas
without using the generic PDF.js viewer. Warm reloads reached the loaded state in
approximately 112-135 ms in desktop Chrome; the first cold run was approximately
974 ms.

This proves the direct-PDF path is technically possible for a
browser-consumable external URL. It does not prove that every external PDF will
work. The sample produced one full `200` request during this run, so range
behavior must be tested with larger and differently structured PDFs before
treating partial loading as guaranteed.

### Page-turn integration

StPageFlip rendered the PDF canvas as a page-turn surface and exposed visible
cover/interior behavior. The same library rendered the image fixture through
HTML page surfaces. Navigation advanced the reader state and switching between
slide and page-turn modes worked after isolating the library in a child mount.

Important integration constraint: `PageFlip.destroy()` removes its parent
element. The production reader must mount the dependency beneath a disposable
renderer element and must never give the animation library ownership of the
reader shell.

### Image representation

Six generated SVG image pages and four externally hosted `placehold.co` image
pages loaded through the same page-turn renderer. Both fixtures supported
navigation from page 1 to page 2, exposed adjacent page surfaces, and remained
usable at a 390px viewport. This validates ordered images as a viable second
representation rather than requiring a separate reader shell.

### Source restrictions and fallback

Loading `https://example.com/` as a PDF failed with `Failed to fetch`, left the
custom reader empty, and enabled an explicit "Open standard viewer" action for
the separately configured fallback URL. An invalid host failed similarly. This
validates the need for an explicit host-provided standard-viewer fallback. The
spike does not attempt to proxy failed sources.

## Recommendation at the time of the spike

The original spike recommended a layered reader architecture:

1. Keep the reader shell framework-independent and own navigation state, layout,
   loading, errors, and fallback.
2. Use a PDF source adapter based on PDF.js core APIs to render only visible and
   adjacent pages into page surfaces.
3. Support ordered image pages through the same page surface contract; mode
   switching works for the image fixture as well as PDFs.
4. Use StPageFlip as the initial page-turn candidate behind a disposable mount,
   while retaining slide mode as a first-class renderer.
5. Treat external-PDF compatibility as conditional on CORS and source-server
   behavior.
6. Add production bundle splitting and memory measurements before accepting this
   stack for a published reader.
7. Keep page-render errors observable and release non-adjacent PDF canvases; a
   production reader must retain only the surfaces required for the current
   interaction.

This recommendation was superseded after the separate user evaluation selected
Internet Archive BookReader as the better reading experience.

## Downstream ticket changes

The original downstream tickets had these changes:

- Ticket 02 must make the renderer mount lifecycle an explicit contract and must
  not let a renderer destroy the reader shell.
- Ticket 03 should validate larger and differently structured external PDFs,
  including a source that actually exercises range requests.
- Ticket 04 can use the shared page surface contract; it does not need a separate
  reader shell.
- Ticket 05 should evaluate StPageFlip on mobile before making it the production
  default and must retain slide mode as a fallback mode.
- Ticket 06 must add bundle splitting, worker deployment, canvas cleanup, and
  retained-page measurements to its acceptance criteria.
- Tickets 07-08 remain blocked until the source and renderer constraints are
  validated against Biblioteca fixtures.

The spike did not establish a production performance budget, exercise a large
PDF that visibly requires range requests, validate mixed/landscape/rotated PDF
fixtures, or complete real-device touch testing. Those remain explicit gaps in
the historical experiment and must not be inferred from this browser run.
