# `source_metadata` Digital Preservation Validation

Date: 2026-10-17

## Scope

This note validates a proposed `source_metadata` record for Biblioteca de
Zines against primary or official digital-preservation guidance. No
`source_metadata` table or migration currently exists in the repository. The
recommendation below therefore treats it as a future record associated with a
specific source/file asset, not as a replacement for the publication record,
storage system, or complete PREMIS implementation.

The existing catalogue proposal already separates publication metadata from
file/access evidence and says not to claim preservation semantics from a URL or
checksum alone ([catalogue information architecture](../docs/catalogue-information-architecture.md),
sections "Proposed Metadata Structure" and "Open Standards Strategy"). The
preservation sources support retaining that boundary.

## Findings From Authoritative Sources

### PREMIS

The Library of Congress PREMIS Data Dictionary models preservation information
around **objects**, **events**, **agents**, and **rights**, with relationships
between them. It is not merely a list of descriptive file properties.

Relevant implications:

- A file/object needs a stable local identifier and enough technical
  characteristics to identify and manage it.
- Fixity is a property of an object observation: retain the message-digest
  algorithm, value, and the context/date of calculation rather than one
  unqualified `checksum` string.
- Format information should identify the format and the source/authority of
  identification. A filename extension or MIME type supplied by a source is
  evidence, not necessarily a verified format identification.
- An event is appropriate for ingest, validation, format identification,
  virus scanning, derivation, migration, or fixity checking when the Biblioteca
  actually needs an audit trail. Events need their type, time, outcome/detail,
  and links to the affected object and responsible agent/tool.
- PREMIS rights and agents should not be invented merely because a source URL
  is public. Rights/access claims require their own evidence and scope.

