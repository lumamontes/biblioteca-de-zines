# Biblioteca Archive Baseline Evidence

Status: inventory calibration reviewed on 2026-09-24.

This document records the public-safe conclusions from the first archive
inventory run. It is evidence for the archive baseline, not a preservation
guarantee and not a claim that every catalogue record has an authorised
preservation copy.

## Observed Coverage

The inventory read the current catalogue through read-only Supabase requests
and scanned the confirmed local archive without moving, renaming, deleting,
downloading, or modifying source files.

| Observation | Result |
| --- | ---: |
| Local archive files observed | 310 |
| Structurally valid PDFs | 310 |
| Invalid PDFs | 0 |
| Catalogue records observed | 347 |
| Files matched to catalogue records | 310 |
| Catalogue records without a local file | 34 |
| Catalogue records with explicit `known-failure` status | 3 |
| Historical known failures retained as input | 33 |

Every observed local PDF received a relative path, byte size, SHA-256
checksum, PDF validation result, and match evidence. The persisted catalogue
slug was used as the primary matching key. Secondary URL, ID, title, and
filename evidence remains distinguishable from an exact slug match.

One unpublished record is retained under the separate local
`archive/unpublished/` directory. It is archive evidence only and must not be
included in the public reading catalogue.

Four other unpublished records are classified for this baseline as
`source-unavailable`. Their catalogue records remain in Supabase, but no local
preservation copy is available and they remain excluded from the public
reading catalogue.

## Evidence Boundaries

### Production evidence

- The catalogue snapshot came from read-only requests to the configured
  Supabase tables.
- Local file observations describe the bytes present in the archive directory
  during this run.
- PDF validation confirms structural readability only.

### Historical evidence

- The 33 known failures came from the classified monitor input.
- Known failures were retained and were not retried, downloaded, or rechecked
  during inventory.

### Not established by this run

- A local file is not automatically an authorised original.
- A valid PDF is not proof of consent, ownership, redundancy, or recoverability.
- A catalogue match does not establish whether the file is an original,
  reading copy, preview, or another derivative.
- The run does not establish correction, restriction, removal, or access
  decisions for contributors.
- The `form_uploads` snapshot exposes workflow-state evidence, but no confirmed
  relationship from a submission row to a retained file was inferred.

## Calibration Changes

The first calibration established the following rules for future runs:

- Persisted catalogue slugs remain the primary match key.
- URL, ID, title, and filename matches remain explicitly secondary evidence.
- Ambiguous relationships remain unresolved instead of being promoted to
  confirmed matches.
- Malformed catalogue rows are retained as errors while valid rows continue
  through matching.
- Drive file IDs are extracted from file URLs for secondary evidence; Drive
  folders are not treated as files.
- Comparison includes match method and evidence, not only the final status.
- Output safety resolves existing symlinks before checking repository
  boundaries.
- PDF validation records structural parse results independently of the file
  extension.

The current run is still marked `needs-review` in the private report because
the source-unavailable classifications and archive-status policy are evidence
to review, not automatic preservation decisions.

## Review Queue

The 34 catalogue records without local archive matches require manual review.
Thirty of those missing records are linked to retained historical restricted or
folder-link failures; the other four are unpublished records classified as
`source-unavailable`. Three additional catalogue records carry an explicit
`known-failure` status for historical external-source failures.
The review must distinguish at least:

- records that intentionally have no retained local file;
- records whose source or derivative is stored elsewhere;
- records whose local file has an ambiguous filename or relationship;
- records requiring a contributor, access, correction, restriction, or removal
  decision.

No storage migration, recovery attempt, permission change, or catalogue edit
should be based on the inventory alone.

## Risks and Unknowns

1. Local archive coverage is incomplete relative to the catalogue snapshot.
2. Historical availability failures remain unresolved and are not current
   availability results.
3. Authorisation and consent evidence is outside the inventory data.
4. Derivative status is not inferable from filenames or PDF validity.
5. The archive currently has fixity evidence, but no independent redundancy or
   recovery evidence was established.

## Prioritized Needs

1. **Access and rights:** establish how contributors request correction,
   restriction, removal, and access changes before recovery or migration.
2. **Archive custody:** define where authorised originals and unpublished
   preservation copies may be retained, with independent redundancy and
   recovery evidence.
3. **Submission and review:** document when a submitted file becomes a
   catalogue record, a public reading copy, or an authorised preservation
   source.
4. **Derivatives:** define how previews, reading copies, and other derivatives
   are labelled and related to catalogue records.
5. **Operational maintenance:** repeat inventory runs, compare manifests, and
   review new ambiguities or source failures without publishing private data.

These priorities provide evidence for validating or revising issues #107-#114;
they do not authorize changes to contributor records, permissions, or storage.

