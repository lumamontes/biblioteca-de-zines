## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues for `lumamontes/biblioteca-de-zines`; use `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository using root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

### Application boundaries

Use lightweight application-service boundaries for new work:

- `app/**/actions.ts` contains thin server-action adapters: create clients, call an application service, and revalidate paths.
- `src/application/` contains use cases when a workflow spans multiple domain operations.
- `src/domain/` contains business rules and types that do not depend on Next.js, Supabase, R2, or Google Drive.
- `src/infrastructure/` contains persistence, storage, source acquisition, and rendering adapters.
- `src/components/` contains UI and form concerns.
- `scripts/` contains explicit CLI entry points that call application services.
- Keep reusable types and interfaces in dedicated `*-types.ts` or `*-contracts.ts` files next to their boundary. Service implementation files should contain orchestration and behavior, not the contracts they expose.

Prefer the smallest boundary that makes a workflow readable. Do not introduce full DDD ceremony, aggregates, factories, or value objects without a concrete domain need.

Current cover processing is a cover-only application workflow. Keep reusable PDF rendering primitives separate from the cover workflow so future full PDF-to-image page generation can be added without making page derivatives part of the current reader.
