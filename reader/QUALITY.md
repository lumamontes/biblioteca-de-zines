# Reader Quality Baseline

This is the measured baseline for the standalone reader at ticket 06. It is not a guarantee for every external source or device.

## Budgets

| Metric | Local budget | Measurement | Scope |
| --- | ---: | ---: | --- |
| First visible page | <= 1,000 ms cold, <= 250 ms warm | 974 ms cold and 112-135 ms warm | PDF.js sample in desktop Chromium, from feasibility run |
| Adjacent-page readiness | <= 1,000 ms after navigation | Immediate for generated image fixture; PDF adjacent render was observable but not timed separately | Local fixtures |
| Retained page records | <= 3 | 3 after navigation settles | Reader core tests |
| Retained page surfaces | <= 3 | 3, released pages are reported by the test surface | Reader core tests |
| Animation | >= 50 fps target | Not instrumented in this environment | Requires browser performance tracing |

The budgets are acceptance targets, not measurements of a universal device class. Network, PDF complexity, image dimensions, source headers, and device memory can change the result.

## Coverage

- Chromium behavior was exercised through the standalone demo and Vitest contract tests.
- Pointer and touch are configured through PageFlip's `useMouseEvents`, `mobileScrollSupport`, and `swipeDistance` options. Automated real-device gesture validation was not available here.
- Cover, interior spread, back-cover, odd-page-count, narrow-viewport, and responsive layout rules are covered by core tests. Page images remain `object-fit: contain`, so landscape and mixed dimensions are not distorted.
- PDF rotation is preserved by PDF.js viewport rendering; a rotated or mixed-dimension PDF fixture was not available for a browser assertion.
- Reduced motion disables PageFlip shadows and reduces flip duration to 1 ms. Slide mode remains available as the simpler fallback.
- Safari/mobile Safari and Android Chrome were not run in this environment. Do not advertise those as tested support until device/browser runs are recorded.

## Known limits

- External PDFs still require browser-compatible CORS and may or may not use range requests.
- Very large canvases can exceed device memory before the reader can help; the reader bounds the active working set but cannot control PDF.js or browser decode internals outside it.
- The standard viewer is explicit: failures publish `failure` or `page-failure`, and the host must call `useFallback()` or provide its own action. No provider is silently substituted.
