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
| Catalogue records represented by historical known failures | 3 |
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
Thirty are already explained by the retained historical failure classifications.
Four are unpublished records classified as `source-unavailable`.
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
