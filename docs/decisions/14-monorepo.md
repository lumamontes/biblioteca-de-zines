# Proposed Monorepo Structure for a Separate Viewer Runtime

Status: proposed for the next viewer release; not yet part of the production
application.

## Context

Biblioteca de Zines is evaluating the Internet Archive BookReader as a
high-performance publishing renderer. The page-derivative inventory and
processing work established that a reader runtime would bring legacy jQuery
dependencies, vendor CSS, and global browser listeners that should not bloat,
interfere with, or complicate the main Next.js application in `apps/web`.

This decision proposes isolating that runtime in a separately deployable viewer
application in `apps/viewer`. It follows the research and decisions recorded in
ADR 13 and the page-processing work, but does not claim that the viewer is
already available in production.

While the runtime and deployment targets are isolated, both applications live within the same domain context, share data contracts and types, and benefit from coordinated refactoring. We evaluated managing these as separate repositories versus a monorepo and need to establish the repository structure for this transition.

## Decision

For the next viewer release, we will restructure the repository into a monorepo
managed via pnpm workspaces. This decision is not an instruction to treat the
current production application as already migrated.

- The existing Next.js application will remain in `apps/web` and stay fully functional with no breaking behavioral changes in this initial scaffold PR.
- A new placeholder directory, `apps/viewer`, will house the future isolated BookReader runtime.
- Shared packages, such as common types, API manifest contracts, or configuration presets, will live under a `packages/` workspace directory as needed.
- Root scripts and configuration, including `pnpm-workspace.yaml` and the root `package.json`, will coordinate workspace commands without changing the build or execution mechanics of the existing web app.

The proposal is intentionally incremental: the catalogue remains the source of
publication and access decisions, while the viewer consumes an explicit reader
contract instead of importing server-side or Supabase implementation details.

## Consequences

Positive consequences:

- Shared logic, types, and API contracts can be co-located cleanly across the web app and viewer without publishing private packages to an external registry.
- `apps/web` and `apps/viewer` can maintain independent build configurations, dependencies, and deployment pipelines while remaining in a single atomic git history.
- The architecture clearly separates the core catalogue application from the legacy BookReader bundle.

Tradeoffs:

- The repository requires additional root-level configuration and workspace awareness.
- Contributors must respect package boundaries and avoid importing server-side or Supabase dependencies from the viewer package when they belong strictly to the web app.

## Related Research

- [BookReader page-derivative decision](./13-internet-archive-bookreader-page-derivatives.md)
- [Page processing and asset lifecycle](../specs/page-processing-and-asset-lifecycle.md)
- [Reading derivative inventory](../spikes/reading-derivative-inventory/report.md)
