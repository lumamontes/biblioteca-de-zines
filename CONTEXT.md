# Biblioteca de Zines

The Biblioteca is a collaborative digital collection of zines and independent publications. This glossary defines the domain language used when caring for its catalogue and archive.

## Catalogue and archive

**Zine**:
A digital publication represented in the Biblioteca catalogue.
_Avoid_: Item, resource

**Catalogue record**:
The structured Biblioteca record that describes a zine, its publication state, authorship, links, and related metadata.
_Avoid_: File, archive item

**Metadata field**:
A named value describing a publication, agent, submission, asset, access decision, or provenance claim, with its source and visibility understood.
_Avoid_: A value copied between forms without meaning

**Agent**:
A person, collective, or organization associated with a publication or archive context; an agent may have multiple contextual roles.
_Avoid_: Assuming every role is a separate person

**Agent kind**:
A broad classification of an agent, such as person, collective, organization, anonymous, or unknown; it does not assert a legal identity.
_Avoid_: Treating a kind as proof of authorship

**Authorship status**:
The state of what is known about authorship, such as identified, pseudonymous, anonymous, unknown, or unresolved.
_Avoid_: Collapsing unknown and anonymous

**Language-tagged value**:
A title, description, or context value paired with the language in which it is expressed and its source.
_Avoid_: Inferring language from text alone

**Role assertion**:
A contextual statement about why an agent is associated with a publication or submission, such as creator, publisher, or submitter.
_Avoid_: Treating a role as a permanent identity category

**File/access evidence**:
Facts about a file reference, local observation, derivative, or access condition that are kept distinct from the publication record.
_Avoid_: Treating a URL as proof of custody or authorization

**Archive**:
The collection of files and evidence retained for the continuity of the Biblioteca's catalogue and publications.
_Avoid_: Backup, storage bucket

**Local archive file**:
A file observed in a local archive directory and tracked as evidence without assuming that it is an authorised original or a catalogue record.
_Avoid_: Zine, original

**Source**:
The external location or submission from which a file or catalogue value was obtained.
_Avoid_: Archive copy

**Original**:
The source file retained as the authoritative publication bytes for a specific preservation purpose, only when that status is established by evidence.
_Avoid_: Any downloaded PDF

**Reading copy**:
A file prepared for reader access and distinct from the retained source file when the two have different preservation or delivery purposes.
_Avoid_: Original, preview

**Preview**:
A derivative representation used to show or navigate a publication without being the publication's retained source bytes.
_Avoid_: Reading copy, original

**Derivative**:
A file or representation produced from another publication file, such as a page image, preview, or reading copy.
_Avoid_: Duplicate

## Evidence and diagnosis

**Inventory**:
A repeatable snapshot of observed catalogue records, local files, relationships, validation results, and provenance.
_Avoid_: Preservation proof, backup

**Baseline**:
A reviewed description of the Biblioteca's current submission, review, catalogue, publication, storage, reading, and maintenance state, including evidence, unknowns, and risks.
_Avoid_: Plan, complete audit

**Divergence**:
A difference between catalogue evidence, source references, local files, or derivatives that requires explanation and is not automatically an error.
_Avoid_: Failure

**Known failure**:
A previously observed unavailable or invalid source condition retained as historical evidence and not silently rechecked or reclassified as a current result.
_Avoid_: Missing file

**Ambiguous match**:
A possible relationship between a catalogue record and a local file that lacks enough evidence to be treated as confirmed.
_Avoid_: Best guess

## Catalogue profile

**Publication**:
A catalogue publication concept that may have one or more editions and can be discovered when access permits.
_Avoid_: Item, resource

**Edition**:
A possible qualifier for a publication when a later issue, release, or revision needs to be distinguished. It is not a current entity or required field; a new case is currently represented as a new publication entry. A year alone is a date, not an edition.
_Avoid_: Treating the qualifier as a required edition entity

**Collection/series**:
A group of related publications presented as belonging together.
_Avoid_: A title copied into each record without a relationship

**Submission**:
An intake record and context provided to the Biblioteca for review.
_Avoid_: Publication, original

**Archive steward**:
A person or collective responsible for operating, reviewing, describing, or caring for the Biblioteca collection. This is operational context and may overlap with publication roles; it is not automatically a creator credit.
_Avoid_: Assuming archive stewardship and publication roles are separate people

**File asset/version**:
A specific source or delivery file with its own bytes, reference, checksum, or version history.
_Avoid_: Any URL, duplicate

**Processing event**:
Optional evidence of an action such as review, publication, import, validation, correction, or removal; current status snapshots are sufficient unless a concrete accountability or workflow need requires history.
_Avoid_: Event sourcing by default

**Access policy**:
Separate decisions about discovery, reading, downloading, preservation, replication, and reuse.
_Avoid_: Published means permitted for everything
