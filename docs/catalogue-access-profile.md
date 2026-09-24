# Biblioteca Catalogue and Access Profile

Status: provisional profile for issue #108.

This document defines the vocabulary and capability profile needed to improve
the Biblioteca catalogue without selecting a migration platform. Examples are
synthetic. No contributor identities, contact details, private rights evidence,
or raw catalogue values are included.

## Purpose and Boundary

The archive baseline describes the current application and evidence. This
profile goes one step further by separating concepts that are currently stored
together or represented only by assumptions.

It does not:

- migrate catalogue records or files;
- change Supabase schema or production values;
- decide contributor rights or retention for individual submissions;
- select Tainacan, Omeka S, CollectiveAccess, or another platform;
- turn an external URL into an authorised original.

## Provisional Domain Model

| Concept | Provisional meaning | Current Biblioteca mapping |
| --- | --- | --- |
| Publication | A distinct published zine or edition that readers can discover. | `library_zines` row. |
| Edition | A particular release/version of a publication, including a date or revision when that distinction is known. | Not represented separately. `year` and timestamps are insufficient. |
| Collection/series | A group of related publications presented as belonging together. | `collection_title`; relationship and ordering are not explicit. |
| Contributor/creator | A person, collective, publisher, or other entity credited with making the publication. | `authors` plus `library_zines_authors`; roles are not separated. |
| Private contact | A non-public channel used to communicate with a submitter or rights holder. | `form_uploads.author_email`; privacy and retention policy are not modeled. |
| Submission | An intake record and context provided to the Biblioteca for review. | `form_uploads`; no formal link to the resulting catalogue row. |
| File asset/version | A specific source or delivery file with its own bytes, URL, format, checksum, or version history. | `pdf_url`, local archive observations, and external URLs; no asset/version entity. |
| Derivative | A representation produced from another file, such as a preview, reading copy, or page image. | Not currently represented in the public reading flow. Planned `zine_pages` data is unused. |
| Processing event | An action such as review, publication, import, validation, correction, or removal. | Timestamps and `import_status` provide partial signals; no event history. |
| Access policy | Separate decisions about discovery, reading, downloading, preservation, replication, and reuse. | Mostly collapsed into `is_published` and external URL reachability. |

## Expressiveness Requirements

The provisional profile must support these cases without silently rewriting
them into a simpler model:

- multiple creators, collective authorship, and distinct creator/publisher/
  submitter roles;
- pseudonyms and creator-supplied display names without requiring a legal name;
- anonymous or unknown authorship;
- unknown, approximate, or partial publication dates;
- multiple languages and language-specific titles or descriptions;
- uncertainty and provenance attached to a value, such as an inferred date or
  a curator correction;
- creator-supplied context that remains distinguishable from editorial notes;
- several editions or files associated with one publication;
- an unpublished submission that is retained privately without becoming public;
- a public reading copy whose access policy differs from the retained source.

### Provisional Representation Rules

These rules describe what the profile must be able to represent. They are not
schema changes:

| Requirement | Provisional representation | Current mapping/gap |
| --- | --- | --- |
| Collective, creator, publisher, and submitter roles | Separate participant records with a role and display name; a publication may have many participants. | `authors` links creators only; publisher and submitter roles are not modeled. |
| Private contact | A private contact value linked to the submission/rights conversation, with access separate from public creator data. | `form_uploads.author_email`; no access, retention, or rights-case relation is modeled. |
| Pseudonym or anonymity | Display name plus optional private identity evidence, or an explicit anonymous participant. | Current author name is a single public text value. |
| Unknown or approximate date | Date value plus precision (`day`, `month`, `year`, `circa`, or `unknown`) and provenance. | `year` stores only a numeric year. |
| Multiple languages | Language-tagged title, description, and creator context values. | No language field exists. |
| Uncertainty | Value-level certainty and provenance note, separate from the value itself. | No value annotation exists. |
| Creator-supplied context | Context value with source `creator`, separate from editorial notes. | `description` is a shared text field and does not establish authorship of the text. |
| Edition and file version | Explicit relations from publication to edition and from edition to file asset/version. | No edition, asset, or version entities exist. |

## Separate State Dimensions

These dimensions must not be collapsed into one `published` boolean:

