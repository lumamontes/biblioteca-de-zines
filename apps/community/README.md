# Biblioteca Community Portal

This app lets people who read, create, or submit zines suggest improvements,
vote, and comment from their phone without a GitHub account. GitHub stays the
source of truth for team decisions, stages, and official responses. See the
[specification](../../docs/specs/community-portal.md) and
[ADR 17](../../docs/decisions/17-independent-community-portal.md).

This is **increment 1**: every flow runs end to end against a **simulated
GitHub** and local JSON files. There is no real GitHub integration, database,
or maintainer sign-in yet. The interface says so in a demonstration notice.

## Routes

- `/`: questions the team wants input on, recent suggestions, open and
  recently decided proposals (`?order=support` sorts by support).
- `/proposals/:number-:slug`: permanent proposal address. Any slug resolves by
  number and redirects (308) to the current one.
- `/suggest`: new suggestion.
- `/triage`: local triage and GitHub simulator. Enabled only with
  `COMMUNITY_LOCAL_TRIAGE=1`.

## Local development

```bash
cp env.example .env.local
pnpm dev            # http://localhost:4200
```

The first request seeds `.data/` from `fixtures/` and syncs with the simulated
GitHub. Delete `.data/` to start over. Useful variations:

- `COMMUNITY_GITHUB_FAILURE=lost-confirmation`: the first publication of
  each comment reaches GitHub but its confirmation is lost. The person sees a
  recoverable failure; retrying finds the comment by its marker instead of
  posting again.
- `COMMUNITY_GITHUB_FAILURE=unavailable`: the first attempt fails before
  reaching GitHub.
- `COMMUNITY_SEED=extreme`: adds a proposal with a very long title,
  pseudonym, unbroken URL, and 40 contributions.

To see the catalogue link, set `NEXT_PUBLIC_COMMUNITY_URL=http://localhost:4200`
in `apps/web/.env.local`.

## Layers

- `src/domain`: pure rules (stage derivation, vote resolution, GitHub markup
  conventions, paths, validation).
- `src/application`: use cases (queries, suggestions, votes, contributions with
  an idempotent outbox, triage, GitHub sync) and their contracts.
- `src/infrastructure`: the JSON file repository and the simulated GitHub.
- `src/composition`: builds the use cases; `server/` reads the environment and
  the anonymous voter cookie.
- `src/components`, `src/app`: UI and thin server actions.

## Checks

```bash
pnpm check-types
pnpm test           # domain rules and journeys A and B from the spec
pnpm build
```
