# Page Processing Runbook

This runbook covers local migrations, queue processing, verification, and recovery for page and cover derivatives.

## Storage Configuration

The target production configuration uses:

```env
CLOUDFLARE_R2_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=biblioteca-de-zines
CLOUDFLARE_R2_PUBLIC_BUCKET_NAME=biblioteca-de-zines-pb
NEXT_PUBLIC_R2_PUBLIC_URL=https://assets.biblioteca-de-zines.com.br
```

Never commit credentials. The private bucket must not have an R2.dev public URL or public custom domain.

The two-bucket adapter and public-copy path are currently being implemented. Until that work is complete, do not change the existing bucket URL configuration or manually publish generated objects.

## Database Migrations

Apply migrations through the normal Supabase deployment workflow:

```bash
supabase db push
```

Relevant migrations:

- `20251226002136_addZinePagesAndImportFields.sql`: legacy zine page/import fields.
- `20261011000000_addZineProcessingJobs.sql`: generation-aware publication pages and processing queue.
- `20261011010000_addFormUploadPageProcessing.sql`: form-upload processing state and private staging pages.

Never edit an applied migration. Add a new timestamped migration for every later schema change.

## Explicit Form-Upload Processing

Dry run one submission:

```bash
pnpm migrate:pdf-covers -- --form-upload-id 1084
```

Apply processing:

```bash
pnpm migrate:pdf-covers -- --form-upload-id 1084 --apply
```

The command downloads the current source, renders pages, writes the private generation, and records `processed_pdf_url`, `active_page_generation`, `total_pages`, and `processing_status`.

The command is dry-run by default. `--only-id` applies to published `library_zines`; use `--form-upload-id` for submissions.

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

The dispatch service currently references `.github/workflows/process-pending-zines.yml`. Verify that workflow exists before relying on automatic dispatch; it is currently not checked into this repository.

## Verification Queries

Check a submission:

```sql
select
  id,
  pdf_url,
  processed_pdf_url,
  processing_status,
  active_page_generation,
  total_pages
from form_uploads
where id = 1084;
```

Check staged pages:

```sql
select generation_id, page_number, image_url
from form_upload_pages
where form_upload_id = 1084
order by generation_id, page_number;
```

Check a publication:

```sql
select id, source_upload_id, pdf_url, active_page_generation, total_pages, import_status, is_published
from library_zines
where id = <zine_id>;
```

## Safe Reprocessing Rules

- Same source URL and complete generation: reuse; do not rerender.
- Changed source URL: create a new generation.
- Missing processed source URL: regenerate.
- Metadata-only edit: do not process.
- Keep the current successful generation until its replacement is verified.
- Delete old private objects after successful public promotion.
- Delete old public objects only after the new public generation is active.

## Cover Verification

- A provided cover URL must remain unchanged.
- An empty cover uses the first PDF page as the default.
- A PDF change regenerates a fallback cover.
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
