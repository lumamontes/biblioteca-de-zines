# Biblioteca Catalogue Information Architecture

Status: concrete metadata structure for issue #131.

This document turns the provisional profile in
[`catalogue-access-profile.md`](./catalogue-access-profile.md) into a
reviewable organization for the current Biblioteca catalogue. It is a design
and mapping document, not a production migration. Examples are synthetic.

## Scope And Boundaries

This document defines:

- the current catalogue record unit and its relationships;
- the meaning, visibility, source, and review status of current fields;
- how submission values become catalogue values;
- the initial category vocabulary and governance rules;
- synthetic cases that the structure must represent;
- migration questions for a future staged transformation.

It does not change Supabase, rename records, change slugs, publish private
contact data, or choose a platform. It also does not create an edition entity,
an event-sourced workflow, or a full rights-management system.

## Record Organization

The current information architecture has four practical record types:

```text
Submission
  contains one or more proposed publication entries
  has private contact and intake context
  may become one or more reviewed Publication records

Publication
  is the current public catalogue unit: one zine entry
  has contextual Agent/role assertions
  has discovery metadata and zero or more file references
  has editorial and access states

Agent/role assertion
  associates a person, collective, or organization with a publication context
  may assert creator, publisher, submitter, or another role
  does not require roles to belong to separate people

File/access evidence
  describes a submitted, external, locally observed, reading, or derivative file
  remains distinct from the Publication record and its public metadata
```

### Publication Unit

One current `library_zines` row is one public publication entry. A later issue,
release, or `v2` is another entry for now. `edition/release` remains a
qualifier that may be recorded in a title, description, or future relation if
repeated cases justify one; it is not a required entity or field.

`collection_title` is currently a display label, not a collection entity. A
future collection relationship should only be introduced when ordering,
membership, or navigation cannot be represented safely by the label.

### Submission Boundary

`form_uploads` is an intake record, not a public publication and not a file
registry. The current form can submit multiple zines in one request, while the
submission-level contact is shared. Each proposed zine needs its own mapping
review before publication. An unpublished submission must remain private and
must not be inferred to be a catalogue record.

### Agent And Role Boundary

Use one agent with contextual role assertions rather than separate mandatory
entities for creator, publisher, submitter, and archive steward. The same
person or collective may occupy several roles. The role can also be unknown or
unresolved.

An archive steward is an operational actor for Biblioteca review and care. It
is not automatically a publication credit. A private contact is a communication
value and is not automatically a public agent identity.

## Metadata Inventory

The status values mean:

- **Keep**: current behavior is useful and should remain recognizable.
- **Clarify**: keep the value but define its meaning or source before migration.
- **Extend**: the current value is useful but cannot represent the required cases.
- **Defer**: do not add it to production as part of this issue.
- **Private**: never publish through the public catalogue by default.

