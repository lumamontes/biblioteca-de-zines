## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues for `lumamontes/biblioteca-de-zines`; use `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository using root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

### Changelog

Keep distinct architectural decisions and implementation milestones as separate
entries in `CHANGELOG.md`; when a feature moves from `Unreleased` to a dated
section, revise stale status language and preserve the original decision links
and history. Do not replace multiple historical entries with a single summary
unless the user explicitly asks for consolidation. Run `pnpm test:changelog` after
editing the changelog.

### Application boundaries

Use lightweight application-service boundaries for new work:

- `app/**/actions.ts` contains thin server-action adapters: create clients, call an application service, and revalidate paths.
- `src/application/` contains use cases when a workflow spans multiple domain operations.
- `src/domain/` contains business rules and types that do not depend on Next.js, Supabase, R2, or Google Drive.
- `src/infrastructure/` contains persistence, storage, source acquisition, and rendering adapters.
- `src/composition/` contains thin runtime-specific object-graph construction. `src/composition/server/` may create request-scoped clients and select concrete infrastructure adapters; `src/composition/cli/` may assemble worker dependencies. Actions, routes, and scripts call these factories instead of assembling vendor adapters themselves.
- `src/components/` contains UI and form concerns.
- `scripts/` contains explicit CLI entry points that call application services.
- Keep reusable types and interfaces in dedicated `*-types.ts` or `*-contracts.ts` files next to their boundary. Service implementation files should contain orchestration and behavior, not the contracts they expose.

### Component boundaries

- Component files contain component composition and component-local values derived directly from props or state.
- Put labels, lookup maps, style maps, and other reusable configuration in a sibling `*-config.ts` file.
- Put pure formatting, parsing, and render helpers in a sibling `*-content.tsx` or `*-formatting.ts` file.
- Put reusable types and interfaces in dedicated `*-types.ts` or `*-contracts.ts` files.
- Before finishing a UI change, inspect each component diff and move top-level constants, helper functions, and type declarations out of the component file unless they are inseparable from the component's JSX.

### Hard implementation guardrails

- `*-types.ts` and `*-contracts.ts` are type-only files. Put runtime functions, predicates, constants, and side effects in a behavior or configuration module beside them.
- Identify the user-facing route and owning application before editing. Record the allowed paths and any application that must remain unchanged.
- `apps/web` owns catalogue-page behavior: availability state, fallback selection, user-facing messages, and recovery actions for `/zines/[slug]`.
- `apps/viewer` owns reader rendering and delivery mechanics. Do not modify it for an `apps/web` feature unless the issue explicitly requires a viewer change.
- Keep protocol discriminants as typed unions. Do not duplicate nested response-shape checks at call sites; expose a named domain predicate when a business rule depends on them.
- Before committing, inspect `git diff --name-only origin/main...HEAD` and confirm every changed path belongs to the owning application.
- Open every new pull request as a draft with `gh pr create --draft`. Mark it ready only after explicit human approval.

Prefer the smallest boundary that makes a workflow readable. Do not introduce full DDD ceremony, aggregates, factories, or value objects without a concrete domain need.

Current cover processing is a cover-only application workflow. Keep reusable PDF rendering primitives separate from the cover workflow so future full PDF-to-image page generation can be added without making page derivatives part of the current reader.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
