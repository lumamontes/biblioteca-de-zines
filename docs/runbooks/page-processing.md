# Page Processing Runbook

This runbook covers local cover migrations, queue processing, verification, and recovery. Full page derivatives are a future capability.

## Storage Configuration

The production configuration uses one public delivery bucket:

```env
CLOUDFLARE_R2_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=biblioteca-de-zines-pb
NEXT_PUBLIC_R2_PUBLIC_URL=https://assets.biblioteca-de-zines.com.br
```

Never commit credentials. The old `biblioteca-de-zines` bucket is not part of the active processing path.

`form_uploads` do not create page derivatives. Processing starts when a submission becomes a `library_zine`.

## Database Migrations

Apply migrations through the normal Supabase deployment workflow:

```bash
supabase db push
```

Relevant migrations:

- `20251226002136_addZinePagesAndImportFields.sql`: retained future zine page/import fields.
- `20261011000000_addZineProcessingJobs.sql`: generation-aware publication pages and processing queue.
- `20261011010000_addFormUploadPageProcessing.sql`: historical form-upload processing state and staging pages.
- `20261012000000_removeLegacyFormUploadPages.sql`: removes the unused form-upload processing state and staging table.
- `20261011020000_addProcessedZineSource.sql`: records the PDF URL used by the active public generation.

Never edit an applied migration. Add a new timestamped migration for every later schema change.

## Explicit Published-Zine Processing

Dry run one published zine:

```bash
pnpm migrate:pdf-covers -- --only-id <zine_id>
```

Apply processing:

```bash
pnpm migrate:pdf-covers -- --only-id <zine_id> --apply
```

Apply all eligible published-zine covers after reviewing the dry run:

```bash
pnpm migrate:pdf-covers -- --apply
```

The command downloads the current source, renders only the first page into an optimized WebP cover, and records the processed PDF source and processing status.

To render only the first page of an existing intake PDF locally, without changing the database or uploading an asset:

```bash
pnpm generate:form-upload-cover --upload-id 123 --output /tmp/form-upload-123-cover.webp
```

The command is dry-run by default. `--only-id` applies to published `library_zines`.

## Published-Zine Queue Processing

Process pending jobs locally:

```bash
pnpm process:pending-zines -- --limit 10 --concurrency 2
```

The authenticated internal route is:

```text
GET /api/internal/process-zines
Authorization: Bearer <CRON_SECRET>
```

The route claims one leased job, processes one generation, and records completion or retryable failure.

The workflow supports repository dispatch, manual dispatch, and a scheduled fallback. The application can request an immediate repository dispatch when GitHub Actions credentials are configured.

## Verification Queries

Check a publication's current cover:

```sql
select id, pdf_url, processed_pdf_url, cover_image, import_status, is_published
from library_zines
where id = <zine_id>;
```

Future page-derivative verification:

```sql
select generation_id, page_number, image_url
from zine_pages
where zine_id = <zine_id>
order by generation_id, page_number;
```

## Safe Reprocessing Rules

- Same source URL and complete generated cover: reuse; do not rerender.
- Changed source URL and generated fallback cover: create a new cover generation.
- Missing or incomplete generated cover: regenerate.
- Metadata-only edit: do not process.
- Keep the current successful generation until its replacement is verified.
- Delete old generated cover objects only after the new cover is active.

## Cover Verification

- A provided cover URL must remain unchanged.
- An empty cover uses the first PDF page as the default.
- A PDF change regenerates a generated fallback cover.
- A cover-only edit does not rerender the PDF.

## Troubleshooting

### R2 XML authorization error

The stored URL is probably the private S3 API endpoint, not the public asset domain. Verify `NEXT_PUBLIC_R2_PUBLIC_URL` points to `https://assets.biblioteca-de-zines.com.br` for public assets.

### Blank PNGs

Verify the renderer uses the same `@napi-rs/canvas` implementation as PDF.js. Inspect object dimensions and pixel statistics before publishing.

### Changed PDF was reused

Compare the old and new `pdf_url` values before the update. A changed value must invalidate reuse and create a new generation.

### Processing failed after partial upload

The generation cleanup path should remove its private objects. Confirm the generation is not active before deleting anything manually.

### Old objects remain

Do not empty a bucket blindly. Classify `form-uploads/` and `zines/` objects against active database generations, migrate published objects to the public bucket, then delete only verified or orphaned generations.
