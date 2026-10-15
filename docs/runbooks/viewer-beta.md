# Isolated Viewer Beta

The viewer is deployed independently from `apps/viewer` by `.github/workflows/deploy-viewer.yml`. Configure the Vercel project to use the `apps/viewer` root, and configure `NEXT_PUBLIC_READER_API_ORIGIN` in its production environment. The workflow requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_VIEWER_PROJECT_ID` repository secrets.

## Rollout controls

The public-reader API is the server-side authority for rollout:

```env
READER_VIEWER_ENABLED=true
READER_EMBED_ENABLED=false
READER_BETA_PUBLICATION_SLUGS=selected-slug,another-slug
```

`READER_VIEWER_ENABLED` and `READER_EMBED_ENABLED` are independent kill switches. `READER_BETA_PUBLICATION_SLUGS` restricts both surfaces when set. Disabling either surface returns an unavailable response and does not delete page generations or the PDF fallback.

## Recovery

1. Set the affected feature flag to `false` in the web application's deployment environment.
2. Redeploy or restart the web application so the API reads the new value.
3. Confirm the original PDF remains reachable from the publication page.
4. Review API 4xx/429 responses, viewer failures, fallback usage, and derivative bandwidth before re-enabling the surface.

Page objects use generation-versioned immutable URLs and long-lived cache headers. API responses remain `no-store` because publication access and the active generation can change.
