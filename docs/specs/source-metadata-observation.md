# Source Metadata Observation

Status: proposed first version; implementation follows review of the data model
and migration shape.

## Goal

Create a private, append-only record of what Biblioteca observes when it
acquires or inspects a source file. The first use is PDF sources submitted by
URL or associated with a publication, but the model must not make a URL or PDF
the definition of a publication.

This gives the project useful technical evidence while community consultation is
still deciding which descriptive, rights, access, and identity values belong in
the public catalogue.

## Domain Boundary

`source_metadata` is not:

- the public catalogue record;
- the original or a preservation repository;
- a rights or permission record;
- a complete PREMIS implementation;
- a replacement for page-generation or storage records.

One row represents one timestamped observation of one acquired source/file
asset. A later acquisition or re-extraction creates another row rather than
silently replacing the previous observation. The latest successful observation
can be selected for operational use, but history remains available.

The observation may be linked to a `library_zines` publication, a `form_uploads`
submission, or only a source reference when the relationship is not yet
confirmed.

## First-Version Data

### Identity and relationship

- local observation id;
- linked publication id when known;
- linked submission id when known;
- asset kind: `source`, `reading-copy`, `preview`, or `derivative`;
- observation timestamp;
- extractor version.

### Acquisition

- source URI as received;
- acquisition method, such as generic HTTP, Google Drive, or direct file;
- acquisition timestamp;
- acquisition status and failure reason;
- source-provided filename;
- source-provided size when available;
- HTTP status and redirect outcome where applicable.

### Technical and format observations

- received byte size;
- media type declared by the response;
- media type detected from the bytes;
- format-identification status;
- format identifier or detected media type;
- storage key or controlled local reference when a copy exists;
- PDF page count;
- per-page width, height, and orientation;
- text-layer status and extraction status.

The source-declared MIME type and filename extension must remain distinct from
the type identified by inspection. A valid PDF signature is evidence of a PDF
file, not evidence of who created it or whether it may be published.

### Embedded PDF metadata

Store the following as source-observed values, preferably in a structured JSON
object with the PDF tool and extraction timestamp:

- title;
- author;
- subject;
- creator;
- producer;
- creation date;
- modification date.

These values must never automatically overwrite public title, author, date,
description, language, or rights fields.

### Fixity

The first version must record fixity as a contextual observation, not as one
unqualified checksum:

- algorithm, preferably SHA-256 for new records;
- digest value;
- context, such as `acquisition`, `validation`, `storage-check`, or `delivery`;
- calculation timestamp;
- check status and comparison detail when a prior value exists.

A checksum detects byte changes. It does not prove authorization, authenticity,
custody, or successful long-term preservation.

### Provenance and visibility

- provenance note;
- whether each value was source-supplied, system-observed, or tool-produced;
- uncertainty/status where the observation is incomplete;
- internal visibility state.

Private contact information and rights evidence must not be copied into public
catalogue metadata through this table.

## Processing Rules

1. Run extraction after a source is successfully acquired, and expose the same
   extractor as a batch operation for existing accessible sources.
2. Record failed acquisition and extraction attempts with a status such as
   `unreachable`, `not_pdf`, `invalid_pdf`, `protected`, or
   `extraction_failed`.
3. Do not block publication solely because optional observations fail.
4. Do not run OCR, semantic classification, language inference, rights
   inference, or automatic catalogue rewriting in the first version.
5. A derived cover, page image, or reading copy receives its own asset identity
   and links back to the observed source; it does not overwrite the source row.
6. Re-running a new extractor version creates a new observation.

## Preservation Alignment

The shape is intentionally informed by preservation guidance without claiming
to implement all of it:

- PREMIS supports separating objects, events, agents, and rights. This first
  version records a narrow object/source observation; a separate event model is
  deferred until the project has real audit and repair workflows.
- NDSA Levels support establishing fixity at ingest, but repeated checks,
  logging, replication, and repair must not be claimed until implemented.
- DPC and Library of Congress fixity guidance require algorithm, context, and
  comparison history rather than an isolated checksum.
- BagIt fields become relevant only if Biblioteca adopts BagIt for a real
  transfer or storage workflow.

Research validation: `research_notes/Source metadata digital preservation
validation.md` in the companion research repository.

Primary references:

- [PREMIS Data Dictionary 3.0](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf)
- [NDSA Levels of Digital Preservation](https://www.ndsa.org/publications/levels-of-digital-preservation/)
- [DPC Fixity and checksums](https://www.dpconline.org/handbook/technical-solutions-and-tools/fixity-and-checksums)
- [Library of Congress: File Fixity and Data Integrity](https://blogs.loc.gov/thesignal/2014/04/protect-your-data-file-fixity-and-data-integrity/)
- [RFC 8493 BagIt](https://www.rfc-editor.org/rfc/rfc8493.html)

## Deferred Work

- periodic fixity-check history and repair decisions;
- replica and storage-location inventory;
- complete PREMIS object/event/agent/rights relationships;
- registry-backed format risk and characterization reports;
- signed manifests or authenticated provenance;
- public display or export of extracted values;
- rights, access, reuse, language, place, genre, and identity policy.

## Implementation Sequence

1. Add the `source_metadata` table and generated database types.
2. Implement a domain-level PDF observation extractor using the existing source
   acquisition and PDF rendering primitives.
3. Add unit tests for valid PDFs, invalid files, inaccessible sources, embedded
   metadata, page geometry, text-layer status, and fixity.
4. Integrate the extractor into the approved-publication processing workflow
   without making it a publication gate.
5. Add a batch command for existing accessible sources.
6. Add internal reporting for duplicates, failed sources, missing text layers,
   and metadata conflicts.
