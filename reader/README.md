# Visual Publication Reader

This directory is the standalone production shell for the visual publication reader. The public boundary in `src/contract.ts` accepts publication representations, metadata, explicit provider and mode configuration, and an explicit standard-viewer fallback. It does not import React or expose a renderer dependency.

The `demo/` application uses ordered image fixtures and an intentionally incompatible PDF fixture to demonstrate ready, failure, and fallback states. `createPdfLoader` adapts PDF.js core's `getDocument` API to the same lazy page contract: the reader renders the visible page first, then requests the previous and next pages. The adapter's default renderer creates browser canvas page surfaces; tests and alternate renderers can provide `renderPage`.

## Direct PDF requirements

The PDF URL must be browser-consumable from the reader's origin. The source server must return `Access-Control-Allow-Origin` for that origin (and allow redirects to preserve CORS). PDF.js can use range loading when the response supports `Accept-Ranges: bytes` and exposes the relevant range responses and headers through CORS. A server that blocks CORS, redirects without CORS, rejects range requests, or serves non-PDF bytes can fail during source loading or an individual page render.

The standard viewer URL is supplied separately in `ReaderInput.fallback`. The reader never silently substitutes it for a failed custom load; the host chooses `useFallback()` after receiving a source or page failure.

```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```