| Area | Field | Meaning | Cardinality | Source and visibility | Decision |
| --- | --- | --- | --- | --- | --- |
| Identity | `slug` | Stable public URL identifier | 0..1 current; required for published record | Generated from current author/title rule; public | Keep; never silently regenerate during migration |
| Identity | `title` | Public title supplied or reviewed for the zine | 1 | Submitter/creator input, then editorial review; public when published | Keep; preserve original and reviewed values if they differ |
| Identity | `uuid`, `id` | Technical record identifiers | 1 current row | System-generated; operational | Keep as technical references, not public identity claims |
| Description | `description` | Public descriptive text with unresolved provenance | 0..1 | Submission or maintainer edit; public when published | Clarify source; do not call it creator-supplied context automatically |
| Date | `year` / `published_year` | Publication year claim | 0..1 | Submission claim or reviewed value; public when published | Keep as year only; preserve unknown/approximate cases outside the current numeric field |
| Language | `language` | Language of a title, description, or creator context | 0..many future | Not currently collected; public metadata when published | Extend later; do not infer language from text |
| Series | `collection_title` | Current free-text collection/series label | 0..1 | Submission or maintainer edit; public when published | Clarify label semantics; defer collection entity and ordering |
| Taxonomy | `categories` | Controlled discovery terms | 0..3 current UI; future cardinality to review | Submitter suggestion plus maintainer review; public | Keep controlled vocabulary; retain source of suggestion |
| Agent | `author_name` / `authors.name` | Public display name for a person or collective | 1..many | Submission or maintainer review; public when published | Extend with contextual role, alternative name, pseudonym, anonymity, and ordering |
| Agent | `author_url` / `authors.url` | Public external profile or reference | 0..many | Submitter/creator input; public if approved | Keep as optional external reference; do not treat as identity proof |
| Agent | `authors.bio` | Public contextual text about an agent | 0..1 | Maintainer/editorial value; public if approved | Keep available; distinguish from creator-supplied publication context |
| Role | role assertion | Why an agent is associated with this publication | 0..many | Submission/review context; public role only when approved | Extend relationship semantics; roles may overlap or remain unknown |
| Contact | `author_email` / `contactEmail` | Private communication channel | 0..1 per submission | Submitter; private | Keep private; define retention and access policy before migration |
| Context | creator-supplied context | Text supplied as the creator's own context | 0..1 or many future | Creator/submitter; visibility reviewed | Extend separately from editorial description |
| Asset | `pdf_url` | External source or delivery reference | 0..many future | Submission/current catalogue; public only if allowed | Clarify reference type; never label it an original automatically |
| Asset | `cover_image` | Cover image reference | 0..1 current | Submission/current catalogue; public when published | Clarify whether source, preview, or managed asset |
| Asset | local observation | Local file evidence, checksum, validation, and path | 0..many | Inventory; private by default | Keep separate from catalogue identity |
| Asset | derivative relation | Link between source, reading copy, preview, or page image | 0..many future | Processing evidence; visibility by access policy | Defer production modeling until authorized pilot |
| Editorial state | `is_published` | Public editorial visibility snapshot | 1 current | Maintainer decision; public query boundary | Keep for compatibility; do not overload with other states |
| Processing state | `import_status`, `total_pages` | Existing page-import snapshot fields | 0..1 | Internal/legacy | Defer or retire; not current editorial review |
| Submission | `created_at` | Intake timestamp | 0..1 | System; private/operational | Keep as provenance, not publication date |
| Record history | `updated_at` | Last row update timestamp | 0..1 | System; operational | Keep as a snapshot timestamp; no event history required |

### Current Representation Mismatches

The repository contains evidence from multiple layers that must not be
silently conflated:

- The TypeScript database snapshot includes `form_uploads.author_email` and
  `published_year`, while the checked-in `form_uploads` creation migration does
  not declare them. This is a schema-evidence mismatch to resolve before any
  migration, not permission to assume either layer is authoritative.
- The submission schema requires an author name and a four-digit year, while
  the reviewed profile must represent unknown, anonymous, and approximate
  authorship/date cases. The future form may need to make those states explicit.
- `form_uploads.author_name` and `author_url` are flattened values, while the
  application also parses multiple author values from `tags`. A migration must
  preserve the source and avoid duplicate or cross-attributed agents.
- `tags` is JSON used for categories and submission metadata. Categories are
  controlled through the `categories` table, but the stored values remain
  denormalized strings.
- Publishing copies submission values into `library_zines`, and existing slug
  matches merge categories rather than creating a new publication. This is a
  workflow rule that must be reviewed before migration, not a neutral data
  import.

## Submission-To-Catalogue Mapping

