# Biblioteca Reader Viewer

This app is the isolated public viewer for the Biblioteca de Zines. It owns the
Internet Archive BookReader runtime and keeps its jQuery, vendor CSS, browser
listeners, and lifecycle outside the main Biblioteca application document.

The viewer is a rendering surface, not a catalogue or persistence service. It
does not query Supabase, select page generations, process PDFs, or decide public
access. The Biblioteca API supplies an access-filtered complete manifest and the
explicit PDF fallback.

## Routes

- `/viewer/v1/:slug`: standalone reader surface.
- `/embed/v1/:slug`: focused iframe surface for Biblioteca pages and third-party
  embeds.
- `?branding=biblioteca`: optional presentation branding for an embed; it does
  not grant access.

The embedding page controls iframe dimensions. V1 has no parent-page control or
resize-message protocol.

## Local Development

From this directory:

```bash
pnpm dev
```

The viewer runs on `http://localhost:4100`. Run the web app separately on
`http://localhost:3000` and set this local viewer environment:

```env
NEXT_PUBLIC_READER_API_ORIGIN=http://localhost:3000
```

The web app must point back to the viewer origin and enable the local rollout
flags when testing a publication:

```env
READER_VIEWER_ORIGIN=http://localhost:4100
READER_BETA_ENABLED=true
READER_VIEWER_ENABLED=true
READER_EMBED_ENABLED=true
READER_BETA_ALLOW_ALL=true
```

Do not put Supabase sessions, service-role keys, or other application secrets in
the viewer. It communicates with the public-reader API without credentials.

## Runtime Boundary

The flow is:

```text
viewer route
  -> public-reader API
  -> validated complete page manifest
  -> BookReader adapter
  -> page navigation, zoom, thumbnails, and fallback
```

`src/infrastructure/bookreader-adapter.ts` is the vendor boundary. It loads the
pinned BookReader assets, translates the manifest, delegates navigation, wires
page/error events, resizes after mount, and cleans up the vendor instance.

`src/components/reader.tsx` owns the viewer lifecycle and fallback state. The
viewer must keep the PDF fallback when the endpoint, page generation, page
assets, or BookReader initialization fails.

## Verification

```bash
pnpm check-types
pnpm test
pnpm build
```

The browser suite requires the Playwright binary and covers the isolated viewer,
embed route, BookReader initialization, navigation, resize lifecycle, and PDF
fallback behavior.

## Canonical Documentation

- [Engine selection](../../docs/decisions/15-reader-engine-selection.md)
- [BookReader reading path](../../docs/specs/bookreader-reading-path.md)
- [Isolated viewer and embed specification](../../docs/specs/isolated-bookreader-viewer-and-embed.md)
- [Beta operations](../../docs/operations/bookreader-viewer-beta.md)
- [Beta evaluation gate](../../docs/operations/bookreader-viewer-beta-evaluation.md)
- [Viewer release decision](../../docs/decisions/14-viewer-release-and-page-derivatives.md)