| Issue | Evidence to validate or revise |
| --- | --- |
| #107 Contributor communication and pilot handling | Access, consent, correction, restriction, and removal remain unresolved. |
| #108 Catalogue and access profile | Publication status is available, but archive and reader-access policy needs an explicit profile. |
| #109 Catalogue record migration | The 34 records without local files require a reviewed disposition before migration. |
| #110 Authorised originals | Fixity exists for observed bytes, but authorisation and independent redundancy do not. |
| #111 Submission and review workflow | `form_uploads` states are sampled, but submission-to-file relationships are not established. |
| #112 Reading derivatives | Original, reading copy, preview, and derivative roles are not currently evidenced. |
| #113 Pilot export and recovery | Historical failures and source-unavailable records need an authorised recovery path. |
| #114 Pilot evaluation and public-safe report | This document is the private-safe evidence summary; raw snapshots remain private. |

## Next Decisions

1. Retain the four unpublished `source-unavailable` classifications unless
   authorised source files become available.
2. Document the current submission, review, publication, storage, reading, and
   maintenance flows for issue #106.
3. Use the review results to validate or revise issues #107-#114.
4. Keep raw snapshots, manifests, and detailed reports private outside the
   repository.

## Source Artifacts

The detailed raw snapshot, normalized manifest, and machine-generated report
were produced outside the repository. This document intentionally contains
only the reviewed, public-safe conclusions from those artifacts.

## Current Application Flows

The following flow descriptions are implementation evidence derived from the
current application code and database migrations, not direct production
observation. The code evidence is in
`src/app/(main)/zines/apply/actions.ts`,
`src/app/(admin)/dashboard/actions.ts`,
`src/services/zine-import-service.ts`, and
`src/services/zine-service.ts`. The schema evidence is in
`supabase/migrations/20250123215138_addFormUploadsTable.sql`,
`supabase/migrations/20250123215146_addAuthorsTable.sql`, and
`supabase/migrations/20251226002136_addZinePagesAndImportFields.sql`. They
describe observed behavior, not a policy that the project has formally
approved.

### Sanitized Representative Shapes

The baseline uses these representative shapes without publishing real
contributor values, contact details, or private URLs:

- A submission record contains a title, author metadata, optional description,
  external PDF/cover URLs, publication flag, and a batch identifier.
- A catalogue record contains a stable slug, public metadata, publication flag,
  external PDF reference, import status, and author links.
- A local archive record contains a relative path, size, checksum, PDF
  validation result, and match evidence.
- A page derivative contains a zine ID, page number, R2 image URL, and import
  status; it is not treated as an original without further evidence.
- The account dependency is an authenticated Supabase user for the dashboard;
  the current code does not expose a separate maintainer role in this flow.

External source classes observed in the inventory are direct Drive file links,
Drive folder links, and non-Drive PDF URLs. Raw URLs and record values remain
in private snapshots only.

### Submission

1. A contributor submits one or more zine records through the public
   `/zines/apply` flow.
2. The form validates author, title, description, year, category, contact, and
   external file/image URL fields.
3. The server inserts each submission into `form_uploads` with
   `is_published = false` and a shared submission-batch identifier in `tags`.
4. A Telegram notification is sent to the configured Biblioteca de Zines
   submissions channel when the bot credentials are configured; an optional
   topic ID routes the notification within that channel.
5. The submission stores Google Drive URLs for PDF sources; this flow does not
   create a local PDF custody copy.

### Review and Catalogue Publication

1. The dashboard is operationally restricted to maintainers using one shared Supabase Auth account to keep administration simple and low-cost. The application checks authentication but does not enforce a separate role.
2. The dashboard loads all `form_uploads` rows and all `library_zines` rows. This
   includes the submission queue and history; publication is represented by the
   related catalogue row and publication flags rather than removing the
   original submission row.
3. An authenticated dashboard user can edit submission metadata, authors,
   Google Drive URLs, descriptions, and categories.
4. Maintainers manually review submissions one at a time, including checking
   that the submitted Google Drive PDF link is valid, before publishing.
5. Publishing a new upload copies its metadata into `library_zines`, generates
   a slug from the first author and title, links authors, merges categories,
   and sets the new catalogue row as published.
6. When a catalogue row already exists, the publish action merges categories
   and author links; the dashboard's separate republish action sets
   `library_zines.is_published = true`.
7. An existing catalogue record can be unpublished by changing
   `library_zines.is_published`.

Unpublishing changes the catalogue publication flag only. The observed code
does not delete the `form_uploads` row, delete an external source, delete R2
page derivatives, or create a removal/audit record. Editing a submission can
also update a related catalogue row by slug, but no version history is stored.

After publication, maintainers manually email the author to let them know that
the zine is available. This is an operational practice; the application
automates the Telegram submission notification but does not automate the
publication email.

### Current Catalogue Organization

The current catalogue is organized around a published `library_zines` record:

- **Identity:** numeric ID, UUID, unique slug, title, description, collection
  title, and publication year. The slug is generated as the first submitted
  author name followed by the normalized zine title, using lowercase strict
  `slugify` normalization: `<first-author>-<normalized-title>`.
