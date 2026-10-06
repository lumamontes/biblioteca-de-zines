# ZineCore2 research notes for Biblioteca

Research date: 2026-09-24

Scope: primary-source review of the ZineCore2 project documentation, its public
specification repository, and its public reference server repository. These
notes use only synthetic examples; names and values in the project's examples
are not repeated here.

## Executive assessment

ZineCore2 is a useful vocabulary and crosswalk reference, not a specification
Biblioteca should adopt wholesale today.

**Adopt** the separation between a bibliographic zine description, an agent,
and a repository-specific holding; repeatable creator/contributor/publisher
relationships; explicit series/issue/edition distinctions; controlled subject,
genre, language, and rights values; and the use of stable local identifiers.

**Adapt** nearly every operational rule for Biblioteca: provenance and source
visibility, date uncertainty, language values, rights/access dimensions,
physical versus digital assets, holdings, agent privacy, relationships, and
the treatment of identifiers. Keep the Biblioteca domain model authoritative
and expose a ZineCore2 crosswalk/export rather than making the external shape
the database model.

**Reject** the claim that the current public artifacts are a sufficiently
stable canonical contract without pinning a reviewed version. The project has
useful artifacts, but the prose, DC TAP, JSON Schema, TypeScript types, and
server implementation contain material contradictions. The repositories also
show a very recent, unreleased project rather than evidence of a mature,
independently validated standard.

## Sources and evidence

Primary sources reviewed:

