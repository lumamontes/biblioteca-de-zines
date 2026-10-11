# Visual Publication Reader

`@biblioteca-de-zines/visual-publication-reader` is a framework-independent reader core for short, fixed-layout visual publications. It is independently consumable by a website; it is not part of the Biblioteca catalogue or storage boundary.

The public boundary in `src/contract.ts` accepts publication representations, metadata, explicit provider and mode configuration, and an explicit standard-viewer fallback. It does not import React or expose a renderer dependency. The first supported browser adapter is the DOM-based adapter exported from `./browser`: PDF.js provides direct PDF page loading, ordered images provide image loading, and StPageFlip provides the optional page-turn renderer.

## Install and run

```bash
pnpm add @biblioteca-de-zines/visual-publication-reader pdfjs-dist page-flip
```

The package has no required backend, API key, paid service, or frontend framework. `pdfjs-dist` and `page-flip` are peer choices only in the architectural sense: use them when selecting the corresponding adapters, and bundle/configure the PDF.js worker in the host application.

```ts
import { createReader, imagePagesLoader } from '@biblioteca-de-zines/visual-publication-reader';

const reader = createReader({
  publication: { kind: 'image-pages', pages: pagesFromYourCatalogue },
  configuration: { provider: 'ordered-images', mode: 'page-turn', layout: 'responsive' },
  metadata: { title: 'A zine', creator: 'A zineiro' },
  fallback: { url: '/zines/a-zine.pdf', label: 'Open standard viewer' },
}, { 'ordered-images': imagePagesLoader });

reader.subscribe((state) => renderYourHostUi(state));
await reader.load();
```

For a complete browser integration, including PDF.js worker setup, page surfaces, the page-turn renderer, controls, and fallback action, see [`ADOPTION.md`](./ADOPTION.md). The runnable adopter fixture is in [`demo/`](./demo/).

The `demo/` application uses ordered image fixtures and an intentionally incompatible PDF fixture to demonstrate ready, failure, and fallback states. `createPdfLoader` adapts PDF.js core's `getDocument` API to the same lazy page contract: the reader renders the visible page first, then requests the previous and next pages. The adapter's default renderer creates browser canvas page surfaces; tests and alternate renderers can provide `renderPage`.

## Direct PDF requirements

The PDF URL must be browser-consumable from the reader's origin. The source server must return `Access-Control-Allow-Origin` for that origin (and allow redirects to preserve CORS). PDF.js can use range loading when the response supports `Accept-Ranges: bytes` and exposes the relevant range responses and headers through CORS. A server that blocks CORS, redirects without CORS, rejects range requests, or serves non-PDF bytes can fail during source loading or an individual page render.

The standard viewer URL is supplied separately in `ReaderInput.fallback`. The reader never silently substitutes it for a failed custom load and never tries another provider. The host chooses `useFallback()` after receiving a source or page failure, or can present the fallback as an independent user action.

## Quality and support limits

The quality baseline and the measurements made in this ticket are recorded in [`QUALITY.md`](./QUALITY.md). The core keeps a three-page working set (current page plus immediate neighbors), releases page surfaces before eviction, and cleans PDF.js documents on reader destruction or reload.

The supported interaction path is PageFlip's pointer/mouse input on desktop and touch/swipe input on mobile, with Previous/Next controls as a non-gesture path. The checked browser path is the local Chromium/Vite demo. Safari, mobile Safari, Android Chrome, real-device touch latency, and large range-request PDFs were not available in this environment and remain consumer validation requirements rather than claims of support.

The package follows this repository's GPL-3.0-only license. PDF.js is Apache-2.0 and StPageFlip is MIT; their notices and license terms remain applicable when those dependencies are distributed. See [`ADOPTION.md`](./ADOPTION.md) for the dependency and integration boundary.

```bash
pnpm install
pnpm test
pnpm build
pnpm build:package
pnpm pack:check
pnpm dev
```
