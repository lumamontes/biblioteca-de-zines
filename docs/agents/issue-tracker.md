# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Repository

- GitHub repository: `lumamontes/biblioteca-de-zines`

## Conventions

- Create an issue: `gh issue create --title "..." --body "..."`
- Read an issue: `gh issue view <number> --comments`
- List issues: `gh issue list --state open`
- Comment on an issue: `gh issue comment <number> --body "..."`
- Apply or remove labels: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- Close an issue: `gh issue close <number> --comment "..."`

## Viveiro confidentiality boundary

Public GitHub issues may track approved Biblioteca implementation work.

Keep private outside GitHub issues:

- Contributor information and contact details
- Consent and authorisation records
- Unannounced Viveiro strategy
- Private research notes
- Unreviewed access, removal, or preservation decisions

Mention Viveiro in a public issue only when that relationship has been approved for disclosure. Describe the concrete Biblioteca outcome rather than exposing private strategy.

## Pull requests as a triage surface

PRs as a request surface: no.