- [ZineCore2 home](https://zinecore.org/): describes four interrelated profiles
  for zines, agents, holdings, and repositories; states Dublin Core, JSON-LD,
  JSON Schema, TypeScript, and DC TAP support.
- [ZineCore2 profile](https://zinecore.org/docs/specification/profiles/zinecore2):
  defines `zineShape`, field labels, required/repeatable flags, narrative
  constraints, and the issue/series/edition model.
- [AgentCore2 profile](https://zinecore.org/docs/specification/profiles/agentcore2):
  defines agent identity, pseudonym, anonymity, privacy, roles, and external
  identifiers.
- [HoldingCore2 profile](https://zinecore.org/docs/specification/profiles/holdingcore2):
  defines repository-specific holdings, copy/access/condition fields, and
  work-versus-copy separation.
- [RepoCore2 profile](https://zinecore.org/docs/specification/profiles/repocore2):
  defines repository identity, type, location, institutional identifiers, and
  access information.
- [Vocabulary overview](https://zinecore.org/docs/specification/vocabularies):
  documents subject, genre, rights, agent, repository, and holding vocabularies
  plus ISO code guidance and publication formats.
- [JSON Schema documentation](https://zinecore.org/docs/specification/technical-artifacts/json-schemas):
  documents Draft 2020-12 validation, required fields, closed objects,
  extensions, and the fact that JSON Schema does not validate references.
- [Downloads and schemas](https://zinecore.org/docs/tools/downloads): states
  that the artifacts are synchronized, gives the claimed current version
  (`v2.0.0`), and documents licenses and download locations.
- [JSON-LD contexts](https://zinecore.org/docs/specification/technical-artifacts/jsonld-contexts):
  documents Dublin Core mappings, custom namespaces, cross-profile linking,
  and the distinction between JSON Schema and graph validation.
- [Specification README](https://github.com/ZineCore2/spec/blob/develop/README.md):
  describes the repository layout, canonical vocabulary generation, and the
  five artifact types.
- [Live zine JSON Schema](https://raw.githubusercontent.com/ZineCore2/spec/develop/schemas/zinecore2.schema.json):
  machine-enforced properties, types, `minItems`, and required fields.
- [Live zine DC TAP](https://raw.githubusercontent.com/ZineCore2/spec/develop/profiles/zinecore2-tap.csv):
  machine-readable cardinality, mappings, and value constraints.
- [Live zine TypeScript type](https://raw.githubusercontent.com/ZineCore2/spec/develop/types/ZineCore2.d.ts):
  implementation-facing optionality and field types.
- [Canonical subjects](https://raw.githubusercontent.com/ZineCore2/spec/develop/vocabularies/canonical/subjects.json),
  [genres](https://raw.githubusercontent.com/ZineCore2/spec/develop/vocabularies/canonical/genres.json),
  and [rights](https://raw.githubusercontent.com/ZineCore2/spec/develop/vocabularies/canonical/rights_statements.json):
  current vocabulary contents.
- [Reference implementation overview](https://zinecore.org/docs/reference-implementation):
  describes the Django/PostgreSQL server, API, serialization, and architecture.
- [Server README](https://github.com/ZineCore2/server/blob/develop/README.md):
  documents the server's current setup, endpoints, submodule, exports, and
  additional submission/account features.
- [Server zine model](https://raw.githubusercontent.com/ZineCore2/server/develop/backend/catalog/models.py),
  [agent model](https://raw.githubusercontent.com/ZineCore2/server/develop/backend/agents/models.py),
  and [holding model](https://raw.githubusercontent.com/ZineCore2/server/develop/backend/holdings/models.py):
  current persistence choices.
- [Specification repository metadata](https://api.github.com/repos/ZineCore2/spec)
  and [server repository metadata](https://api.github.com/repos/ZineCore2/server):
  public repository dates, branch, license, and popularity evidence.

The GitHub repository metadata was checked directly on the research date. Both
repositories report a `develop` default branch, creation in February 2026, no
stars/forks, and MIT repository licensing. The public releases endpoint for
the specification returned no releases. The website's downloads page claims
`v2.0.0` and links several artifacts on `main`, while the repositories exposed
for review use `develop`; this makes version pinning especially important.

## What `zineShape` contains

The profile describes a single zine issue as the primary resource. Its fields
are:

| Area | Fields | Profile rule |
| --- | --- | --- |
| Identity | `title`, `alternative_title` | `title` required, single; alternatives optional, repeatable |
| Serial context | `series_title`, `issue_designation`, `edition_statement` | series optional/repeatable; issue optional/single; edition optional/repeatable |
| Responsibility | `creator`, `contributor`, `publisher` | creator required/repeatable; contributor and publisher optional/repeatable |
| Meaning/form | `subject`, `genre`, `abstract`, `table_of_contents`, `public_notes` | subject and genre required/repeatable; text fields optional |
| Publication/physical | `date`, `physical_dimensions`, `number_of_pages`, `format`, `binding_features`, `place_of_publication` | date required/repeatable; physical fields optional; production format and binding repeatable |
| Language/coverage | `language`, `coverage` | language required/repeatable; coverage optional/repeatable |
| Provenance/linking | `source`, `relation`, `identifier` | all optional/repeatable |
| Rights | `rights` | required/repeatable |

The schema's required list is `title`, `creator`, `subject`, `genre`, `date`,
`language`, and `rights`. `id` is not required by the canonical zine schema,
despite the implementation guide recommending or using identifiers. The
profile's narrative also says creator may be represented as `Anonymous`.

The project maps most properties to Dublin Core Terms and adds a small zine
namespace for issue designation, edition statement, binding, genre, and public
notes. This is a reasonable interoperability baseline, but it does not make
the meanings of fields sufficiently precise for all Biblioteca workflows:
`date` has no date role, `rights` mixes statements and permissions, `source`
mixes acquisition provenance with possible sensitive donor information, and
`relation` is an untyped string list.

## Required and repeatable rules

The intended minimal record is deliberately rich: title, creator, subject,
genre, date, language, and rights are all required. That supports discovery,
but it is a poor intake requirement for a collaborative archive where many
facts may be unknown or intentionally withheld. Biblioteca should distinguish
at least:

- required for an accepted catalogue record;
- recommended when known;
- permitted but unknown/unresolved; and
- private/internal or not exchangeable.

Do not encode unknown facts as invented values merely to satisfy the external
minimum. In particular, a missing date, language, rights claim, or subject can
be an evidence state rather than a failed submission. If a ZineCore2 export
requires values, use an explicit Biblioteca review decision about whether an
`unknown` vocabulary value is semantically honest. The ZineCore2 rights list
does provide `unknown`, but its presence still means the required field does
not guarantee that rights are known.

Repeatability is useful for creators, contributors, publishers, dates,
languages, rights, subjects, genres, series membership, and identifiers.
However, the external shape carries no ordering or role qualifiers for most
repeatable values. Biblioteca should preserve ordering where it is meaningful
and model a relationship assertion with role, source, confidence, and
visibility rather than relying on array position or a bare string.

## Series, issue, and edition

ZineCore2's strongest conceptual choice is to model each issue as its own
zine description, with:

- `series_title` for membership in a named series;
- `issue_designation` for the issue number or label; and
- repeatable `edition_statement` for reprints, corrected printings, or special
  editions.

The profile recommends an issue designation when a series title is present,
but it does not make that dependency machine-enforced. It also does not define
separate entities for a series, issue, expression, manifestation, or edition.
The values are mostly literal strings, and `relation` is the only general
linking mechanism.

For Biblioteca, adopt the distinction but adapt the data model:

- retain a stable publication identity for the catalogue concept;
- represent a series as a relationship, not a title copied into every row;
- represent issue/numbering as a statement with an evidence source, allowing
  labels such as a season or an unnumbered issue;
- represent an edition/release only when it distinguishes access, content,
  production, or rights; and
- never infer an edition from a year alone.

Export a synthetic record such as a publication titled `Signal Fold`, series
`Signal`, issue `Spring issue`, and edition `corrected reprint` only when the
source supports those statements. Keep the source and uncertainty outside the
plain ZineCore2 strings.

## Creator, contributor, publisher, and agent privacy

AgentCore2 has a useful authority-control idea: one agent record can be reused
by many zines. It requires `id`, `kind`, `display_name`, and `public`. It
supports person, collective, and organization kinds; alternative names;
pseudonyms; legal name; roles; locations; external identifiers; and a boolean
public flag. Its privacy guidance says the chosen public name takes precedence,
legal names should be internal and permission-based, anonymous creators may be
represented by an `Anonymous` display name, and contact information should not
be published by default.

Adopt:

- agent records separate from zine records;
- person, collective, organization, anonymous, and unknown as distinct
  authorship/agent states where needed;
- public display name and pseudonym as first-class values;
- contextual creator, contributor, and publisher assertions; and
- stable local agent identifiers.

Adapt:

- `public: false` must not mean that the agent record can never exist or that
  every association is hidden. Biblioteca needs field-level and relationship-
  level visibility, consent/provenance, and a distinction between anonymous,
  pseudonymous, private, unknown, and unresolved.
- Do not expose a private legal name merely because it is present in a shared
  agent object. Public views should be projections with an explicit allowlist.
- Contributor roles belong on the zine-agent relationship assertion. The
  ZineCore2 zine shape only has a contributor string list; AgentCore2 roles are
  typical agent roles, not necessarily the role for this specific work.
- A publisher may be a creator, contributor, distributor, press, or repository
  in different contexts. Preserve the asserted role instead of deducing legal
  responsibility from the label.

Reject the assumption that a single boolean is sufficient privacy policy. The
reference server's current Agent model stores `legal_name`, aliases, location,
and `public`, but omits several documented fields such as pronouns, biography,
scope note, active dates, website, email, social media, ORCID, and Wikidata.
That is implementation scope, not evidence that the profile's privacy model is
complete.

## Dates and languages

The profile permits repeated text dates including approximate or human-readable
values. The website promotes ISO 8601, but the live JSON Schema only requires
date strings and does not apply a date pattern or format. The TAP describes an
`ISO8601OrText` pattern, while the TypeScript type is simply `string[]`.

This flexibility is appropriate for zines, but Biblioteca needs typed date
semantics without losing the source statement. Keep a date assertion with:

- a normalized value or interval when defensible;
- a display/source statement such as `circa 2004` or `winter 2011`;
- a date role, such as publication, creation, revision, acquisition, or scan;
- precision and uncertainty; and
- provenance and visibility.

The profile requires at least one language and recommends ISO 639-1/639-2.
The schema accepts a two- or three-letter token with an optional suffix but
does not verify that the token is an actual ISO code. The TAP says ISO 639-1
even though the schema and prose allow 639-2. Biblioteca should use a maintained
language vocabulary, preserve multilingual values, and support language of
content separately from language of metadata or transcription. Do not infer a
language from title text alone.

## Genre and subject

The project correctly separates genre/form from topical subject. Its canonical
genres include terms such as perzine, fanzine, art zine, comic zine, newsletter,
and resource zine. Its subjects include activism, anti-fascism, queer politics,
trans experience, disability, mental health, punk, comics, art, zine-making,
and place. The vocabulary overview says the lists are focused rather than
exhaustive and are based partly on the Anchor Archive Zine Subject Thesaurus.

Adopt the separation and controlled-term approach. Adapt it by storing a term
identifier, preferred label, vocabulary/version, source, and local mapping.
Allow a local subject proposal or free-text description to remain distinct from
a governed subject term. Do not treat the current list as a universal or
complete taxonomy, and do not silently change a historical term when the
vocabulary is revised.

The live schema does not actually enforce the published vocabularies: subject,
genre, and most other values are only strings. The JSON Schema documentation
claims invalid vocabulary terms will fail, while the live schema has no enum
or reference to the vocabulary files. Biblioteca should validate its own
controlled terms and record vocabulary version explicitly.

## Rights and access

ZineCore2 requires repeatable rights values and recommends finite statements or
Creative Commons URIs. The canonical list includes all-rights-reserved,
anti-copyright, copyleft, freely-duplicatable, please-copy, several Creative
Commons licenses, CC0, and unknown.

This is a useful starting vocabulary, but it conflates distinct questions:

- legal rights or copyright status;
- the creator's copying request;
- permission to digitize or distribute;
- permission to make derivatives;
- public discovery;
- reading/download access; and
- preservation or replication permission.

Biblioteca should adapt rights into separate rights/access assertions with a
claimant or source, scope (publication, physical copy, scan, or derivative),
action, condition, effective date, visibility, and confidence. A public URL is
not proof of authorization. `unknown` should remain an honest state, not a
license. Preserve the original rights statement verbatim alongside any
normalized term.

The HoldingCore2 vocabulary adds duplication statuses such as can-duplicate,
can-digitize, no-duplication, and ask-first. Adopt the distinction between a
rights claim and a holding-specific operational permission, but do not assume
the holding's `distro_status` is legally authoritative.

## Identifiers

ZineCore2 permits repeatable local IDs, union IDs, URIs, and URLs in a single
`identifier` list. AgentCore2 separately names ORCID, Wikidata, and other
identifiers. RepoCore2 names MARC organization codes, ISIL, ROR, and other
identifiers. The JSON-LD guidance recommends persistent dereferenceable `@id`
values and typed identifiers.

Adopt stable Biblioteca identifiers and preserve external identifiers. Adapt by
making the identifier system explicit: value, system, normalized value, URI,
source, verification state, and visibility. Do not put every URL into one
undifferentiated list. Keep a local record ID distinct from an identifier for
the publication, agent, holding, or source artifact. An identifier is not proof
that two records are the same; matching still needs evidence.

## Holdings, repositories, and files

HoldingCore2 is valuable for Biblioteca because it separates the described zine
from a repository-specific copy or digital holding. It supports repository and
zine references, call number, location, access status, condition, copy count,
barcode, digital availability/URL, distro status, and notes. RepoCore2 provides
repository identity, kind, country, location, scope, status, access policy,
and library identifiers.

Adopt the conceptual separation and the rule that access and condition belong
to a holding, not to the general zine description. Adapt it substantially:

- Biblioteca's holding should be distinct from a file asset/version. A digital
  URL alone is not evidence of custody, source, authorization, or preservation.
- Track discovery, reading, download, preservation, replication, and reuse as
  separate access dimensions rather than one `access_status`.
- Preserve local observations, source references, checksums, derivatives, and
  unresolved custody questions in file/access evidence.
- Do not use `copy_count` to collapse copies that differ in location, condition,
  rights, or provenance.
- Keep repository/steward identity separate from publication roles.

The server currently implements a particularly important divergence: the
Holding model has repository and zine foreign keys but no `id` field of its
own, although HoldingCore2 says `id` is required. Its README and commit history
also describe a composite repository-plus-zine identity. This is usable as a
local implementation choice, but it cannot be treated as a faithful canonical
implementation of the published holding shape.

## Implementation and status evidence

The project publishes a strong set of intended artifacts: DCAP prose, DC TAP,
JSON Schema, JSON-LD contexts, TypeScript types, canonical/generated
vocabularies, a validator, a vocabulary API, and a Django/PostgreSQL server.
The server documentation claims public reads, authenticated writes, JSON,
JSON-LD, CSV, Dublin Core XML, Turtle, BibTeX, and MARCXML output. These are
useful integration targets and demonstrate implementation effort.

The public evidence also limits confidence:

- The specification and server repositories were created in February 2026 and
  expose `develop` as the default branch.
- The checked public releases list for the specification was empty.
- Repository metadata showed no stars or forks at the research date. This is
  not a quality judgment, but it is not evidence of broad adoption or external
  review.
- The website says the reference implementation is production-ready and
  battle-tested, but the repository history reviewed here is a concentrated,
  recent development sequence. Treat those descriptions as project claims,
  not independent operational evidence.
- The documentation, TAP, schema, TypeScript types, and server are not fully
  synchronized. Examples include `id` optional in the zine schema/type but
  local IDs central in the server; date validation described as ISO-aware but
  implemented as unconstrained strings; and holding `id` required in prose but
  absent from the server model.
- The schema documentation says `additionalProperties: false` and recommends
  public notes, relation, or a fork for custom fields. A forked schema is not
  canonical and will not interoperate automatically. Biblioteca therefore
  needs a deliberate extension/crosswalk boundary.

Before any production interchange, Biblioteca should pin a repository commit
or tagged release, run its own fixture corpus through the schema and server,
compare all five artifacts, and record the exact vocabulary versions. Do not
depend on the live website, API, or `develop` branch as an immutable standard.

## Biblioteca decision matrix

| ZineCore2 idea | Decision | Biblioteca treatment |
| --- | --- | --- |
| Dublin Core mappings and JSON-LD context | Adopt selectively | Useful export/crosswalk; retain richer local semantics and provenance |
| `zineShape` issue-oriented record | Adapt | Keep issue context, but do not force every catalogue concept into one flat record |
| Required title/creator/subject/genre/date/language/rights | Adapt | Separate accepted-record requirements from unknown, private, and unresolved states |
| Repeatable creators/contributors/publishers | Adopt and deepen | Relationship assertions with role, order, source, confidence, and visibility |
| Series/issue/edition fields | Adopt conceptually | Model relationships and evidence; export literals when required |
| Free-text dates | Adapt | Keep source statement plus normalized date, role, precision, and uncertainty |
| ISO language codes | Adapt | Validate against a maintained vocabulary and distinguish content/metadata language |
| Genre versus subject | Adopt | Separate form from topic; version controlled terms and local proposals |
| Finite rights vocabulary | Adapt | Preserve original claim and separate legal, access, and reuse decisions |
| AgentCore2 authority records | Adopt with privacy changes | Field/relationship visibility; pseudonym, anonymity, private, unknown, unresolved |
| `public` boolean | Reject as sole policy | Use explicit projections and granular visibility/consent rules |
| HoldingCore2 copy/repository split | Adopt conceptually | Add separate file assets, custody evidence, and per-action access decisions |
| Flat `identifier` array | Reject as local model | Use typed identifier assertions with system, provenance, and verification |
| Current canonical vocabularies | Adapt | Import as candidate mappings, not as Biblioteca's complete taxonomy |
| Current artifacts as unpinned contract | Reject | Pin reviewed commits/releases and maintain a crosswalk test suite |
| Current Django server as Biblioteca backend | Reject | It is reference evidence, not a fit for Biblioteca's existing domain and privacy model |

## Explicit limitations and risks

1. **Normative ambiguity:** The project presents prose, TAP, schema, and types as
   synchronized, but observed requiredness, mappings, and validation behavior
   differ.
2. **Version instability:** The public materials point across `main`, `develop`,
   and a claimed `v2.0.0` without a reviewed release available in the checked
   releases endpoint.
3. **Flat values lose evidence:** Strings cannot carry source, confidence,
   assertion role, language of metadata, visibility, or uncertainty.
4. **Privacy leakage:** Agent fields such as legal name, location, email, and
   social accounts cannot safely be governed by one record-level boolean.
5. **Rights overclaiming:** A rights term or holding distro status can be read
   as permission even when it is only an unverified statement.
6. **Vocabulary governance:** The lists are useful but small and not clearly
   sufficient for all communities, languages, or local terminology. Their
   versions and mappings need to be retained.
7. **Identifier ambiguity:** A local ID, external authority ID, URL, and union
   identifier have different identity and verification semantics.
8. **Physical/digital conflation:** Physical dimensions and production format
   describe a publication, while scan properties, files, checksums, and URLs
   describe assets or holdings.
9. **Incomplete referential validation:** JSON Schema checks structure, not
   whether creator, repository, or zine references exist. The server adds
   database relationships, but its model has its own divergences.
10. **Maturity claims are unverified:** The reference server's "production-ready"
    and "battle-tested" descriptions should not substitute for release history,
    interoperability tests, adoption evidence, or a documented governance
    process.

## Recommended next step

Create a small Biblioteca crosswalk test set containing synthetic records for:

- an issue with a named series and uncertain seasonal date;
- a collaborative collective using a pseudonym;
- an anonymous creator with a private internal contact;
- multiple contributors with distinct contextual roles;
- multilingual content;
- unknown rights with a separate reading restriction;
- one physical holding and one digital asset with different access decisions;
- an ambiguous external identifier; and
- a zine whose source/acquisition note is private.

Validate the local records first, then export only the public, ZineCore2-shaped
projection. Pin the exact ZineCore2 commit used for that export and retain the
crosswalk's known information-loss decisions.
