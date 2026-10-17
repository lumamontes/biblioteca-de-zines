# Direct Upload and Metadata Intake

Status: deferred version after the viewer release.

This specification describes the next submission workflow. It is not part of
the current viewer release and does not authorize a public form launch by
itself. The community consultation, privacy configuration, contributor
communication, and authorised-original policy must be reviewed before use.

## Goal

Allow a submitter to upload one or more PDF files directly, inspect technical
metadata extracted from those files, correct catalogue values, and submit the
result for human review without requiring a Google Drive link.

Direct upload is intended to replace external PDF links as the normal source
for new submissions. The form should explain the processing required for reader
delivery instead of presenting page generation as a technical preference. Any
different public-access or preservation policy must remain a separate reviewed
decision.

## Intake Flow

```text
temporary private upload
  -> checksum and technical inspection
  -> submitter review and correction
  -> explicit submission
  -> maintainer review
  -> authorised-original retention decision
  -> public publication and page generation, if approved
```

- Temporary uploads are private and have a defined cleanup deadline.
- Each file receives an identity independent of its filename or URL.
- Repeated identical bytes are recognised by checksum; changed bytes remain
  distinguishable.
- Uploading a file does not publish it, create a public derivative immediately,
  or prove that the submitter owns its rights.
- A maintainer must be able to reject, defer, restrict, correct, or remove a
  submission without losing the submitted value or its provenance.

## Automatically Observed Values

The system may extract and display suggestions for:

- filename, MIME type, byte size, and checksum;
- page count, page dimensions, and page ordering;
- PDF title, author, subject, creator, producer, and embedded dates;
- text-layer availability and extraction status;
- first-page preview and generated cover candidate.

These values are technical observations. They are not automatically accepted
as the public title, creator identity, publication date, language, category,
rights statement, or access policy.

## Submitter-Editable Catalogue Values

The form should make it easy to confirm or correct:

- title and optional alternative title;
- creator names and contextual roles;
- collective, pseudonymous, anonymous, or unresolved authorship;
- creator-supplied description or context;
- date statement and date precision;
- collection or series label;
- language when known;
- controlled categories or subjects;
- requested discovery, reading, download, preservation, and reuse treatment.

Each value should retain its source, such as `creator`, `pdf-metadata`,
`system-observed`, or `maintainer-reviewed`.

## Cover and Derivatives

For new direct uploads, the default cover policy may use the first page of the
submitted PDF and remove the need for an external cover URL. This is a policy
change for new submissions and must not silently rewrite existing catalogue
covers.

Approved uploads use the viewer release's page-generation workflow. Original
files, reading copies, previews, covers, and page images remain distinct asset
roles.

## Rights, Privacy, and Removal

- The upload does not transfer copyright to Biblioteca de Zines.
- The submitter must not be treated as the rights-holder without evidence.
- Private contact and rights evidence remain outside public catalogue metadata.
- Public reading, download, preservation, replication, and reuse are separate
  decisions.
- The workflow must provide a clear correction, restriction, and removal path.
- A removal request must not automatically delete preservation or operational
  evidence before the request is reviewed and the applicable policy is known.

## Explicit Non-Goals

- Inferring rights or permission from a reachable file.
- Automatically publishing extracted metadata.
- Requiring a legal name when a public name, pseudonym, collective, anonymous,
  or unknown value is appropriate.
- Running OCR or semantic classification as a condition of submission.
- Treating a checksum as proof of preservation or authorization.
- Launching the workflow before the public consultation and pilot handling are
  reviewed.

## Related Work

- Issue [#66](https://github.com/lumamontes/biblioteca-de-zines/issues/66)
- Issue [#110](https://github.com/lumamontes/biblioteca-de-zines/issues/110)
- Issue [#111](https://github.com/lumamontes/biblioteca-de-zines/issues/111)
- Issue [#112](https://github.com/lumamontes/biblioteca-de-zines/issues/112)
- Issue [#131](https://github.com/lumamontes/biblioteca-de-zines/issues/131)
- [Catalogue information architecture](../catalogue-information-architecture.md)
- [Community consultation draft](../biblioteca-community-consultation-draft.md)