- **Discovery:** category values in the `tags` JSON field, title full-text
  search, year filters, author relationships, and recent-publication ordering.
- **Available categories:** the current read-only Supabase `categories` query
  returned `Arte digital`, `Autobiográfico`, `Clube de Zines`, `Colagem`,
  `Crítica social`, `Educação`, `Espiritual`, `Experimental`, `Fantasia`,
  `Ficção científica`, `Filosofia`, `Fotografia`, `Humor`, `Ilustração`,
  `Infantil`, `Infantojuvenil`, `LGBTQIA+`, `Música`, `Poesia`, `Politico`,
  `Quadrinhos`, `Saúde Mental`, and `Terror`.
- **People:** `authors` records connected through the many-to-many
  `library_zines_authors` table. The current publication flow starts from the
  first submitted author when generating a slug, then links the parsed author
  list.
- **Public access:** `is_published` controls whether a catalogue record is
  returned by public catalogue, search, author, and detail queries.
- **File references:** `pdf_url` and `cover_image` are URL fields, normally
  pointing to external sources rather than managed source assets.
- **Processing:** `import_status` and `total_pages` describe the optional page
  import path; page images are represented separately in `zine_pages`.
- **History:** `created_at` and `updated_at` exist, but there is no record
  version history or publication-event history.

The submission table is a parallel, denormalized intake record rather than a
formal version of the catalogue record. It retains author/contact fields,
description, Google Drive PDF URL, cover URL, categories, publication flag,
and submission-batch metadata. The current dashboard relates submission and
catalogue rows by title when displaying them; the publication action itself
uses the submission ID and generated slug but does not create an explicit
foreign-key relationship between the two records.

The following concepts are therefore present but not cleanly separated in the
current organization: publication versus edition, collection versus series,
submitted file versus authorised original, reading copy versus preview,
processing event versus file version, and public access versus preservation or
reuse permission. Defining those distinctions and mapping the existing fields
to a provisional metadata/access profile is the scope of issue #108, not a
decision made by this baseline.

The implementation performs these publication steps as separate database
operations rather than one transaction. A failure between operations can leave
submission and catalogue state temporarily inconsistent and requires maintainer
review.

### Public Reading

- Catalogue, search, author, and detail queries filter `library_zines` by
  `is_published = true`.
- Public detail pages render the catalogue description, author links, metadata,
  and an iframe pointing at the stored `pdf_url`.
- Public author detail pages at `/authors/[slug]` show an author's catalogue
  entries and profile information from the author relationships.
- Unpublished records are therefore excluded from normal public catalogue and
  detail-page queries.

### Storage and Derivatives

| Domain object | Current evidence | Boundary |
| --- | --- | --- |
| Catalogue record | `library_zines` row | Describes a zine and its public metadata. |
| Submitted file reference | `form_uploads.pdf_url` | External URL supplied by the submitter; not a custody copy. |
| Catalogue PDF reference | `library_zines.pdf_url` | External URL used by the public PDF viewer. |
| Local preservation observation | Local archive manifest | Observed bytes and fixity evidence; not proof of authorisation or originality. |
| Reading derivative | `zine_pages` rows and R2 page objects | Created by the optional Google Drive import flow as PNG/JPEG page images. |
| Original, preview, or other derivative | No explicit relation in the current schema | Must not be inferred from filename, URL, or PDF validity. |

The Google Drive import path downloads a file, converts PDFs into page images,
uploads pages to R2, stores `zine_pages`, and updates `import_status`. It also
deletes existing page records and R2 objects before re-importing. The public
detail page currently reads `pdf_url`, so the relationship between R2 pages and
the public reading path requires confirmation before treating those pages as
the authoritative reading derivative.

### Accounts and Dependencies

- Supabase Auth email/password accounts protect the dashboard. Operationally,
  access is reserved for maintainers through a shared account; the current
  code checks for authentication but does not show a separate role or
  permission model.
- Supabase stores catalogue, author, submission, publication, and page metadata.
- Google Drive and other external URLs provide submitted or catalogue file
  sources.
- Cloudflare R2 is used by the optional page-derivative import path.
- Telegram is used for new-submission notifications when configured.
- Vercel/Next.js runs the public site and server actions using environment
  configuration.

### Rights and Maintenance Unknowns

The code exposes no explicit workflow for recording or enforcing:

- contributor consent or authorisation for local retention;
- correction requests and version history;
- restriction or removal requests and their propagation to derivatives;
- retention periods for unpublished submissions;
- deletion of external source files or R2 derivatives;
- independent backups, redundancy, restoration tests, or custody transfer;
- which authenticated maintainers may approve publication or perform removal.

The current observable maintenance mechanisms are dashboard edits,
publish/unpublish actions, optional Drive import/re-import, the external
resource monitor, and the private local inventory. These mechanisms should not
be treated as a complete rights or preservation process.