| Submission value | Review question | Catalogue outcome |
| --- | --- | --- |
| `title` | Is this the public title, a working title, or a title containing a release label? | Preserve submitted value; create reviewed public title only with provenance |
| `author_name` and parsed author values | Is the display name a person, collective, pseudonym, anonymous label, or unknown? | Create one or more contextual agent assertions; do not require a legal identity |
| `author_url` and social links | Is the URL a public profile, source, or unrelated link? | Keep as optional external reference with source context |
| `author_email` | Is it a submitter, rights-holder, or general contact? | Keep private and attach to submission/rights conversation, not public agent data |
| `published_year` | Is the value exact, approximate, unknown, or supplied without evidence? | Preserve claim and provenance; map to `year` only when precision is not lost |
| `description` | Was it supplied by the creator or written/edited by Biblioteca? | Keep source distinction; do not automatically publish as creator context |
| `collection_title` | Is this a series, a one-off label, or a title copied from another field? | Keep as a label; defer collection relationship |
| `tags.categories` | Is each term in the controlled vocabulary and appropriate for discovery? | Retain creator suggestion and reviewed category values separately when needed |
| `pdf_url` and `cover_image` | Is this a source, reading copy, preview, or external reference? | Create reviewed asset/reference facts; do not assert custody or authorization |
| `submission_batch_id` | Does this identify intake processing rather than a publication collection? | Keep as private process provenance |
| `is_published` | Has a maintainer approved public discovery, and under which access conditions? | Map to editorial/discovery state only |

## Controlled Vocabulary

The current category table is the starting vocabulary:

`Ilustração`, `LGBTQIA+`, `Quadrinhos`, `Poético`, `Filosofia / Espiritual`,
`Crítica social`, `Autobiográfico`, `Ficção científica`, `Fantasia`, `Humor`,
`Infantil`, `Infantojuvenil`, `Terror`, `Experimental`, `Arte digital`,
`Politico`, `Música`, `Fotografia`, and `Educação`.

These terms are discovery categories, not exhaustive descriptions of a zine's
identity. Initial governance rules:

1. A category must have a stable display label and a unique normalized identity.
2. A submission may suggest categories, but a maintainer reviews the final
   public values.
3. Category changes must preserve the old value and affected records in a
   staged migration or review report; no silent bulk replacement.
4. Synonyms, spelling, accent, and capitalization changes require an explicit
   mapping decision.
5. A maximum of three categories is a current form constraint, not a permanent
   metadata truth; revisit it with representative records.
6. The thesaurus issue (#116) may refine labels and relationships, but must not
   expand into unrelated publication or rights modeling.

## Synthetic Validation Set

The structure must be tested with records like these, using only synthetic
values:

| Case | Expected representation |
| --- | --- |
| Single creator | One public agent assertion with role `creator`; one publication record |
| Collective | One agent with kind `collective`; no invented individual members |
| Pseudonym | Public display name retained; private identity not required |
| Anonymous | Explicit anonymous authorship; no fabricated agent name |
| Unknown author | Authorship unresolved; distinct from an intentional anonymous credit |
| Overlapping roles | One collective asserted as creator and publisher; submitter may be another agent |
| Multilingual | Portuguese title plus a second language title/context, each tagged when supported |
| Approximate date | `circa` or unknown claim retained rather than forced into an exact year |
| Unpublished submission | Private submission with contact and files; no public publication record |
| `v2` | New publication entry with `v2` in reviewed title/context; no edition entity required |
| Same title, different files | Separate publication entries until evidence establishes a relationship |
| Collection label | Multiple publications share a label; no ordering inferred |

## Migration Handoff

Issue #109 may use this document to build a staged mapping, but it must not
assume that every current value is ready for publication. The migration should:

- preserve source values alongside reviewed values;
- keep one current zine entry as one staged publication record;
- preserve unresolved authorship, date, category, asset, and rights cases for
  human review;
- avoid merging records solely because titles or authors match;
- avoid changing slugs or URLs without an explicit redirect/migration plan;
- keep submissions, private contacts, assets, and public metadata distinct;
- report values that cannot be represented without a schema or workflow change.

The output of this issue is the reviewed structure and mapping rules. A future
implementation issue must separately decide schema changes, form changes,
backfill strategy, review tooling, and production rollout.

## References

- [Provisional catalogue and access profile](./catalogue-access-profile.md)
- [Zine archive reference research](./zine-archive-references.md)
- [Archive baseline](./archive-baseline.md)
- [Current apply form schema](../src/schemas/apply-zine.ts)
- [Current edit/upload schema](../src/schemas/edit-upload.ts)
- Current publish mapping: `src/app/(admin)/dashboard/actions.ts`
- [Current category seed](../supabase/migrations/20250701000000_addCategoriesTable.sql)
