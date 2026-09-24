# Zine Archive References

Status: research note for Biblioteca's provisional catalogue profile.

Research checked 2026-09-24. Sources below are first-party websites,
documentation, or repositories. Examples in this note are synthetic and do not
reproduce contributor, contact, or production catalogue data.

## Scope and Reading Rule

These projects are not interchangeable:

- ZineCore2 is a metadata specification and reference implementation.
- QZAP is a queer zine archive project whose public site is currently sparse in
  machine-readable documentation.
- ZineCat is a union catalogue with shared discovery and holdings context.
- Barnard is an institutional zine collection documented through its library
  site and library catalogue/access practices.

An implication below is a capability or question for Biblioteca's provisional
model, not a recommendation to adopt another project's schema.

## ZineCore2

### Sources

- [ZineCore2 documentation](https://zinecore.org/)
- [Specification overview](https://zinecore.org/docs/specification)
- [ZineCore2 profile](https://zinecore.org/docs/specification/profiles/zinecore2)
- [AgentCore2 profile](https://zinecore.org/docs/specification/profiles/agentcore2)
- [HoldingCore2 profile](https://zinecore.org/docs/specification/profiles/holdingcore2)
- [RepoCore2 profile](https://zinecore.org/docs/specification/profiles/repocore2)
- [Specification repository](https://github.com/ZineCore2/spec)
- [Reference server repository](https://github.com/ZineCore2/server)
- [ZineCore2 GitHub organization](https://github.com/ZineCore2)

### What the sources actually demonstrate

- The documentation describes four related Dublin Core application profiles:
  zines, agents, holdings, and repositories. It names five synchronized
  artifacts for each profile: a narrative, DC TAP table, JSON Schema, JSON-LD
  context, and TypeScript types.
- The ZineCore2 profile models an issue as a zine description and has explicit
  repeatable fields for series, creators, contributors, publishers, dates,
  languages, rights, identifiers, and related works. It also distinguishes
  issue designation and edition statement.
- AgentCore2 makes the public display name primary and explicitly provides
  agent kind, roles, alternative names, pseudonyms, anonymity/privacy, and
  optional private legal/contact values.
- HoldingCore2 separates a bibliographic zine description from a specific
  physical or digital holding. A holding links a zine to a repository and can
  record location, call number, condition, access status, digital URL, and
  digitization/duplication status.
- RepoCore2 describes the repository itself, including repository kind, scope,
  location, identifiers, status, and access policy.
- The public `ZineCore2/spec` repository is a public, MIT-licensed repository
  with `docs`, `profiles`, `schemas`, `contexts`, `types`, and vocabulary
  directories. Its page showed four commits, one open issue, no releases, and
  an `develop` branch when checked.
- The public `ZineCore2/server` repository describes a Django/PostgreSQL
  reference API with endpoints for zines, agents, repositories, holdings, and
  authenticated submissions. Its page showed 32 commits, one open issue, no
  releases, and an `develop` branch when checked. The documentation describes
  the server as a reference implementation, not evidence that it is a hosted
  production service.
- The documentation currently labels the profile family version `2.0.0` and
  describes versioned `/v2/` namespaces. That is the documentation's stated
  version, not an independent release or adoption measure.

### Implications for Biblioteca's provisional domain model

- Keep `publication`, `edition`, and `collection/series` conceptually
  separate. A synthetic record such as `publication: P-001`,
  `edition: E-001`, `series: S-001`, `issue: 4` should not be flattened into a
  title plus year when those distinctions are known.
- Keep contributor/creator, publisher, submitter, and other roles explicit.
  A participant may be a person, collective, or organization and may have a
  public display name different from private identity evidence.
- Treat a local or external file as an asset/holding/version with its own
  provenance and access facts. A record such as `asset: A-001` can be a
  reading copy without being asserted to be the authorised original.
- Keep repository or custody context distinct from publication metadata. This
  supports Biblioteca's distinction between a catalogue record, local archive
  observation, and source/reading/derivative file.
- Repeatable dates, languages, subjects, genres, rights, and identifiers are
  useful requirements to test against the profile's multilingual and uncertain
  date cases. Controlled vocabularies should be governed separately from the
  publication record.
- The four-profile split supports the existing rule that discovery, reading,
  preservation, and reuse access are separate decisions.

### What not to infer

- Do not infer that ZineCore2's documented fields are a universal zine
  cataloguing standard or that Biblioteca should adopt all four profiles.
- Do not infer that the examples in the documentation are records in a live
  public catalogue, or that a JSON Schema proves data quality, rights, or
  preservation custody.
- Do not infer that ZineCore2's public repositories are production-ready for
  Biblioteca merely because a reference server and deployment instructions
  exist. The checked repository pages show development branches and no
  releases.
- Do not equate a `holding` or `digital_url` with an authorised original,
  preservation master, checksum, or unrestricted download.
- Do not copy the documentation's real-world illustrative names or URLs into
  tests or fixtures; use synthetic values such as `P-001` and
  `creator: collective-example`.

## QZAP / Queer Zine Archive Project

### Sources

- [QZAP official site](https://qzap.org/)
- [QZAP robots policy](https://qzap.org/robots.txt)
- [ZineCat's first-party project history](https://www.zinelibraries.info/zine-union-catalog/)
- [ZineCat catalogue entry point](https://zinecat.org/)

### What the sources actually demonstrate

- The QZAP site is reachable and identifies itself as “QZAP: The Queer Zine
  Archive Project”; its public landing page currently exposes a logo and little
  catalogue/schema documentation in the fetched page.
- QZAP's robots policy identifies operational paths such as `/admin/`,
  `/includes/`, `/config/`, `/logs/`, and `/backup/` as non-public. This is
  evidence of a deployed web application boundary, not evidence of its data
  model.
- ZineCat's first-party history credits QZAP participation in the union-catalog
  history and links the Queer Zine Archive Project as a partner. The live
  ZineCat landing page also displays QZAP among partner libraries.
- No public QZAP schema, API documentation, source repository, or current
  record export was located through the official pages checked. That absence
  is itself a research limit, not proof that no internal schema exists.

### Implications for Biblioteca's provisional domain model

- Treat archive identity, collection scope, and public web presence as
  separate from the fields used to describe a publication. Biblioteca may need
  a source/repository reference without assuming that the external system can
  be imported or queried.
- Preserve provenance and uncertainty when a record is derived from an archive
  landing page, partner listing, or external link. For example,
  `source: qzap-site` can mean “source identified the project,” not “source
  supplied this publication metadata.”
- Keep queer, feminist, political, or other community scope as collection or
  contextual information unless a controlled subject/genre decision says
  otherwise. A repository's name does not automatically become a publication
  subject.

### What not to infer

- Do not infer QZAP's current schema, catalogue completeness, rights policy,
  digitization status, or record-level access rules from the landing page,
  robots policy, or ZineCat's partner listing.
- Do not infer that a QZAP link means Biblioteca has permission to copy,
  mirror, download, or republish a file.
- Do not infer that the lack of public schema documentation means QZAP has no
  structured metadata or that its project is inactive. The checked sources are
  insufficient to establish either conclusion.

## ZineCat / Zine Union Catalog

### Sources

- [ZineCat live catalogue](https://zinecat.org/)
- [ZineCat advanced object search](https://zinecat.org/index.php/Search/advanced/objects)
- [ZineCat project description and history](https://www.zinelibraries.info/zine-union-catalog/)

### What the sources actually demonstrate

- The live catalogue identifies itself as the Zine Union Catalog, is powered by
  CollectiveAccess, and lists partner libraries including QZAP and Barnard.
- The advanced search exposes object-level fields including title, accession
  number, keyword, type, date range, and collection. Its type choices include
  physical printed zine and academic item.
- The catalogue's search guide says metadata is intended to be clickable and
  searchable by values such as titles, creators, years, locations, and place
  created. It also explicitly says the project is still being worked on and
  that some links may not yet be live.
- ZineLibraries.info's project page describes ZineCat as a union catalogue for
  shared cataloguing and holdings information across libraries with disparate
  schemas and vocabularies. It states a goal of Linked Open Data and identifies
  the project as a community capstone rather than a claim that every zine
  library participates.
- The live site labels its public content CC BY-SA 4.0. That is the site's
  stated content licence and does not automatically license every zine or
  image represented in the catalogue.

### Implications for Biblioteca's provisional domain model

- Model `repository` and `holding` separately from `publication`. A synthetic
  `publication: P-002` may have `holding: H-001` at `repository: R-001` with a
  local collection, accession number, or access condition.
- Allow local catalogue identifiers and collection memberships in addition to
  Biblioteca's stable public identifier. Identifiers should retain their
  namespace/source rather than being silently treated as globally equivalent.
- Preserve crosswalk provenance when importing or comparing metadata from
  systems with different schemas and vocabularies. “Searchable” and
  “clickable” are discovery behaviors, not proof that a value is authoritative.
- Represent incomplete processing and link availability as operational or
  evidence states. A missing live link should not automatically become a
  missing publication, withdrawal, or failed preservation event.

### What not to infer

- Do not infer that ZineCat's object type, fields, or CollectiveAccess backing
  define Biblioteca's required schema.
- Do not infer that a partner-library listing proves a particular publication
  is held there, that all holdings are digitized, or that a catalogue link is a
  reading/download link.
- Do not infer that ZineCat's CC BY-SA 4.0 label grants reuse rights in the
  underlying zines, scans, creator names, or external media.
- Do not infer completeness or current metadata quality from the existence of a
  search facet; the project itself says some metadata links are not yet live.

## Barnard Zine Library

### Sources

- [Barnard Zine Library](https://zines.barnard.edu/)
- [About the collection](https://zines.barnard.edu/about-collection)
- [Collection access and circulation](https://zines.barnard.edu/collection-access-circulation)
- [Barnard zines with online links](https://zines.barnard.edu/barnard-zines-online-links)

### What the sources actually demonstrate

- Barnard describes a physical collection with open-stack zines and special
  collections, and says that some material is not yet processed or fully
  represented in the catalogue.
- The access page distinguishes circulating/open-stack material from
  special-collections material requiring advance request and reading-room
  use. It describes local call-number practice and points researchers to the
  Columbia Libraries Online Catalog (CLIO).
- The same page says catalogue records can contain author, call number, subject
  headings, and a short contents summary. It also documents that some zines
  are available through interlibrary loan while access differs by user/network.
- Barnard's rights guidance says zines remain protected by copyright unless an
  anti-copyright statement applies, and asks researchers to seek creator
  permission before publishing images or substantial text. The page permits
  personal research reproduction subject to those stated limits.
- Barnard's collection page records a collection history and describes the
  collection as a research resource; its historical counts are explicitly
  dated and include material awaiting processing.

### Implications for Biblioteca's provisional domain model

- Separate `publication` from physical `holding`, `location`, `condition`, and
  access policy. “Publicly discoverable” must not imply “loanable,”
  “digitized,” or “available for download.”
- Represent processing state and catalogue coverage as evidence about a
  collection, not as a definitive count of all publications. A synthetic
  holding can be `unprocessed` or `not-yet-catalogued` without deleting the
  related submission or publication concept.
- Keep rights and reuse policy independent from reading access. A public
  catalogue record may support research discovery while reproduction or online
  publication remains restricted or unknown.
- Preserve local shelfmarks/call numbers as repository-specific identifiers;
  they should not replace Biblioteca's stable slug or be parsed as publication
  dates, creators, or subjects.

### What not to infer

- Do not infer that Barnard's collection counts are current, exhaustive, or
  directly comparable to Biblioteca's catalogue count; the page dates some
  counts and notes unprocessed material.
- Do not infer that a CLIO record means a digital copy exists. A physical
  holding, catalogue record, online link, and scan are different claims.
- Do not infer that permission to read, borrow, or make a private research copy
  grants permission to mirror or publicly redistribute a zine.
- Do not transplant Barnard's call-number, circulation, or access rules into
  Biblioteca without a local policy decision.

## Cross-Project Conclusions

The sources support these provisional conclusions for Biblioteca:

1. Keep publication identity, edition/issue distinctions, participant roles,
   repository/holding context, file assets/derivatives, processing history, and
   access dimensions separate even if the current database still stores some of
   them together.
2. Treat external systems as sources of claims with provenance, not as
   automatically authoritative originals or migration targets.
3. Support multiple local identifiers and crosswalks without replacing the
   Biblioteca identifier.
4. Model incomplete processing, unavailable links, and uncertain rights as
   explicit evidence or state rather than silently converting them to absence,
   deletion, or permission.
5. Validate any future schema against synthetic cases for anonymous or
   pseudonymous creators, collectives, multiple editions, physical and digital
   holdings, unprocessed items, external reading copies, and restricted reuse.

## Verification Limits

The checked URLs returned successful HTTP responses where noted during the
research pass. QZAP's public landing page was reachable but did not expose
machine-readable catalogue documentation in the fetched content. GitHub pages
for ZineCore2/spec and ZineCore2/server were reachable and supplied the public
repository branch, activity, issue, release, and file-list observations above.
Those observations are snapshots as of the research date, not guarantees about
future activity or service availability.
