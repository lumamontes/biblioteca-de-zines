# Visual Publication Reader Spike

This is a disposable feasibility lab for ticket 01. It does not define the production package API.

## Run

```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```

Open the Vite URL shown in the terminal. The default fixture is Mozilla's public PDF.js sample PDF. Replace it with a representative external PDF URL to test CORS, redirects, range requests, and rendering behavior.

## What to measure manually

- Browser network panel: `206 Partial Content`, `Accept-Ranges`, redirects, and CORS headers.
- Time from submit to first visible page.
- Time from navigation to adjacent page readiness.
- Canvas count and memory while navigating through the document.
- Pointer dragging and touch behavior in page-turn mode.
- Spread and cover behavior at desktop and mobile viewport sizes.
- Whether page-turn animation remains visually credible while pages render lazily.
- Behavior when the PDF cannot be fetched: the demo reports the failure and the host would use its standard-viewer URL.

## Known spike limitations

- The demo has no production fallback URL because the source URL is user-provided.
- The image-source path is exercised by the local generated image fixture; a real externally hosted image sequence still needs to be tested with representative headers and dimensions.
- The page-turn library may retain HTML page surfaces even when PDF canvases are cleaned up. This must be measured before choosing it for production.
- Desktop pointer dragging and real-device touch gestures still need manual validation. The demo enables the candidate library's mouse and mobile settings and has been checked at an emulated mobile viewport.