Source: [PREMIS Data Dictionary for Preservation Metadata, version 3.0,
Library of Congress](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf)
(data model and entity chapters; official landing area:
[loc.gov/standards/premis](https://www.loc.gov/standards/premis/)).

### NDSA Levels of Digital Preservation

The NDSA Levels are an assessment and planning resource, not a schema. Their
file-fixity and storage expectations support recording enough evidence to show
what happened at ingest and during later checks. The current NDSA publication
page identifies version 2.1 and provides the matrix, implementation guidance,
and assessment resources.

Relevant implications:

- At the first practical level, establish fixity on ingest, either by checking
  a supplied value or creating one.
- Higher levels require regular fixity checks, logs, auditability, malware
  checking, multiple copies, and the ability to repair from a known-good copy.
- Therefore a first table may record a baseline and check result, but it must
  not imply that the Biblioteca already provides repeated audits, replication,
  or repair.
- Storage location, copy/replica identity, and check history become necessary
  when the project implements those higher-level controls.

Source: [NDSA Levels of Digital Preservation, current official publication
page](https://www.ndsa.org/publications/levels-of-digital-preservation/),
especially the matrix and [Implementation Guidelines and Working
Definitions](https://osf.io/4ctsv/). The page states that version 2.1 was
released in March 2026 and that earlier versions remain available.

### DPC Digital Preservation Handbook

The DPC Handbook describes digital preservation as sustaining access over time,
and its fixity guidance distinguishes detection of change from proof of
authenticity or permission.

Relevant implications:

- A checksum can establish whether bytes changed, but does not explain the
  change or grant rights.
- Checksums are useful at receipt/transfer, for monitoring stored files, and
  for verifying delivery to users. Record which of those contexts a value
  belongs to.
- Deliberate transformations such as migration produce a new checksum and
  should be connected to the transformation event.
- Fixity checks should be repeatable and logged if the project claims ongoing
  preservation assurance.

Sources: [DPC Digital Preservation Handbook, 2nd
edition](https://www.dpconline.org/handbook) and its [Fixity and
checksums](https://www.dpconline.org/handbook/technical-solutions-and-tools/fixity-and-checksums)
chapter. The chapter explicitly describes ingest, storage monitoring, user
delivery, regular checking, logs, and repair contexts.

### Library of Congress fixity and preservation guidance

The Library of Congress Signal guidance, linked from the DPC fixity chapter,
describes file fixity and data integrity as controls for detecting unintended
change. The relevant operational distinction is the same as the DPC guidance:
the digest needs a stated algorithm, baseline/context, and later comparison;
it is not a complete provenance or rights record.

Source: [Protect Your Data: File Fixity and Data Integrity, Library of
Congress](https://blogs.loc.gov/thesignal/2014/04/protect-your-data-file-fixity-and-data-integrity/).
The LOC site may return an access challenge to automated clients, so the DPC
chapter is also cited where it links and summarizes this LOC guidance.

### BagIt RFC 8493

BagIt is relevant if Biblioteca later transfers or stores a source as a bag.
It defines packaging and validation, not the whole preservation metadata model.
For BagIt 1.0, a bag requires `bagit.txt`, a `data/` payload directory, and at
least one payload manifest. A valid bag has successfully verified manifest
checksums. Optional `bag-info.txt` fields include source organization,
description/provenance, bagging date, external identifier, size, and group
identity.

Relevant implications:

- A `source_metadata` row can retain the bag identifier, manifest algorithm,
  manifest/check result, and transfer date if BagIt is used.
- `bag-info.txt` fields are transfer/package context; they should not be
  confused with the publication's creator, title, rights, or authoritative
  preservation event.
- RFC 8493 requires support for SHA-256 and SHA-512 in BagIt 1.0 and notes
  that manifest integrity is not protection against active attacks. Do not
  represent a validated bag as proof of authorization or authenticity beyond
  the evidence actually held.

Source: [RFC 8493, The BagIt File Packaging Format
(V1.0)](https://www.rfc-editor.org/rfc/rfc8493.html), sections 1.1, 2.1,
2.2, 2.4, and 3.

## Field Validation

The following is the recommended boundary for a first `source_metadata` record.
Names are illustrative local names, not a requirement to adopt PREMIS XML or
BagIt field names verbatim.

| Preservation concern | First version: must-have or strongly recommended | Later enhancement | Rationale |
| --- | --- | --- | --- |
| Local identity | `id`; `zine_id` or publication/holding reference; `asset_kind` (`source`, `reading-copy`, `preview`, `derivative`); `observed_at` | Version graph, persistent identifiers, intellectual-entity links | A digest or URL is not enough to identify which asset is being described. Keep the asset distinct from the publication. |
| Source acquisition | `source_uri` or submission reference; acquisition method/channel; acquisition time; source-provided filename; source-provided size if available; acquisition status | Source agent/contact, transfer package ID, BagIt bag ID, chain-of-custody steps, acquisition event objects | Provenance begins with where and how bytes were obtained. Avoid storing private contact data in a public-facing source row unless its visibility is explicit. |
| Technical metadata | byte size; media type as received; filename/path as received; storage key or controlled local location; basic page count only when actually observed | Creation/modification timestamps, byte order/encoding, embedded metadata, image/PDF characteristics, tool and software versions | These are repeatable observations of the received file, not claims about the zine's bibliographic identity. |
| Fixity | `fixity_algorithm`; `fixity_value`; `fixity_context` (`acquisition`, `validation`, `storage-check`, `delivery`); `fixity_calculated_at`; validation/check status | Multiple digests; periodic check records; repair source/copy; signed manifests; fixity event table | DPC and BagIt require algorithm/value/context-aware comparison. A lone checksum column cannot distinguish a baseline from a later check. Prefer SHA-256 or SHA-512 for new records. |
| Provenance | source/reference captured verbatim; `provenance_note`; observed-vs-supplied distinction; visibility; uncertainty/status | Full provenance graph; linked agents; custody transfers; immutable evidence packages | URLs establish a source reference, not custody, authorization, authenticity, or permission. Preserve uncertainty rather than normalizing it away. |
| Preservation events | Current processing/check status and timestamps are enough for the first version if no audit requirement exists | Separate event table with event type, datetime, outcome, detail, tool/version, agent, input/output asset links | PREMIS events are useful when there is a real preservation workflow. Do not create synthetic event history for existing snapshots. |
| Format identification | received media type/extension; identification status (`unverified`, `identified`, `failed`); identifying tool/source when identification is performed | Registry identifier (for example PRONOM/PUID), version, characterization report, format risk/support assessment | Separate source-supplied type from tool-identified format. PREMIS expects preservation-relevant format information and its provenance. |
| Access | separate states for discovery, reading, download, preservation, replication, and reuse; scope and evidence/source for each; public/private visibility | Rights basis, permissions/restrictions, expiry/review dates, embargo workflow, PREMIS rights entity | Public reachability is not permission. Access is multidimensional in the repository's existing domain model. |

## Recommended First-Version Shape

The first version should be a **file/source observation record**, not a full
preservation repository database. At minimum it should support:

```text
id
publication_or_holding_id
asset_kind
source_uri_or_submission_id
acquisition_method
acquired_at
source_filename
byte_size
received_media_type
storage_key
fixity_algorithm
fixity_value
fixity_context
fixity_calculated_at
fixity_status
format_identification_status
format_identifier_or_media_type
format_identified_at
provenance_note
visibility
access_state_or_access_reference
observed_at
created_at
updated_at
```

The exact names and nullability need to follow the local schema conventions.
The important constraints are semantic:

1. A source URL is an acquisition reference, not proof of custody.
2. A checksum is a fixity observation, not proof of rights, authenticity, or
   successful preservation.
3. A derived cover or reading copy gets its own asset identity and can link to
   its source; it should not overwrite the source observation.
4. If a field is supplied by a sender, observed by Biblioteca, or produced by a
   tool, retain that distinction.
5. Do not require PREMIS event history until the project has a workflow that
   creates and uses those events.

## Defer Until the Workflow Exists

- A complete PREMIS object/event/agent/rights graph.
- Periodic fixity audit history, repair decisions, and replica-level storage
  evidence.
- BagIt packaging identifiers and manifests, unless BagIt is selected for an
  actual transfer or storage workflow.
- Registry-backed format risk assessment and detailed characterization.
- Cryptographic signatures or authenticated provenance.
- Preservation planning fields for migration, emulation, or format policy.
- Detailed rights statements that imply permissions without a documented
  source, scope, and reviewer.

## Conclusion

The proposal is valid if `source_metadata` remains narrow: one record for the
identity, acquisition evidence, technical observations, baseline fixity,
format-identification status, provenance, and access evidence of a specific
asset. The first version should not attempt to be PREMIS, BagIt, a storage
inventory, and a rights-management system at once. Add event, replica, package,
and rights entities when Biblioteca implements the corresponding operational
controls and can populate them from real evidence.

## Sources

- [PREMIS Data Dictionary for Preservation Metadata, version 3.0, Library of Congress](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf)
- [PREMIS, Library of Congress standards page](https://www.loc.gov/standards/premis/)
- [NDSA Levels of Digital Preservation](https://www.ndsa.org/publications/levels-of-digital-preservation/)
- [NDSA Implementation Guidelines and Working Definitions, version 2.1](https://osf.io/4ctsv/)
- [DPC Digital Preservation Handbook, 2nd edition](https://www.dpconline.org/handbook)
- [DPC Handbook: Fixity and checksums](https://www.dpconline.org/handbook/technical-solutions-and-tools/fixity-and-checksums)
- [Library of Congress Signal: Protect Your Data: File Fixity and Data Integrity](https://blogs.loc.gov/thesignal/2014/04/protect-your-data-file-fixity-and-data-integrity/)
- [RFC 8493: The BagIt File Packaging Format (V1.0)](https://www.rfc-editor.org/rfc/rfc8493.html)
