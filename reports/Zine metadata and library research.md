# Zine Metadata and Library Research

Research date: 2026-09-24

This report synthesizes the notes in `research_notes/Zine metadata and library research/`, together with [Zine Format Archive Research](../docs/zine-format-archive-research.md) and [Zine Archive References](../docs/zine-archive-references.md). It recommends a Biblioteca profile for zines, with particular attention to Brazilian zines. Examples are synthetic and do not reproduce source records or private contributor data.

## Executive Findings

1. Biblioteca should use a layered model rather than a single flat zine record: publication/issue, series and edition, agents and role assertions, physical description, place/context, repository holdings, digital assets, provenance, and rights/access decisions should be distinct.
2. ZineCore2 is the best current interoperability reference for separating zines, agents, holdings, and repositories, and for repeatable creators, contributors, series, issues, dates, languages, rights, subjects, genres, and identifiers. It should be adapted and exported to, not adopted as Biblioteca's database model. Its public artifacts are recent, unreleased, version-inconsistent, and materially contradictory ([ZineCore2 notes](../research_notes/Zine%20metadata%20and%20library%20research/zinecore.md), [specification](https://zinecore.org/docs/specification)).
3. Zine-specific description is not decorative enrichment. Form/genre, maker identity, self-description, issue context, unconventional assembly, reproduction method, local language, and community context can be central to a zine's meaning and discoverability. Conventional library metadata remains useful for exchange, but must not erase those facts ([O'Dell, 2014](https://doi.org/10.1080/19386389.2014.978235); [Zine Librarians cataloguing resource](https://www.zinelibraries.info/running-a-zine-library/zine-cataloging/)).
4. Brazilian evidence is heterogeneous rather than standardized. Biblioteca de Zines provides a strong reader-facing baseline; La Fanzinoteca demonstrates dimensions, reproduction, identifiers, and separate category/content treatment; Zine Gororoba demonstrates series, editions, events, prompts, and local community context; Marca de Fantasia demonstrates publisher and series relationships. None supplies a complete Brazilian zine metadata standard ([Brazilian research note](../research_notes/Zine%20metadata%20and%20library%20research/brazilian%20archives.md)).
5. Required intake should be deliberately small: a public title/display name, record identity, and enough source/provenance to explain the record. Subject, genre, date, language, rights, page count, dimensions, reproduction, and place should allow unknown, withheld, or unresolved states rather than force guesses. This diverges from ZineCore2's required `title`, `creator`, `subject`, `genre`, `date`, `language`, and `rights` because a community archive must not invent facts to satisfy validation ([ZineCore2 schema](https://raw.githubusercontent.com/ZineCore2/spec/develop/schemas/zinecore2.schema.json)).
6. Privacy, autonomy, anonymity, and rights are metadata requirements. Public display name, pseudonym, collective, anonymous authorship, legal identity, contact information, provenance, and visibility must be separable. A public URL, anti-copyright phrase, free download, or catalogue record is not automatically permission to digitize, mirror, redistribute, or make derivatives ([Zine Librarians Code of Ethics, 2015](https://www.zinelibraries.info/code-of-ethics/); [Barnard access and circulation](https://zines.barnard.edu/collection-access-circulation)).
7. Place must be role-qualified. For Brazilian records, municipality and UF are useful access points only when supported by the source, and must not be inferred from the archive location, a creator's current address, a country tag, or a city mentioned in unrelated biography. Preserve the original place statement and its precision.
8. Physical publication extent and digital asset extent must never be conflated. A PDF page count is an asset fact, not necessarily the printed zine's pagination. Dimensions, folded/open state, loose inserts, binding/assembly, color, handwriting, collage, and reproduction method should be recorded when observed or supplied, with source and uncertainty.

## Source-by-Source Evidence

### ZineCore2

ZineCore2 defines related profiles for zines, agents, holdings, and repositories, with narrative documentation, DC TAP, JSON Schema, JSON-LD context, and TypeScript types ([home](https://zinecore.org/); [profiles](https://zinecore.org/docs/specification)). Its strongest conceptual contribution is separation:

- The zine profile treats an issue as a description and includes title, alternative title, series, issue designation, edition statement, creator, contributor, publisher, subject, genre, abstract, table of contents, notes, date, dimensions, pages, format, binding, place, language, coverage, source, relation, identifier, and rights ([zine profile](https://zinecore.org/docs/specification/profiles/zinecore2)).
- AgentCore2 makes public display name primary and supports person, collective, organization, pseudonym, anonymity, privacy, roles, alternative names, and private legal/contact values ([agent profile](https://zinecore.org/docs/specification/profiles/agentcore2)).
- HoldingCore2 separates a described zine from a repository-specific physical or digital holding, including location, call number, condition, access, URL, and digitization/duplication status ([holding profile](https://zinecore.org/docs/specification/profiles/holdingcore2)).
- RepoCore2 separates repository identity, scope, location, status, and access policy from the zine and its agents ([repository profile](https://zinecore.org/docs/specification/profiles/repocore2)).

Adopt these separations and repeatability. Adapt flat strings into assertions carrying role, source, confidence, date, and visibility. Do not treat its required fields as Biblioteca intake requirements, its vocabulary as complete, its `public` boolean as sufficient privacy control, or its current repositories/server as a stable production contract. The notes observed contradictions between prose, TAP, schema, types, and server, including unconstrained date strings, optional versus central identifiers, and a holding `id` mismatch. The public repositories used `develop`, had no releases when checked, and were created recently ([spec repository](https://github.com/ZineCore2/spec); [server repository](https://github.com/ZineCore2/server)).

### Brazilian collections and projects

- **Biblioteca de Zines.** The public catalogue exposes title, creator/collective, year, categories, description, cover/preview, and reading link; browse supports search, year, and category filters ([home](https://www.biblioteca-de-zines.com.br/); [browse](https://www.biblioteca-de-zines.com.br/zines); [about](https://www.biblioteca-de-zines.com.br/about)). This is the appropriate lightweight discovery baseline. It does not expose stable per-record fields for language, place/UF, physical extent, reproduction, rights, holdings, custody, or asset provenance. Its intake form shows that creators/collectives and multiple submitted zines are important, but intake values are not automatically public record values ([submission](https://www.biblioteca-de-zines.com.br/zines/apply)).
- **La Fanzinoteca.** Brazilian records expose an entry/holding identifier, authorship, language/date, width and height, black-and-white photocopy, a broad binding value on one record, category/content distinctions, and a Brazil tag ([Brazil index](https://fanzinoteca.net/fanzine-country/brasil/); [record example](https://fanzinoteca.net/fanzine/papel-xerocado-manifesto-cultural-1/); [Minizine](https://fanzinoteca.net/fanzine/minizine/)). This is the clearest Brazilian precedent for separating dimensions, reproduction, binding, category, content, and identifiers. It does not establish a UF field or a complete universal schema.
- **Zine Gororoba / UTFPR-linked project.** Its first-party link hub identifies a Curitiba art-zine initiative, editions, event/workshop context, themes/prompts, occasional dates, and digital delivery links ([Linktree](https://linktr.ee/zinegororoba)). It shows that series, edition, event, place, and community context should not be flattened into a description. It is not a stable library catalogue or proof of university-wide policy, custody, rights, or physical metadata.
- **Marca de Fantasia.** The independent publisher/archive preserves title, creator/editor, section or series, cover, persistent page, and publisher-level context ([site](https://marcadefantasia.com/)). Its Paraiba location is publisher context, not automatically each work's place of publication. Retain publisher and series relationships without importing its promotional or distribution model as holdings policy.
- **Brazilian scholarship and repositories.** The UnB thesis on cataloguing alternative publications treats fanzine and cordel as a Brazilian cataloguing problem ([repository record](https://bdm.unb.br/handle/10483/22374)), but its detailed recommendations were not verified from the full text. Brazilian article records preserve scholarly title, authors, date, language, DOI, and journal extent, while abstracts preserve educational, visual, and workshop context ([Zavam](https://doi.org/10.1590/1982-4017-06-01-01); [Zauith, Davanco and Barbieri](https://doi.org/10.11606/issn.2316-9125.v24i1p56-68); [Lima, Salvador and Pereira](https://doi.org/10.5902/2179460x35516)). These are evidence for context and role distinctions, not item-level page counts, reproduction fields, or rights for the zines discussed.

### Library scholarship and international practice

- **O'Dell** reports that RDA is usable but needs expansion for makers, intellectual property, privacy, subject/genre analysis, object cataloguing, external vocabularies, and blurred work/expression/manifestation boundaries ([DOI](https://doi.org/10.1080/19386389.2014.978235)). The full article was not available in the review, so this evidence is limited to the abstract.
- **Berthoud** describes the mismatch between DIY publication practices and academic/commercial publishing assumptions, especially irregular frequency, authorship, and content ([DOI](https://doi.org/10.1080/00987913.2018.1434857)). It is practitioner scholarship, not a universal standard, and the full article was not reviewed.
- **Freedman and Kauffman** frame zine cataloguing as a bridge between cataloguing and community expertise ([Columbia Academic Commons](https://academiccommons.columbia.edu/doi/10.7916/D8K35RQR)). Community participation is therefore a method requirement, not just consultation after schema design. Detailed field claims need verification against the deposited chapter.
- **Zine Librarians guidance and Code of Ethics.** The 2015 Code is explicitly non-prescriptive and revisable; its cataloguing guidance emphasizes anonymity, creator autonomy, deadnames/trans identity, author-supplied language, local terms, OCLC/search harvesting risk, and the distinction between discoverable and publishable information ([Code](https://www.zinelibraries.info/code-of-ethics/); [cataloguing resource](https://www.zinelibraries.info/running-a-zine-library/zine-cataloging/)). Use it as community ethics and practice guidance, versioned by edition, not as law or a formal standard.
- **Barnard Zine Library.** Barnard demonstrates the operational difference between collection scope, catalogue record, physical holding, open-stack/circulating status, special collection, online link, and rights/reproduction permission ([collection](https://zines.barnard.edu/about-collection); [access](https://zines.barnard.edu/collection-access-circulation); [online links](https://zines.barnard.edu/barnard-zines-online-links)). Its pages state that some material is unprocessed and that online links may be dead or point to another form. Do not treat collection counts or catalogue presence as completeness or digital availability.
- **ZineCat.** The union catalogue exposes title, accession number, keyword, type, dates, collection, locations, and `Place Created`, including `Physical (printed) Zine` as a type ([advanced search](https://zinecat.org/index.php/Search/advanced/objects); [project history](https://www.zinelibraries.info/zine-union-catalog/)). It supports typed local identifiers, repository/holding context, and crosswalks across disparate schemas. It is a work in progress, not Biblioteca's required schema; partner presence does not prove item-level holdings or permissions.
- **QZAP.** The official site identifies the Queer Zine Archive Project, and ZineCat identifies it as a partner, but the checked public pages did not expose a current record schema or export ([QZAP](https://qzap.org/); [ZineCat](https://zinecat.org/)). Preserve this as a source/project relationship only; do not infer its rights, completeness, or data model.
- **Local procedures and manuals.** Franklin & Marshall procedures and the Queer Zine Library manual are useful examples of local/community choices, not universal rules ([FM procedures](https://www.zinelibraries.info/wp-content/uploads/2022/10/Cataloging-Zines_-FM-Zine-Library-Procedures.pdf); [Queer Zine Library manual](https://docs.google.com/document/d/12KluusaAdw7Ao5cYXK6sxA1Okm-0anghvWVpVb7fwjs/edit)). The latter was not reliably retrievable and needs version/authorship verification.

## Zine-Specific Versus Generic Metadata

### Generic library metadata worth retaining

Biblioteca should retain stable identifiers, title, alternative title, dates, language, agents, relationships, subjects, form/genre, notes, provenance, holdings, access, and rights. These support discovery and interchange through Dublin Core, JSON-LD, MARC or other crosswalks. Use typed identifiers and source-qualified assertions rather than one undifferentiated URL list. ZineCat and ZineCore2 show why shared discovery needs these common concepts ([ZineCat history](https://www.zinelibraries.info/zine-union-catalog/); [ZineCore2 JSON-LD guidance](https://zinecore.org/docs/specification/technical-artifacts/jsonld-contexts)).

### Zine-specific metadata that must not be flattened away

- Creator-chosen display name, pseudonym, collective, anonymity, and authorship status.
- Creator wording, self-description, local terms, and community review history beside normalized terms.
- Form/genre distinct from subject and delivery format: for example, `perzine`, `fanzine`, `comic zine`, or `single-sheet` is not the same claim as `housing`, `punk`, or `trans health`.
- Issue, series, edition, irregular/seasonal numbering, reprint and unnumbered status.
- Material and production evidence: photocopy, risograph, offset, handwriting, collage, folded sheets, loose inserts, stapling, sewing, altered books, unusual pagination, and color.
- Production and circulation context: workshop, event, prompt, scene, venue, local network, or educational setting, with visibility controls.
- Place roles and Brazilian geography, including municipality and UF when supported.
- Rights as layered claims: legal status, creator copying request, digitization permission, repository permission, preservation permission, and current operational access.

The distinction is not that these fields are never used in library catalogues. It is that zine practice makes their ethical and material meanings unusually consequential, and standard bibliographic strings often cannot carry source, uncertainty, consent, or context.

## Recommended Profile Fields

Status means **required** for an accepted public record, **optional** when known or useful, or **deferred** until Biblioteca has policy, vocabulary, workflow, or evidence to support it. Unknown and withheld are valid states; they are not failures.

| Area and field | Status | Recommendation and evidence rule |
| --- | --- | --- |
| `biblioteca_id` | Required | Stable local identifier for the record; never silently replace it with a source or external ID. |
| `title_as_presented` | Required | Preserve spelling, capitalization, diacritics, punctuation, and creator/publication wording. |
| `normalized_search_title` | Optional | Add a search access point separately; do not overwrite the presented title. |
| `alternative_title` | Optional | Repeatable, source-qualified, and language-tagged. |
| `record_status` | Required | Distinguish draft, accepted, unprocessed, withdrawn, suppressed, and unresolved identity. |
| `agent` and `agent_role` | Required when attribution exists; otherwise allowed unknown/anonymous | Repeatable relationship assertions for creator, co-creator, editor, illustrator, publisher, distributor, submitter, workshop participant, or documentation author. Include order, source, authorship status, confidence, and visibility. |
| `public_display_name` | Required for public attribution | Use the chosen name exactly as presented. Support person, collective, organization, pseudonymous, anonymous, private, unknown, and unresolved states. |
| `series` | Optional | Model series as a relationship with its own label/ID; do not copy a series name into subject. |
| `issue_designation` | Optional | Preserve numbers, seasons, dates-as-labels, and unnumbered statements as supplied. Do not infer issue identity from year. |
| `edition_statement` | Optional | Use for reprint, corrected, special, translated, or otherwise materially distinct editions only when evidence supports it. |
| `form_genre` | Optional, strongly recommended | Repeatable controlled or creator-supplied values such as zine, fanzine, perzine, art zine, comic zine, newsletter, or single-sheet; retain vocabulary/version/source. |
| `subject` | Optional, strongly recommended | Repeatable topical terms, distinct from form; retain creator wording and local proposals beside mapped terms. |
| `description_creator` | Optional | Preserve the creator's own description verbatim or as an explicitly marked transcription, with language and visibility. |
| `description_cataloguer` | Optional | Separate summary, evidence, author, date, and public-display decision. |
| `language_content` | Optional | Use a maintained language vocabulary; support multiple languages, bilingual/multilingual issues, non-textual content, and unknown. Do not infer from title, site, or country. |
| `language_metadata` / `language_transcription` | Deferred | Add only when a defined workflow needs to distinguish record language from publication language. |
| `date_statement` | Optional | Preserve `circa`, season, range, undated, or other source wording. |
| `date_normalized`, `date_role`, `date_precision`, `date_uncertainty` | Optional | Normalize only when defensible; role may be publication, creation, revision, event, acquisition, scan, deposit, or other. |
| `place_assertion` | Optional | Repeatable place plus role: created-in, published-in, printed-in, circulated-in, event, creator context, publisher location, or holding location. Preserve source and precision. |
| `municipality` | Optional | Record only when the source supports the place claim; retain the original wording and normalization source. |
| `state_uf` | Optional | Use Brazilian UF only for a supported Brazilian place value. Do not infer from city, archive, country tag, or current address. |
| `country` | Optional | Keep country as a separate, role-qualified claim; a `Brasil` tag is not necessarily place created or published. |
| `community_context` | Optional | Workshop, event, educational setting, scene, venue, collective, neighborhood, or circulation network, with source and visibility. |
| `physical_extent` | Optional | Separate page count, sheet count, and other extent; preserve counting convention and whether supplied, measured, or observed. |
| `dimensions` | Optional | Width, height, unit, and state such as folded/closed, open, or trimmed; source-qualify measured versus supplied values. |
| `binding_assembly` | Optional | Repeatable observations such as folded, stapled, sewn, loose sheets, accordion, insert, or other; retain `unknown` rather than guess. |
| `reproduction_method` | Optional | Photocopy, risograph, offset, digital print, handwritten, screenprint, etc. only from creator statement, catalogue value, or documented observation. |
| `material_features` | Optional | Free-text notes for collage, handwriting, unusual pagination, paper, inserts, color, altered material, or features not captured by vocabulary. |
| `delivery_format` | Optional | Physical printed, digital-born, scan, web publication, audio/video, or mixed; do not use it as a substitute for physical form. |
| `holding` | Optional | Repository/steward, local collection, accession, call number, physical location, copy/condition, custody evidence, and processing status. |
| `asset` | Optional | File/URL kind, source, format, byte-level checksum when available, scan properties, version, derivative relation, and ambiguous-match state. |
| `access_decisions` | Optional | Keep discovery, reading, download, preservation, replication, and reuse decisions separate; scope each to publication, issue, copy, file, page, or derivative. |
| `rights_claim` | Optional but never silently assumed | Preserve original wording, claimant/source, date, scope, confidence, and normalized mapping. `unknown` means unknown, not licensed. |
| `creator_copying_request` | Optional | Preserve anti-copyright, copyleft, `please copy`, or similar language as a creator statement, separate from legal permission. |
| `visibility` | Required for sensitive assertions | Field- and relationship-level public, limited, internal, suppressed, or delayed visibility; do not rely on one agent-level boolean. |
| `consent_correction_withdrawal` | Optional operational record | Record request, decision, date, scope, and evidence without requiring a pseudonymous creator to disclose legal identity. |
| `provenance` | Required for supplied/observed/imported claims | Source, assertion author, date, method, confidence, and whether the value is creator-supplied, cataloguer-observed, imported, inferred, or unresolved. |
| `vocabulary_version` | Optional but required for controlled values | Preserve vocabulary identifier, version, preferred label, local mapping, and historical value. |
| `external_identifier` | Optional | Typed system/value/URI, source, verification state, and visibility; distinguish publication, agent, holding, repository, and asset identifiers. |
| `table_of_contents` | Deferred | Add after a scope and transcription policy exists; do not require it for non-paginated or image-led zines. |
| `abstract` as a required field | Rejected | Use creator description and cataloguer summary as separate optional fields; a mandatory abstract is inappropriate for every zine. |
| automatic canonical subject/genre mapping | Deferred | Govern local vocabulary and community review before making mappings public or authoritative. |

## Format, Extent, and Reproduction

Record physical and digital facts at the level where they are true:

- A synthetic physical record may say: `8 folded sheets; one loose insert; photocopy, black and white; hand-stapled; 21 x 29.7 cm closed; observed from copy H-001`. Preserve the observation rather than silently converting it to `16 pages`.
- A synthetic digital asset may say: `PDF, 24 pages, 12 MB, scan source unknown, checksum recorded, reading access public, reuse unknown`. Do not transfer `24 pages` to the physical publication unless the source establishes that pagination relationship.
- If a creator supplies `A5`, store it as supplied and record whether Biblioteca measured it. If an item has different folded and open dimensions, store both with state labels.
- If the record says only `digital`, use delivery format, not physical dimensions or reproduction method. A PDF, cover image, filename, or aspect ratio cannot prove photocopy, risograph, offset, binding, page count, or physical existence.
- Reproduction method should accept multiple values where an issue combines methods and should retain `unknown`. La Fanzinoteca's black-and-white photocopy example is evidence for the field, not permission to infer it from visual style ([record](https://fanzinoteca.net/fanzine/papel-xerocado-manifesto-cultural-1/)).

## Place, UF, and Brazilian Context

Biblioteca should make place a repeatable assertion with `place_role`, not a single `place` field. Useful roles include creation, publication, printing, distribution, circulation, event/workshop, creator context, publisher location, archive/holding location, and source statement. A single zine can legitimately have several places.

For Brazilian records:

- Store the source wording, normalized municipality, country, and `state_uf` separately.
- Add UF only when a supported source links the municipality or place to that UF. Do not derive UF from a place name that is ambiguous, from an archive's location, or from a creator's current address.
- Do not equate `Brasil` country tags with place created or published. La Fanzinoteca's country discovery value demonstrates the distinction ([Brazil index](https://fanzinoteca.net/fanzine-country/brasil/)).
- Preserve local communities, events, universities, workshops, collectives, venues, and circulation scenes as context with their own visibility decision. Zine Gororoba and Brazilian scholarship show that these contexts can be central to production, while not being ordinary subject headings ([Zine Gororoba](https://linktr.ee/zinegororoba); [USP workshop article](https://doi.org/10.11606/issn.2316-9125.v24i1p56-68)).
- Do not infer Portuguese from a Brazilian site, title, or publisher. Record language only from the publication or reliable source.
- Retain Portuguese creator/community terms alongside any English or controlled-vocabulary mapping. Translation can improve discovery but must not replace the original wording.

## Privacy, Autonomy, Anonymity, and Rights

### Identity and autonomy

1. Make the public display name primary. Preserve chosen spelling, diacritics, capitalization, and pronouns where supplied and appropriate.
2. Treat a collective as an agent. Do not split it into individuals because a cataloguer recognizes likely members.
3. Distinguish identified, pseudonymous, anonymous, private, unknown, and unresolved authorship. `Anonymous` is a valid public attribution state, not an invitation to research a legal name.
4. Keep legal name, private contact, inferred identity, current address, deadname, and sensitive biography internal by default. A creator should be able to correct, suppress, or withdraw a record without proving an offline identity.
5. Treat submitter, creator, editor, publisher, distributor, workshop participant, documentation author, and repository steward as separate roles. Submission does not establish authorship or rights ownership.
6. Use field- and relationship-level visibility. A public agent name may coexist with a private contact or a restricted source note; one `public` boolean cannot express this safely.
7. Consider delayed indexing, restricted notes, no-search display, and takedown/correction workflows where discoverability itself creates risk. Zine librarians explicitly identify harvesting and creator privacy as concerns ([cataloguing guidance](https://www.zinelibraries.info/running-a-zine-library/zine-cataloging/)).

### Rights and access

Record four different things where applicable: the original rights statement, a legal rights claim, a creator copying request, and Biblioteca's operational decision. Each needs source, scope, date, confidence, and visibility.

- `Please copy`, anti-copyright, copyleft, or `free to download` should be preserved verbatim as a creator statement. It is not automatically permission to digitize, mirror, sell, publicly display, make derivatives, or republish substantial text/images.
- A public catalogue record or URL establishes discovery, not custody, authenticity, copyright permission, or preservation permission.
- Reading, download, preservation, replication, and reuse may have different decisions. A zine can be discoverable and readable while download or reuse is restricted.
- Rights may differ by publication, issue, physical copy, scan, page, or derivative. Scope every decision.
- Borrowing or private research reproduction is not the same as public redistribution. Barnard explicitly separates access and research reproduction from permission to publish images or substantial text ([rights/access](https://zines.barnard.edu/collection-access-circulation)).
- Preserve unknown as unknown. Do not use a mandatory license field, a public URL, a CC label on a catalogue site, or an archive holding as a substitute for evidence.

## Adopt, Adapt, Reject

### Adopt

- Publication/issue, agent, holding, repository, and asset separation from ZineCore2, HoldingCore2, RepoCore2, ZineCat, and Barnard.
- Repeatable role-bearing creator/contributor/publisher relationships.
- Series, issue designation, and edition distinctions.
- Separate form/genre from subject and delivery format.
- Stable Biblioteca identifiers plus typed external identifiers and provenance.
- Source-preserved creator wording, physical observations, community context, and uncertainty.
- Place roles, Brazilian municipality/UF when supported, and separate holding location.
- Separate discovery, reading, download, preservation, replication, and reuse access.
- Creator correction, suppression, withdrawal, and privacy workflows.

### Adapt

- ZineCore2's required fields: use small Biblioteca acceptance requirements and explicit unknown/withheld/unresolved states.
- ZineCore2 dates: retain human-readable source statement plus normalized interval, role, precision, uncertainty, and provenance.
- ZineCore2 language: use maintained validated values, multilingual content, and separate metadata/transcription language if needed.
- ZineCore2 vocabularies: import as candidate mappings, retaining vocabulary/version and creator language; do not assume complete coverage for Brazilian or local terms.
- AgentCore2 privacy: replace one public/private boolean with field and relationship visibility, consent, and public projections.
- HoldingCore2 duplication status: treat it as a local operational decision, not legal authority.
- ZineCore2 `source`, `relation`, `rights`, and `identifier` arrays: split them into typed assertions with role, scope, source, verification, and visibility.
- Dublin Core, JSON-LD, MARC, and other standards: use them as exports/crosswalks and document information loss, not as the authoritative local semantics.

### Reject or defer

- Treating ZineCore2's current `develop` artifacts or reference server as Biblioteca's backend or immutable canonical contract.
- Making subject, genre, date, language, rights, page count, dimensions, reproduction, or place mandatory merely to make a record look complete.
- One mixed category field for form, topic, event, programme, and delivery format.
- One public/private switch for all agent data.
- One undifferentiated place, source, rights, access, or identifier field.
- Inferring physical form, pagination, reproduction, place, language, authorship, custody, or permission from a PDF, image, URL, filename, collection location, country tag, or catalogue facet.
- Requiring an abstract or table of contents for every zine.
- Copying Barnard call numbers, circulation policy, or collection scope into Biblioteca without a local decision.
- Treating community vocabulary, a publisher catalogue, a workshop article, or a project link hub as a universal Brazilian standard.

## Uncertainty and Source Limitations

- The public Brazilian evidence is strongest for reader-facing discovery and community context, and weak for stable item-level rights, custody, physical extent, reproduction, language, and UF fields. The UnB thesis is a high-value lead, but its full field recommendations were not verified.
- Brazilian project pages, publisher catalogues, and scholarly records describe different objects and purposes. Article page counts are not zine page counts; a repository holding a thesis is not a holding of the zine discussed in it.
- The checked public Biblioteca de Zines interface did not expose a formal schema, revision history, or complete preservation policy. Its public fields are evidence of display practice, not proof of internal data limitations.
- Zine Gororoba's UTFPR relationship comes from its own first-party link hub; it does not establish institutional ownership or policy. Marca de Fantasia is a publisher/archive, not a neutral library catalogue.
- La Fanzinoteca provides unusually concrete Brazilian physical-description evidence, but its broad binding/category values do not define a complete vocabulary and its country tag does not establish place created or UF.
- ZineCore2 documentation, TAP, schema, types, and server are not fully synchronized; public version/release evidence was limited. Any future export should pin an exact reviewed commit or release, vocabulary versions, and known information-loss decisions.
- O'Dell, Berthoud, and some professional guidance were available only as abstracts or landing pages. The Code of Ethics is community guidance, explicitly non-prescriptive, and the 2015 edition is under revision. FM procedures and community manuals are local examples, not universal requirements.
- Barnard and ZineCat demonstrate useful separations but do not expose every field in their public interfaces. Barnard documents unprocessed material and link instability; ZineCat states that it remains a work in progress. QZAP's public pages did not expose a current schema or export.
- No source reviewed resolves the legal status of every copying statement, the privacy implications of every authority decision, or the governance of every community vocabulary. Biblioteca should make these decisions reviewable, revisable, and community-informed rather than presenting them as neutral facts.

## Recommended Adoption Sequence

1. Implement the required core: Biblioteca ID, presented title, record status, public display attribution or explicit unknown/anonymous state, provenance, and visibility.
2. Add assertion-based series/issue/edition, form/genre, subject, description, language, date, place/municipality/UF, physical description, and community context.
3. Add separate holdings, copies, digital assets, derivatives, checksums, and action-specific access decisions.
4. Add rights/copying statements, consent/correction/withdrawal history, and public projection rules before expanding harvesting or union-catalogue exports.
5. Build synthetic crosswalk fixtures covering a collective, pseudonym, anonymous creator, bilingual issue, uncertain date, Brazilian municipality/UF, physical folded sheets with inserts, unknown rights, one physical holding, one externally sourced scan, and an ambiguous match.
6. Export a public ZineCore2-shaped projection only after pinning the reviewed artifact versions and documenting where Biblioteca's richer provenance, privacy, uncertainty, and rights semantics cannot be represented.