| Dimension | Example states | Current evidence |
| --- | --- | --- |
| Editorial state | submitted, in review, published, unpublished, withdrawn | `form_uploads.is_published` and `library_zines.is_published`; review/withdrawal history is absent. |
| Processing state | not imported, pending, processing, completed, failed | `library_zines.import_status`; this describes the unused page-import path, not editorial review. |
| File availability | external URL, locally observed, unavailable, ambiguous, invalid | Inventory manifest, monitor history, and URL fields. |
| Discovery access | public, unlisted, private, removed | Current public queries use `is_published`; other states are not modeled. |
| Reading access | browser preview, downloadable, restricted, unavailable | Current public reader embeds the external PDF URL; policy is not separate. |
| Preservation access | retained locally, retained elsewhere, pending authorization, not retained | Inventory evidence and maintainer review; no production field. |
| Reuse access | permitted, restricted, unknown, withdrawn | Not currently represented. |

## Current Field Mapping

| Current field/table | Profile role | Keep/configure/extend/defer |
| --- | --- | --- |
| `library_zines.slug` | Stable public identifier | Keep; preserve the rule `<first-author>-<normalized-title>` and treat future changes as migrations. |
| `library_zines.title`, `description` | Public title and context candidate | Keep; do not treat `description` as creator-supplied context until provenance is captured. |
| `library_zines.collection_title` | Collection/series label | Keep as a display field; defer explicit collection entities and ordering to a future schema decision. |
| `library_zines.tags.categories` | Controlled discovery vocabulary | Keep the current category vocabulary; model taxonomy governance separately. |
| `authors` and `library_zines_authors` | Creator links | Keep the relationship; extend with role, display name, pseudonym, anonymity, and ordering when needed. |
| `form_uploads` | Submission and private intake context | Keep as workflow input; do not treat it as the publication or as a file-asset registry. |
| `form_uploads.author_email` | Private contact role | Keep private; define retention, access, and rights-case linkage before migration. |
| `form_uploads.published_year` | Submission date/year claim | Preserve as supplied context; map to a qualified date only after precision/provenance rules are chosen. |
| `form_uploads.tags.submission_batch_id` | Submission grouping/process reference | Keep as process evidence; do not treat it as a publication collection. |
| `form_uploads.tags.categories` | Submission discovery suggestion | Map to the controlled category vocabulary during review; retain creator input separately if needed. |
| `form_uploads.cover_image`, `author_name`, `author_url` | Submission-side asset and creator context | Preserve as intake values; map to catalogue fields only through the publication review step. |
| `pdf_url`, `cover_image` | External source references | Keep for current operation; do not label them originals or managed storage. |
| `is_published` | Public editorial visibility | Keep for compatibility; do not use it for processing, file availability, or rights. |
| `import_status`, `total_pages`, `zine_pages` | Planned page derivative processing | Defer or retire after an explicit decision; these are not used by the current reader. |
| Local archive manifest | Fixity and observation evidence | Keep private and separate from public catalogue identity. |

## Access Profile

The profile treats these capabilities separately:

| Capability | Current behavior | Provisional requirement |
| --- | --- | --- |
| Public discovery | Published `library_zines` records appear in catalogue, search, and author pages. | A record may be discoverable without implying download, preservation, or reuse permission. |
| Reading | Public detail pages embed the external PDF preview. | Reading copy and source file must be distinguishable when they differ. |
| Downloading | Depends on the external PDF provider's URL and permissions. | Download policy must be explicit and independently reviewable. |
| Preservation | Local inventory observes selected files; source custody is not established. | Retention, authorization, checksum, redundancy, and recovery need separate evidence. |
| Replication | No independent production replica or restore process is established. | Replication status must be recorded independently from publication. |
| Reuse | No current field expresses reuse permission or licence. | Reuse must remain unknown unless creator or policy evidence establishes it. |

## Platform Evaluation

This is a capability comparison, not a migration recommendation.

