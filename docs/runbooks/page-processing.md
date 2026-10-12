# Page Processing Runbook

This runbook covers two separate workflows:

- Explicit migration and diagnostic commands are **cover-only** and render one first-page WebP.
- The publication queue is the current full page-generation workflow and writes complete `zine_pages` generations for the reader.

## Storage Configuration

The production configuration uses one public delivery bucket:

```env
CLOUDFLARE_R2_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=biblioteca-de-zines-pb
NEXT_PUBLIC_R2_PUBLIC_URL=https://assets.biblioteca-de-zines.com.br

# Application/API configuration
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
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
pnpm migrate:pdf-covers -- --report /tmp/biblioteca-zines-monitor/resource-report.json --apply
```

The default monitor report path is `/tmp/biblioteca-zines-monitor/resource-report.json`. Pass `--report` when the report was written elsewhere. Candidates with `inaccessible`, `invalid`, or `invalid-input` monitor outcomes are excluded and the command prints the exclusion count.

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

Production processing runs in `.github/workflows/process-pending-zines.yml` with Node 22, frozen pnpm dependencies, a limit of 10 jobs, and concurrency 2. The workflow requires `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, and `NEXT_PUBLIC_R2_PUBLIC_URL`. Repository dispatch additionally requires the GitHub token configured by the application deployment; no service-role or R2 secret is sent to the browser.

The authenticated HTTP route additionally requires `CRON_SECRET`:

```text
GET /api/internal/process-zines
Authorization: Bearer <CRON_SECRET>
```

## Verification Queries

The fields below have intentionally different meanings:

- `cover_image`: active cover URL served by the catalogue.
- `pdf_url`: current source PDF URL used for cover processing.
- `processed_pdf_url`: processed-source marker for the PDF that produced the active generated cover; it is not the active cover URL.
- `import_status`: cover/processing status; it is not proof that page derivatives exist.

Check a publication's current cover and processed source:

```sql
select
  id,
  cover_image as active_cover_url,
  pdf_url as source_pdf_url,
  processed_pdf_url as processed_source_marker,
  import_status,
  is_published
from library_zines
where id = <zine_id>;
```

Publication queue page-generation verification:

```sql
select generation_id, page_number, image_url
from zine_pages
where zine_id = <zine_id>
order by generation_id, page_number;
```

For a cover-only run, record the `zine_pages` count before and after processing and confirm it is unchanged:

```sql
select count(*) as future_page_derivative_rows
from zine_pages
where zine_id = <zine_id>;
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

## Manual Verification Checklist

Run these checks with a test publication before production migration and attach the output to the change record:

1. Render one existing form-upload PDF locally with `pnpm generate:form-upload-cover`; confirm it writes only the requested local WebP and does not change Supabase or R2.
2. Run one controlled published-zine queue job with `pnpm process:pending-zines -- --limit 1 --concurrency 1`; confirm the full page generation completes, `zine_pages` rows are active and ordered, and the generated cover is delivered from the configured public R2 domain.
3. Republish an unchanged PDF and confirm the queue reuses the complete page generation and generated cover according to the page-generation lifecycle.
4. Change the PDF URL and confirm the queue creates and activates a new page generation; retain the previous successful generation until replacement is complete.
5. Remove a custom cover and confirm the cover workflow generates a fallback cover; before removal, confirm a valid custom cover remains unchanged.
6. Run migration dry run with the reviewed monitor report, inspect exclusions and candidates, then apply one `--only-id` candidate before any all-candidate apply.
7. Compare the active cover, source PDF URL, processed-source marker, R2 object metadata, and `zine_pages` state using the verification queries above.
8. For explicit cover-only migration and diagnostic commands, confirm no command creates, updates, or deletes `zine_pages` rows or page-generation objects. Do not apply this expectation to the publication queue.

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
