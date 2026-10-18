# BookReader Viewer Beta

The BookReader viewer is disabled unless the rollout environment explicitly
enables it. The same deployment may serve the main Biblioteca application and
the viewer origin, but the viewer is loaded in an iframe and the vendor runtime
remains confined to that document.

The viewer host must route to the dedicated `/viewer/v1/:slug` entrypoint, while
the public embed host/routes use `/embed/v1/:slug`. These are replaceable viewer
surfaces, not new catalogue or persistence services. The core application origin
remains responsible for the public-reader API.

Withdrawn or otherwise inaccessible publications return an unavailable response
and do not expose a PDF fallback. A PDF fallback is provided only after the
public access decision succeeds.

## Deployment

The viewer is deployed by the same Next.js application as the catalogue; it does
not require a second catalogue or backend service. Run `pnpm build` and deploy
the resulting application normally, then point `viewer.biblioteca-de-zines.com.br`
at that deployment. Set `NEXT_PUBLIC_READER_API_ORIGIN` to the core Biblioteca
origin in the viewer deployment and set `READER_VIEWER_ORIGIN` to the viewer
origin in the API deployment. The versioned viewer and embed routes remain
independently replaceable within this shared deployment.

## Controls

Set these environment values for a beta deployment:

- `READER_VIEWER_ORIGIN`: canonical viewer origin, normally
  `https://viewer.biblioteca-de-zines.com.br`.
- `READER_VIEWER_ENABLED=true`: the single feature flag for the main reader and
  embed route. The UI and API still require a complete active page generation
  before exposing the reader for a publication.

Disable `READER_VIEWER_ENABLED` to return all publications to the explicit PDF
fallback path.

## Embed

The versioned embed URL is:

`https://viewer.biblioteca-de-zines.com.br/embed/v1/<canonical-slug>`

Embeds are unbranded by default. Add `?branding=biblioteca` when attribution is
desired. The parameter changes presentation only and never grants access.

The embedding site controls the iframe dimensions. V1 has no parent-page control
or resize-message protocol.

## Verification

Before enabling a beta publication:

1. Confirm the publication is public and has a complete active page generation.
2. Confirm the retained PDF URL still works.
3. Confirm the canonical slug and any historical aliases resolve to the same
   publication.
4. Open the normal reader and confirm the first page, adjacent navigation,
   fallback link, and mobile layout.
5. Open the versioned embed URL without branding and with
   `branding=biblioteca`.
6. Confirm a publication without a complete page generation receives the PDF
   fallback.
7. Confirm the main application does not request BookReader assets until the
   viewer iframe is opened.
8. Validate the rollout configuration through the application readiness check
   and confirm the viewer origin uses HTTPS.

## Monitoring

Review public-reader request logs and delivery metrics for:

- Viewer and BookReader initialization failures.
- Missing or failed page image requests.
- Incomplete-generation and PDF fallback responses.
- Viewer/API response rates and rate-limit responses.
- Viewer and derivative bandwidth.
- Embed host and origin distribution.
- Time to first visible page, adjacent-page navigation, memory use, and cache
  reuse on representative desktop and mobile devices.

Run the repeatable delivery probe against a beta API endpoint with
`READER_PERFORMANCE_URL`:

`READER_PERFORMANCE_URL=https://biblioteca-de-zines.com.br/api/public-reader/<slug> pnpm reader:performance`

Set `READER_PERFORMANCE_OUTPUT` to persist the JSON result. The probe measures
manifest delivery, first-page delivery, adjacent-page delivery, revisit
delivery, response cache headers, status, elapsed time, and bytes. Browser
memory and mobile-device timing still require a Playwright/device run.

## Rollback

1. Set `READER_VIEWER_ENABLED=false` to return all reader surfaces to their
   non-vendor fallback behavior.
2. Verify the retained PDF remains accessible.
3. Do not delete active page generations during a viewer rollback.
4. Preserve failure and bandwidth evidence for the follow-up decision.

General public exposure requires performance evidence, abuse review, and
legal/source-distribution review for the AGPL-3.0 Internet Archive BookReader
dependency.

The operational release gate is `pnpm reader:beta:evaluate <evidence.json>`.
Keep its input and output with the private deployment evidence, not in the
public repository. A passing gate records `expand`; incomplete evidence records
`pause`, and lost fallback or an abuse signal records `rollback`.

The current traffic guard is a bounded best-effort process-local safeguard.
Production deployment should add a trusted-platform/shared rate limiter before
broad public exposure; the in-process guard must not be treated as a distributed
quota system. Metadata response size is reported separately from derivative
bandwidth; use the delivery probe and storage/CDN metrics for derivative
bandwidth.
