# Zine Format Archive Research

Status: primary-source research note for the provisional Biblioteca profile.

Checked 2026-09-24. This note uses official collection pages, catalogue
interfaces, and record pages. Examples below are synthetic and do not reproduce
contributor, contact, or private production data.

## Research question and reading rule

The question was how real collections describe physical and digital zines in
catalogue-facing metadata: format, extent, dimensions, binding or assembly,
reproduction method, place/country/state, and genre or subject.

"Evidenced" means that the named source visibly provides the field or a direct
example of it. A photograph, a PDF page count, a collection's geographic scope,
or a search result is not treated as evidence of an item-level metadata value.

## Brazilian-priority sources

### Biblioteca de Zines

Sources:

- [Official home](https://www.biblioteca-de-zines.com.br/)
- [Zine discovery catalogue](https://www.biblioteca-de-zines.com.br/zines)
- [Official about page](https://www.biblioteca-de-zines.com.br/about)
- [Example catalogue record](https://www.biblioteca-de-zines.com.br/zines/ali-el-kadre-amigos-da-floresta-1)
- [Public source repository](https://github.com/lumamontes/biblioteca-de-zines)

What is actually evidenced:

- The project describes itself as a free, open-source virtual library for
  independent initiatives in zine form, focused on Brazil and also including
  Latin America.
- The public catalogue exposes title, author link, publication year, category
  labels, a short description, cover/thumbnail references, and a reading link
  in the catalogue flow. The list supports search, year, and category filters.
- The about page describes zines as potentially artisanal and made with
  collages, drawings, text, and photographs. That is collection context and a
  broad description of zines, not a production-method value for each record.
- The checked record demonstrates a digital catalogue presentation of title,
  author, categories, and description. It does not expose physical page count,
  dimensions, binding/assembly, reproduction method, country, or Brazilian UF
  as record fields.

Implication for Biblioteca: retain the existing digital-publication strengths,
but do not treat the PDF link, cover image, category, or collection focus as
evidence of physical form, print method, place of creation, or state/UF.

### La Fanzinoteca: Brazilian records in a specialist catalogue

Sources:

- [Brazil country index](https://fanzinoteca.net/fanzine-country/brasil/)
- [Record: Papel Xerocado Manifesto Cultural 1](https://fanzinoteca.net/fanzine/papel-xerocado-manifesto-cultural-1/)
- [Record: Minizine](https://fanzinoteca.net/fanzine/minizine/)
- [Collection information](https://fanzinoteca.net/info/)

Concrete evidence from the official record pages:

| Catalogue element | Concrete public example | Evidence type |
| --- | --- | --- |
| Record and holding identifier | `Entrada no` and `ID topografica` | Item-level catalogue field |
| Authorship | Author/collective names | Item-level catalogue field |
| Language and date | Portuguese; 2018 | Item-level catalogue fields |
| Dimensions | Width 75 cm; height 105 cm | Item-level physical extent fields |
| Reproduction | Black-and-white photocopy | Item-level graphic-production field |
| Binding/assembly | `Encuadernacion: otras` on one record | Item-level production/binding value, but broad and not universal |
| Genre/content | Creation category; comic fanzine content | Separate category and content fields |
| Place/country | `brasil` tag | Country discovery tag; not a Brazilian state/UF |
| Notes about structure | One record says three different unnumbered issues; another records a large-format item despite a `pequeno formato` tag | Curatorial notes and tags can coexist with physical fields |

This is unusually useful evidence for Biblioteca because it separates dimensions,
graphic production, content, tags, and identifiers rather than making "zine"
the only description. It also shows why field names need interpretation: a
country tag is not the same claim as place created, place published, or creator
location, and a binding value such as "other" does not explain the assembly.

Limits: the checked Brazilian records expose dimensions and production method
but do not visibly expose a page count or Brazilian state/UF. The image itself
was not used to infer a missing binding, page count, or production process.

### Brazilian institutional and community leads

Sources:

- [Biblioteca de Zines links to the UTFPR Zine Gororoba project](https://linktr.ee/zinegororoba)
- [Biblioteca de Zines links to a digital Zineteca](https://drive.google.com/drive/folders/1XcSyJqUTRjb-nnmYgIla6WfRJ8WMJ5B1)
- [UNILA Fanzines project page](https://divulga.unila.edu.br/fanbio/fanzines/)
- [Official Brazilian catalogue research result: ReP USP](https://repositorio.usp.br/)

The official Biblioteca page identifies these as related Brazilian projects, but
the checked public pages do not provide a stable item-level catalogue schema for
the requested physical fields. They are leads for later direct collaboration,
not evidence to import into the provisional profile. An educational or
institutional PDF also cannot establish the physical extent of an underlying
printed zine unless the record explicitly describes that object.

## International comparison

### Barnard Zine Library / Columbia CLIO

Sources:

- [About the collection](https://zines.barnard.edu/about-collection)
- [Access and circulation](https://zines.barnard.edu/collection-access-circulation)
- [Barnard zines with online links](https://zines.barnard.edu/barnard-zines-online-links)
- [Barnard zine cataloguing examples page](https://www.zinelibraries.info/running-a-zine-library/zine-cataloging/)

What the official collection pages evidence:

- The collection is primarily physical, with open stacks and special
  collections; some items are not yet processed or represented in CLIO.
- A catalogue record contains author, call number, subject headings, and a
  short contents summary. The access page gives the local call-number pattern
  `Zines` plus Cutter, with a synthetic example such as `Zines B68s`.
- The online-links page is a curated bridge from catalogue records to external
  digital content. It explicitly says links may no longer be active and some
  links point to content in other forms.
- The collection distinguishes circulating/open-stack holdings from
  special-collections, non-circulating material and reading-room requests.
- The official zine-cataloging resource names Barnard CLIO records as examples
  and lists search concepts such as art zine, DIY zine, personal zines,
  political zines, and split zines. These are discovery/subject language, not
  proof that every item has a controlled genre value.

What is not evidenced by the checked pages: a stable public record-level
display of dimensions, page count, binding, or reproduction method. Barnard's
collection and access documentation therefore supports separating catalogue
description, physical holding, online link, and circulation/access; it does not
justify assuming that all conventional library physical fields are populated.

### ZineCat / Zine Union Catalog, including QZAP and ABC No Rio

Sources:

- [ZineCat advanced object search](https://zinecat.org/index.php/Search/advanced/objects)
- [ZineCat live catalogue](https://zinecat.org/)
- [ZineCat project history](https://www.zinelibraries.info/zine-union-catalog/)
- [QZAP official site](https://qzap.org/)
- [ABC No Rio Zine Library catalogue](https://zinecat.abcnorio.org/)

What the catalogue interface actually exposes:

- Search fields include title, accession number, keyword, type, date range, and
  collection.
- The type selector explicitly includes `Physical (printed) Zine` and
  `Academic Item`.
- The official search guide says catalogue metadata is intended to be
  clickable/searchable for creators, years, locations, and `Place Created`, and
  gives Chicago as an example of a place-created value.
- The project describes itself as a union catalogue for shared cataloguing and
  holdings across libraries with different schemas. The page says it is still
  being worked on and some links may not be live.
- The live catalogue identifies partner libraries including QZAP and Barnard.
  QZAP's own public page identifies the Queer Zine Archive Project but does not
  expose a record schema in the checked page. ABC No Rio exposes a catalogue
  entry point using the same CollectiveAccess-based surface.

Implication: ZineCat gives strong evidence for explicit object type, local
accession, collection membership, place-created, and union-catalogue context.
It does not evidence that every partner record has dimensions, pagination,
binding, reproduction method, or a digital asset. QZAP's presence as a partner
does not supply QZAP item metadata.

### International cataloguing practice cross-check

Source: [Zine Libraries cataloguing resource](https://www.zinelibraries.info/running-a-zine-library/zine-cataloging/)

The page links to collection-owned cataloguing procedures and identifies
physical-description concerns such as binding and printing styles as reasons to
use art/architecture vocabulary in addition to ordinary subject headings. It
also links to Barnard, Reed, Los Angeles Public Library, and Michigan State
catalogue examples. This is evidence that specialist collections treat format,
subject, and physical description as distinct cataloguing problems; it is not a
claim that those linked catalogues use one shared schema.

## Field comparison

| Requested field | Brazilian evidence | International evidence | Safe conclusion |
| --- | --- | --- | --- |
| Physical/digital format | Biblioteca is visibly digital; Fanzinoteca records physical objects; Fanzinoteca has no universal digital/physical toggle visible in the checked record | ZineCat has `Physical (printed) Zine`; Barnard separates physical stacks from online links | Use delivery form and physical form separately; do not equate a scan/PDF with a physical original |
| Extent/page count | Not found in checked Brazilian records | Not found on checked Barnard/ZineCat public surfaces | Optional, source-qualified, and separate for physical publication vs digital asset |
| Dimensions | Fanzinoteca explicitly records width and height in cm | Not found on checked Barnard/ZineCat surfaces | Strong case for an optional measured/supplied dimensions field |
| Binding/assembly | Fanzinoteca records a broad binding category on one record | Specialist cataloguing guidance calls out binding; Barnard/ZineCat pages do not expose it as a stable public field | Optional, repeatable physical observation; preserve unknown/other |
| Reproduction method | Fanzinoteca records black-and-white photocopy | No checked Barnard/ZineCat record field exposed | Optional and evidence-based; never infer from a PDF or cover image |
| Place/country/state | Fanzinoteca has a Brazil tag; Biblioteca says its scope is Brazil/Latin America; no UF found | ZineCat explicitly names Place Created and locations; Barnard documents repository location/access, not zine origin | Model place with a role; country/UF are not interchangeable with archive location or author location |
| Genre/subject | Biblioteca categories; Fanzinoteca separates category from content and tags | Barnard subject headings/contents; ZineCat keyword and collection search | Keep subject, genre/form, and descriptive text distinct; review controlled terms |

## What not to infer

- Do not infer a physical edition, page count, dimensions, or binding from a
  PDF, cover thumbnail, filename, or image aspect ratio.
- Do not infer reproduction method from visual appearance. Record photocopy,
  risograph, offset, handwriting, or another method only when the creator,
  catalogue, or documented physical observation supports it.
- Do not treat a digital catalogue record as evidence that a physical copy
  exists, or a physical holding as evidence that a scan is available.
- Do not treat PDF page count as physical pagination. A scan may include covers,
  blank pages, inserts, or a different pagination convention.
- Do not turn a country tag, archive location, creator address, or collection
  scope into place created or place published.
- Do not infer Brazilian `state_uf` from a city name unless the place source
  supports the normalization. Preserve unknown or ambiguous geography.
- Do not turn a subject heading, keyword, or collection name into a genre, and
  do not turn a genre/form term into a subject claim.
- Do not infer rights to mirror, download, preserve, or republish from a public
  catalogue link. Barnard's official access page explicitly separates research
  reproduction from public publication permission.
- Do not infer completeness from a collection count or catalogue search facet;
  Barnard and ZineCat both document unprocessed or incomplete catalogue work.

## Provisional profile recommendation

| Field | Recommendation | Provisional rule |
| --- | --- | --- |
| `page_count` | **Include, optional** | Store the extent target (`physical`, `digital-pdf`, or another asset), counting convention, source, and uncertainty. Do not make it required for digital-only or non-paginated forms. |
| `dimensions` | **Include, optional** | Store width, height, unit, and measurement state such as folded/closed or open; distinguish supplied from measured values. |
| `binding_features` | **Include, optional** | Repeatable physical observations such as stapled, folded, loose sheets, sewn, or other; retain `unknown` rather than guessing. |
| `reproduction_method` | **Include, optional** | Record only an explicit creator statement, catalogue value, or documented observation; allow `unknown` and multiple methods where appropriate. |
| `place/state_uf` | **Include, optional and role-qualified** | Keep place, country, municipality, and Brazilian `state_uf` together with role (`created-in`, `published-in`, `circulated-in`, or `agent-location`), source, precision, and visibility. `state_uf` applies only to supported Brazilian place values. |

These belong in the provisional profile because specialist records demonstrate
that physical description, production, place, and content classification are
useful but unevenly available. They should not become required intake fields or
be silently backfilled from digital assets. The profile should also keep
publication metadata separate from asset metadata: a physical extent describes
the publication or holding, while PDF page count and file dimensions describe a
digital asset unless evidence establishes a relationship.

## Conclusions for Biblioteca

1. Biblioteca's current public catalogue is a valid digital-discovery baseline,
   but it currently evidences little physical description.
2. La Fanzinoteca provides the clearest Brazilian-compatible precedent for
   dimensions, graphic production, binding category, country discovery, and
   separate content/category fields.
3. Barnard demonstrates the operational distinction between catalogue record,
   physical holding, special-collection status, online link, and reuse rights.
4. ZineCat demonstrates the value of explicit object type, accession/collection
   context, creator, location, and place-created discovery without proving that
   every record has complete physical or digital metadata.
5. The provisional profile should accept these fields as optional,
   source-qualified claims. It should prioritize completeness and provenance
   over forcing every zine into a standard book description.

## Source limitations

The checked public interfaces did not expose stable record-level examples for
all requested fields. In particular, Barnard's Columbia catalogue records were
not directly inspectable in this research pass because the catalogue presented
an anti-bot challenge, and QZAP's public landing page did not expose its record
schema. Those are limits on observed evidence, not claims that the collections
do not maintain such metadata internally.
