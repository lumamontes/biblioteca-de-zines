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
- `src/composition/` contains thin runtime-specific object-graph construction. `src/composition/server/` may create request-scoped clients and select concrete infrastructure adapters; `src/composition/cli/` may assemble worker dependencies. Actions, routes, and scripts call these factories instead of assembling vendor adapters themselves.
- `src/components/` contains UI and form concerns.
- `scripts/` contains explicit CLI entry points that call application services.
- Keep reusable types and interfaces in dedicated `*-types.ts` or `*-contracts.ts` files next to their boundary. Service implementation files should contain orchestration and behavior, not the contracts they expose.

Prefer the smallest boundary that makes a workflow readable. Do not introduce full DDD ceremony, aggregates, factories, or value objects without a concrete domain need.

Cover migration and diagnostic processing remain cover-only. The publication worker separately runs asynchronous full PDF-to-image page generation, with reusable PDF rendering primitives kept independent from both workflows.

### Reader implementation guardrails

The public reader is a Biblioteca application feature, not a reusable reader package. Internet Archive BookReader is an infrastructure adapter behind a Biblioteca-owned, provider-neutral reader seam.

- Keep domain and application code free of BookReader, Internet Archive, jQuery, DOM, React, PDF.js, R2, Supabase, and Next.js dependencies.
- Keep publication concepts, access policy, page derivatives, and active generations independent of the rendering adapter.
- Use `zine_pages` as the publication page relation; do not introduce a parallel page table or manifest persistence model.
- The reader consumes only a complete active page generation. It must not select generations, process PDFs, or decide publication access.
- PDF-to-page processing is asynchronous and publication-triggered; never render a PDF during a reader request.
- Keep the original PDF as an explicit fallback/download representation.
- Put BookReader lifecycle, vendor assets, DOM integration, and event translation in its adapter.
- Let composition select the concrete adapter; routes and UI must not instantiate BookReader directly.
- Test application behavior with fake reader/page adapters. Vendor/browser tests belong at the adapter seam.
- Every implementation ticket must identify its architectural layer, dependencies, and replacement seam.
- Do not add generic abstractions or vendor-shaped concepts without a concrete responsibility and a testable interface.
