# BookReader Viewer Beta

The BookReader viewer is disabled unless the rollout environment explicitly enables it. The same deployment may serve the main Biblioteca application and the viewer origin, but the viewer is loaded in an iframe and the vendor runtime remains confined to that document.

## Controls

Set these environment values for a beta deployment:

- `READER_VIEWER_ORIGIN`: canonical viewer origin, normally `https://viewer.biblioteca-de-zines.com.br`.
- `READER_VIEWER_ENABLED=true`: permits the selected publications to use the viewer from the main Biblioteca reader.
- `READER_EMBED_ENABLED=true`: permits selected publications to use the embed route.
- `READER_BETA_SLUGS`: comma-separated publication slugs. An empty value allows every public publication once the corresponding surface is enabled; keep it populated during beta.
- `READER_BETA_TOKENS`: optional comma-separated short-lived beta tokens accepted through the embed URL's `beta` parameter. Keep these temporary and rotate them after the beta.

The viewer and embed surfaces are independently controlled. Disable `READER_EMBED_ENABLED` to stop embeds without disabling the normal reader. Disable both viewer flags to return all publications to the explicit PDF fallback path.

## Embed

The versioned embed URL is:

`https://viewer.biblioteca-de-zines.com.br/embed/v1/<canonical-slug>`

Embeds are unbranded by default. Add `?branding=biblioteca` when attribution is desired. The parameter changes presentation only and never grants access.

The embedding site controls the iframe dimensions. V1 has no parent-page control or resize-message protocol.

## Verification

Before enabling a beta publication:

1. Confirm the publication is public and has a complete active page generation.
2. Confirm the retained PDF URL still works.
3. Confirm the canonical slug and any historical aliases resolve to the same publication.
4. Open the normal reader and confirm the first page, adjacent navigation, fallback link, and mobile layout.
5. Open the versioned embed URL without branding and with `branding=biblioteca`.
6. Confirm a publication outside `READER_BETA_SLUGS` receives the unavailable state.
7. If tester tokens are configured, confirm an embed without a valid token receives the unavailable state.
8. Confirm the main application does not request BookReader assets until the viewer iframe is opened.

## Monitoring

Review public-reader request logs and delivery metrics for:

- Viewer and BookReader initialization failures.
- Missing or failed page image requests.
- Incomplete-generation and PDF fallback responses.
- Viewer/API response rates and rate-limit responses.
- Viewer and derivative bandwidth.
- Embed host and origin distribution.
- Time to first visible page, adjacent-page navigation, memory use, and cache reuse on representative desktop and mobile devices.

## Rollback

1. Set `READER_EMBED_ENABLED=false` to stop third-party embeds.
2. Set `READER_VIEWER_ENABLED=false` to return the main reader path to its non-vendor fallback behavior.
3. Verify the retained PDF remains accessible.
4. Do not delete active page generations during a viewer rollback.
5. Preserve failure and bandwidth evidence for the follow-up decision.

General public exposure requires performance evidence, abuse review, and legal/source-distribution review for the AGPL-3.0 Internet Archive BookReader dependency.

The current traffic guard is a bounded best-effort process-local safeguard. Production deployment should add a trusted-platform/shared rate limiter before broad public exposure; the in-process guard must not be treated as a distributed quota system.