| Option | Native strengths relevant here | Costs or gaps | Decision |
| --- | --- | --- | --- |
| Current Next.js + Supabase | Existing submission, shared maintainer authentication, catalogue queries, RLS-compatible data layer, and low operational disruption. | Metadata roles, value provenance, file versions, rights, and derivatives require application/schema work. | **Keep as the current system of record while the profile is validated.** |
| Tainacan | WordPress repository plugin with configurable metadata, taxonomies, filters, REST API, JSON/HTML/CSV output, and Dublin Core mapping. | WordPress roles and configuration would need to be tested for private submission data and review. Official materials inspected do not establish a native equivalent to the Biblioteca review flow or a preservation file/version model. Adds a second stack. | **Evaluate as a lighter catalogue/discovery integration; no adoption yet.** |
| Omeka S | Items, media, vocabularies, resource templates, linked resources, value annotations, per-field visibility, users/roles, REST API, JSON-LD/RDF/CSV exports, derivatives, IIIF, and a Collecting workflow with moderation states. | Requires a PHP/application deployment and could duplicate the existing Next.js/Supabase submission workflow. Configuration and resource templates must be tested with synthetic records. | **Best candidate for a synthetic catalogue/access proof of concept; no migration yet.** |
| CollectiveAccess Providence + Pawtucket2 | Configurable entities, metadata standards, media processing, change tracking, large exports, BagIt/replication capabilities, GraphQL/REST/IIIF/OAI-PMH, and separate public presentation. | Highest operational burden: multiple applications, PHP/MySQL infrastructure, media tooling, and a larger integration surface. Submission/review ownership would need explicit design. | **Defer unless the profile proves that archival complexity justifies it.** |

The evaluation dimensions are explicit: Tainacan configuration is through
WordPress metadata/taxonomy settings and extensions; its REST/JSON/HTML/CSV
and Dublin Core output are the relevant export paths; WordPress roles provide
the baseline access mechanism, but item/field-level private-contact behavior
and a staged submission/review workflow require a proof of concept. Omeka S
and CollectiveAccess expose more documented controls for field visibility,
relationships, exports, media, and review, at the cost of separate PHP-based
operations. The official sources below are the basis for these claims; no
vendor behavior was inferred from the current Biblioteca code.

### Priority Capability Decisions

| Capability | Decision or deferral |
| --- | --- |
| Roles and authorship | Preserve roles explicitly; do not collapse creator, publisher, collective, submitter, and private contact. Validate with synthetic examples before schema work. |
| Private contact | Keep private contact separate from public creator data; defer retention, access, and rights-case policy. |
| Uncertainty and provenance | Require value-level notes or provenance in the future profile; do not encode uncertainty in title/description text. |
| Editions and versions | Defer explicit edition/file-version entities until representative multi-edition records are reviewed. |
| Collection/series | Keep `collection_title` for current discovery; defer explicit relationships and ordering. |
| Multilingual metadata | Require language-tagged values in the future profile; do not infer language from text. |
| Creator-supplied context | Keep it distinct from editorial notes; defer the exact field shape until the profile proof of concept. |
| Processing history | Keep current status fields as state snapshots; defer an event-history model until workflow requirements are validated. |
| Review workflow | Keep Next.js/Supabase as the workflow authority for now; compare Omeka Collecting only through a synthetic proof of concept. |
| Public access | Keep publication, reading, download, preservation, replication, and reuse as separate policy dimensions. |
| File custody and derivatives | Do not migrate or call external URLs originals. Define asset/version/derivative relationships before selecting storage. |
| Platform migration | Defer. First validate the profile against representative synthetic records and the current submission workflow. |

## Operational Handoff

1. Use this profile to create synthetic records covering collective, anonymous,
   pseudonymous, multilingual, uncertain-date, and unpublished cases.
2. Map those records through the current submission and dashboard workflow
   without using private production data.
3. Run a focused Omeka S proof of concept and a lighter Tainacan integration
   comparison against the same records and capabilities.
4. Revisit the platform decision only after rights, file custody, derivative,
   and workflow requirements are explicit.

## Official Sources

- [Tainacan documentation](https://tainacan.org/en/documentation/)
- [Tainacan official repository](https://github.com/tainacan/tainacan)
- [Omeka S user manual](https://omeka.org/s/docs/)
- [Omeka S API](https://omeka.org/s/docs/developer/api/)
- [Omeka S items and relationships](https://omeka.org/s/docs/user-manual/content/items/)
- [Omeka S media and derivatives](https://omeka.org/s/docs/user-manual/content/media/)
- [Omeka S Collecting module](https://omeka.org/s/docs/user-manual/modules/collecting/)
- [Omeka S exports](https://omeka.org/s/docs/user-manual/modules/exports/)
- [CollectiveAccess Providence](https://github.com/collectiveaccess/providence)
- [CollectiveAccess Pawtucket2](https://github.com/collectiveaccess/pawtucket2)
- [CollectiveAccess APIs](https://docs.collectiveaccess.org/providence/developer/APIs/)
- [CollectiveAccess system requirements](https://docs.collectiveaccess.org/providence/user/setup/systemReq)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Next.js mutation and Server Function security](https://nextjs.org/docs/app/getting-started/mutating-data)
