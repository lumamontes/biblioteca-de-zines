# Biblioteca de Zines

The Biblioteca is a collaborative digital collection of zines and independent publications. This glossary defines the domain language used when caring for its catalogue and archive.

## Catalogue and archive

**Zine**:
A digital publication represented in the Biblioteca catalogue.
_Avoid_: Item, resource

**Catalogue record**:
The structured Biblioteca record that describes a zine, its publication state, authorship, links, and related metadata.
_Avoid_: File, archive item

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
A distinct published zine or edition that readers can discover.
_Avoid_: Item, resource

**Edition**:
A particular release or version of a publication, including a date or revision when that distinction is known.
_Avoid_: Duplicate, update

**Collection/series**:
A group of related publications presented as belonging together.
_Avoid_: A title copied into each record without a relationship

**Submission**:
An intake record and context provided to the Biblioteca for review.
_Avoid_: Publication, original

**File asset/version**:
A specific source or delivery file with its own bytes, reference, checksum, or version history.
_Avoid_: Any URL, duplicate

**Processing event**:
An action such as review, publication, import, validation, correction, or removal.
_Avoid_: A current status field treated as history

**Access policy**:
Separate decisions about discovery, reading, downloading, preservation, replication, and reuse.
_Avoid_: Published means permitted for everything
