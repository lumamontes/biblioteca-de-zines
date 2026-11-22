# Biblioteca de Zines: Comunidade

This app is the community section of the Biblioteca de Zines. It shares the
catalogue's header, font, and reading column, and lets people who read, create, or submit zines suggest improvements,
vote, and comment from their phone without a GitHub account. GitHub stays the
source of truth for team decisions, stages, and official responses. See the
[specification](../../docs/specs/community-portal.md) and
[ADR 17](../../docs/decisions/17-independent-community-portal.md).

This is **increment 1**: every flow runs end to end against a **simulated
GitHub** and local JSON files. There is no real GitHub integration, database,
or maintainer sign-in yet. The interface says so in a demonstration notice.

## Routes

All routes live under the base path `/comunidade`.


- `/`: the board of paper notes, with upvotes.
- `/proposals/:number-:slug`: permanent proposal address. Any slug resolves by
  number and redirects (308) to the current one.
- `/suggest`: new idea.
- `/issues/:number`: redirects to the proposal linked to that GitHub issue.
- `/triage`: local triage and GitHub simulator. Enabled only with
  `COMMUNITY_LOCAL_TRIAGE=1`.

## Local development

The community is served by the catalogue at `/comunidade`. Run both:

```bash
cp apps/community/env.example apps/community/.env.local
echo 'COMMUNITY_ORIGIN=http://localhost:4200' >> apps/web/.env.local
pnpm dev:all        # catalogue on :3000, community on :4200
```

Open http://localhost:3000/comunidade. The header and its links work as one
site. The app alone also answers at http://localhost:4200/comunidade.

The first request seeds `.data/` from `fixtures/` and syncs with the simulated
GitHub. Delete `apps/community/.data/` to start over. Useful variations:

- `COMMUNITY_GITHUB_FAILURE=lost-confirmation`: the first publication of each
  comment reaches GitHub but its confirmation is lost. Retrying finds the
  comment by its marker instead of posting again.
- `COMMUNITY_GITHUB_FAILURE=unavailable`: the first attempt fails before
  reaching GitHub.
- `COMMUNITY_SEED=extreme`: adds a proposal with a very long title,
  pseudonym, unbroken URL, and 40 comments.

## Links with the catalogue's novidades

- A shipped proposal links to its novidade when the issue's `portal` block has
  `update: <slug>` (the slug in `apps/web/src/content/updates.ts`). The link is
  `/publicacoes#novidade-<slug>`, which opens the Novidades tab at that update.
- A novidade links back when it has `communityIssue: <number>`. The link is
  `/comunidade/issues/<number>`, which redirects to the proposal linked to that
  issue.

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
