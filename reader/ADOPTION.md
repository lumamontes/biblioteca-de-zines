# Adopting the Reader

This guide describes the supported first integration. The package is a small reader shell, not a file repository, PDF proxy, catalogue client, or React component.

## Choose one provider explicitly

The host supplies one representation and selects its matching provider:

```ts
type PublicationRepresentation =
  | { kind: 'pdf'; url: string }
  | { kind: 'image-pages'; pages: readonly { url: string; alt?: string }[] };

type ReaderProvider = 'direct-pdf' | 'ordered-images';
```

Use `direct-pdf` only with a PDF URL. Use `ordered-images` only with an already ordered list of page-image URLs. A mismatch is a failure. The reader does not silently switch providers, proxy a source, convert a PDF on a server, or incur hidden processing costs.

Page images are a reading representation or derivative. Passing them does not claim that they are the retained original publication bytes.

## Ordered images

Ordered images need no PDF dependency:

```ts
import {
  createReader,
  imagePagesLoader,
  imagePageSurface,
  createPageTurnRenderer,
} from '@biblioteca-de-zines/visual-publication-reader';

const reader = createReader(input, {
  'ordered-images': imagePagesLoader,
  pageSurface: imagePageSurface(),
});
const renderer = createPageTurnRenderer();
```

The core loads the current page first and prepares its immediate neighbors. It retains a three-page working set and releases surfaces outside that set. The host still owns the reader container and must destroy both `reader` and `renderer` on unmount.

## Direct external PDFs

PDF.js is an adapter, not a guarantee that an arbitrary URL is browser-readable:

```ts
import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createPdfLoader, createReader } from '@biblioteca-de-zines/visual-publication-reader';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
const reader = createReader(input, {
  'direct-pdf': createPdfLoader(pdfjs),
});
```

The source server must:

- return PDF bytes and `Access-Control-Allow-Origin` for the reader origin, including redirects;
- permit the browser's PDF.js requests and expose relevant response headers;
- support `Accept-Ranges: bytes` when efficient range loading is expected; and
- allow the requested URL to be fetched without credentials that the adapter cannot supply.

CORS failure, an HTML response, an authenticated source, a redirect without compatible CORS, rejected range requests, a malformed PDF, or a failed page render can produce `failure` or `page-failure`. Range support is source-dependent and is not a promise that only a small part of a PDF will be transferred. Very large pages can still exceed browser or device memory.

Password-protected PDFs, right-to-left direction, reflowable books, text search, bookmarks, reading history, and unrestricted zoom/pan are outside this first package.

## Fallback is explicit

Every input includes the standard viewer URL. On a failure, the host decides how to present it:

```ts
const state = await reader.load();
if (state.status === 'failure' || state.status === 'page-failure') {
  showError(state.message, () => reader.useFallback());
}

if (reader.getState().status === 'fallback') {
  window.location.assign(reader.getState().fallback.url);
}
```

`useFallback()` changes reader state; it does not navigate, open a window, or fetch the standard viewer. The host should keep an ordinary link available as an independent accessibility and reliability path. A custom-reader failure must never remove access to the original publication.

## Layouts, modes, and gestures

`mode` is `page-turn` or `slide`. Page-turn is the first browser renderer and uses StPageFlip behind the `ReaderRenderer` interface. Slide mode is a first-class host-rendering option and a simpler reduced-motion/low-capability choice.

`layout` is `responsive`, `single-page`, or `spread`:

- `responsive` uses one page on narrow viewports, interior spreads on wide viewports, and keeps the front and back covers single;
- `single-page` always presents one page; and
- `spread` requests wide interior spreads while covers remain single.

PageFlip supplies pointer dragging, touch/swipe gestures, and its browser interaction handling. Previous/Next controls remain required host controls and must not be replaced by gestures alone. The core exposes `next()`, `previous()`, `goTo()`, `setMode()`, and `getVisiblePages()` so a different renderer can be used without exposing PageFlip APIs.

The first supported adapter is browser DOM/canvas, not a framework adapter. React, Vue, Svelte, and other frameworks can wrap the boundary but are not package dependencies or supported components in this release. The Biblioteca integration remains at its host boundary: it passes publication URLs/derivatives and keeps ownership of catalogue, preservation, and the existing standard viewer.

## Browser and device support

The checked path is Chromium with the local Vite demo. Real Safari, mobile Safari, Android Chrome, real-device gesture latency, and large range-request PDFs were not available in the feasibility validation. Consumers must validate their own source headers, browser matrix, page dimensions, and memory profile before replacing their standard viewer.

Run the adopter demo from this directory:

```bash
pnpm install
pnpm dev
```

The demo has an image-pages fixture and an intentionally incompatible PDF fixture. It demonstrates ready, loading, failure, explicit fallback, page-turn, slide, cover, spread, and narrow viewport behavior without depending on the Biblioteca application.

## License and dependencies

The package is GPL-3.0-only, matching the repository license. The runtime dependencies selected by the feasibility findings are:

| Dependency | Purpose | License |
| --- | --- | --- |
| `pdfjs-dist` | Direct PDF loading and canvas page rendering | Apache-2.0 |
| `page-flip` | Optional page-turn browser renderer | MIT |

The package does not require a paid service, API key, mandatory backend, or proxy. Distributors must preserve the applicable notices for the package and its dependencies; consult the installed dependency license files when redistributing a bundled build.
