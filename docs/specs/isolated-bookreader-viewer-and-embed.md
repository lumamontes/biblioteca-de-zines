# Isolated BookReader Viewer and Embed

## Problem Statement

Biblioteca de Zines needs to use Internet Archive BookReader as the robust,
battle-tested renderer for publications with complete page generations.
BookReader is a legacy jQuery-based runtime with vendor CSS, global browser
behavior, and a significant dependency surface. Loading it inside the main
Biblioteca document or initial application bundle could affect application
performance, styles, event handling, maintenance, and deployment safety.

The feature also needs to support a future community use case: allowing a public
zine to be embedded in another website in the same way that a video platform
provides an embed player. The embed must remain a Biblioteca-controlled reader
surface without exposing the main application UI or requiring a second catalogue.

The rollout must begin as a stealth beta for selected testers and publications.
Public zines are embeddable by default as a Biblioteca reuse policy, but the
capability must not be exposed to everyone until the viewer, derivative
delivery, performance, and abuse controls have been validated.

## Solution

Create a separately deployed but same-repository Biblioteca viewer application
hosted at `viewer.biblioteca-de-zines.com.br`.

The viewer runs BookReader inside an iframe boundary. It owns the BookReader
runtime, jQuery, jQuery UI, vendor CSS, and BookReader-specific lifecycle. The
main Biblioteca application owns publication access, active page-generation
selection, fallback behavior, beta rollout, and the public reader data endpoint.

Provide a versioned embed route using the canonical Biblioteca publication slug:

`https://viewer.biblioteca-de-zines.com.br/embed/v1/:slug`

The viewer fetches an access-filtered reader manifest from Biblioteca, renders
the complete active page generation with BookReader, and falls back to the
retained PDF when page derivatives or the renderer are unavailable. The initial
embed is self-contained and does not expose a parent-page control or event
protocol.

## User Stories

1. As a reader, I want to open a published public zine in the Biblioteca reader,
   so that I can read its generated pages without waiting for PDF parsing in my
   browser.
2. As a reader, I want BookReader navigation, zoom, thumbnails, and responsive
   behavior, so that I can use a proven publication-reading experience on
   desktop and mobile.
3. As a reader, I want the original PDF fallback to remain available, so that I
   can continue reading when page derivatives or BookReader fail.
4. As a reader, I want a clear failure message when the page reader is
   unavailable, so that I understand what happened and can choose the PDF
   representation.
5. As a mobile reader, I want the viewer to load only the reader resources it
   needs, so that Biblioteca’s main application remains responsive.
6. As a Biblioteca maintainer, I want BookReader isolated from the main
   document, so that its jQuery globals, CSS, and browser listeners cannot
   interfere with Biblioteca.
7. As a Biblioteca maintainer, I want BookReader absent from the main
   application’s initial bundle, so that users who do not open a reader do not
   pay its download or parse cost.
8. As a Biblioteca maintainer, I want the viewer to receive only an
   access-filtered complete page manifest, so that it cannot select generations
   or bypass publication access policy.
9. As a Biblioteca maintainer, I want the active generation to remain immutable
   while a reader is open, so that a session cannot mix pages from different
   processing generations.
10. As a Biblioteca maintainer, I want a failed page generation to preserve the
    last successful generation and PDF fallback, so that processing failures do
    not remove access to a publication.
11. As a zine publisher, I want my public zine to be embeddable by default, so
    that community websites can share the publication’s reader without
    duplicating the file.
12. As a community website maintainer, I want to embed a zine with a normal
    iframe, so that I can add the reader without installing Biblioteca or
    BookReader dependencies.
13. As a community website maintainer, I want the embed URL to use the same
    canonical publication slug as Biblioteca, so that links remain
    understandable and consistent.
14. As a community website maintainer, I want the embed to be unbranded by
    default, so that it fits naturally into the surrounding website.
15. As a community website maintainer, I want to opt into Biblioteca branding
    through an explicit iframe parameter, so that attribution is available when
    desired without forcing it on every embed.
16. As a community website maintainer, I want to choose the iframe dimensions,
    so that the embed fits the layout of my website without requiring automatic
    parent-page resizing.
17. As an embed viewer, I want the reader to show only reading controls and not
    Biblioteca navigation, comments, or unrelated application UI, so that the
    embed remains focused.
18. As an embed viewer, I want the PDF fallback to remain available, so that an
    embed remains useful when page generation is incomplete.
19. As a Biblioteca maintainer, I want embed URLs to resolve old publication
    slugs, so that a slug change does not break community websites.
20. As a Biblioteca maintainer, I want the publication ID to remain the internal
    identity behind a slug, so that URL naming changes do not duplicate catalogue
    records.
21. As a Biblioteca maintainer, I want the embed capability hidden from normal
    Biblioteca interfaces during beta, so that selected testers can validate it
    before general exposure.
22. As a Biblioteca maintainer, I want beta eligibility controlled server-side,
    so that an undisclosed URL does not accidentally make the feature public.
23. As a Biblioteca maintainer, I want to enable the viewer for selected
    publications and testers independently, so that rollout can be controlled
    without changing publication records.
24. As a Biblioteca maintainer, I want an embed-specific kill switch, so that
    embeds can be disabled without disabling the normal Biblioteca reader or PDF
    fallback.
25. As a Biblioteca maintainer, I want viewer failures, page failures, fallback
    usage, and bandwidth measured separately, so that the beta can be evaluated
    without obscuring core application health.
26. As a Biblioteca maintainer, I want rate limiting and caching at the viewer
    and derivative boundaries, so that public embedding cannot easily exhaust
    application or storage resources.
27. As a Biblioteca maintainer, I want the viewer deployment to be independently
    replaceable, so that BookReader can later be upgraded or replaced without
    changing the publication domain or reader session.
28. As a Biblioteca maintainer, I want the viewer source to remain in the same
    repository initially, so that shared contracts and coordinated changes
    remain simple while runtime isolation is preserved.
29. As a Biblioteca maintainer, I want the viewer to avoid receiving Supabase
    sessions or application secrets, so that public reading does not expand the
    credential boundary.
30. As a Biblioteca maintainer, I want the BookReader license and
    source-distribution obligations reviewed before public production
    distribution, so that the selected renderer is operated responsibly.

## Implementation Decisions

- The reader remains a Biblioteca application feature, not a reusable
  general-purpose reader package.
- The repository gains a separately deployable viewer application or entrypoint
  while remaining a single source repository initially.
- The viewer is hosted on a dedicated origin,
  `viewer.biblioteca-de-zines.com.br`, and embedded by the main application or
  third-party websites through an iframe.
- The iframe is the primary isolation boundary for BookReader’s jQuery runtime,
  vendor CSS, global listeners, and browser lifecycle.
- The main Biblioteca application owns publication metadata, access policy,
  active complete page-generation selection, reader session state, PDF fallback,
  beta rollout, and kill switches.
- The viewer owns only viewer composition, BookReader initialization, BookReader
  navigation, vendor asset loading, and translation of BookReader failures into
  viewer failure states.
- The viewer must not query Supabase directly, select a page generation, process
  a PDF, or decide whether a publication may be read.
- The viewer fetches reader data from a narrowly scoped public Biblioteca
  endpoint. The endpoint returns only the publication information and
  access-filtered complete active manifest needed by the reader, plus explicit
  PDF fallback information.
- The core application remains authoritative for the endpoint and
  active-generation selection. Cross-origin access is restricted to the viewer
  origin.
- The viewer uses the canonical Biblioteca publication slug. Slugs resolve to
  the internal publication identity, and historical slugs remain usable as
  aliases.
- The versioned embed route is `/embed/v1/:slug`. The route is designed for
  future compatibility even if the unversioned route is later provided as an
  alias.
- The default embed is unbranded. An explicit presentation parameter may opt
  into Biblioteca branding; presentation parameters do not grant access.
- V1 has no parent-page control or event protocol. The viewer is self-contained
  and the embedding page controls iframe dimensions.
- V1 supports a minimal initial-page parameter only if it can be implemented
  without introducing a parent synchronization protocol.
- Public zines are embeddable by default as a distinct embedding-access/reuse
  policy. This default does not change reading, downloading, preservation, or
  other access dimensions.
- The embed capability remains hidden from normal Biblioteca interfaces during
  beta. Server-side allowlists control eligible testers and/or selected
  publications.
- Viewer availability, normal reader availability, and individual publication
  eligibility are independently controllable.
- Existing explicit PDF fallback behavior remains mandatory when no complete
  page generation exists, when page delivery fails, when BookReader fails, or
  when a reader chooses the original representation.
- The provider-neutral `ReaderRenderer` and `ReaderSession` seams remain the
  highest application seam. The main application uses a fake renderer in
  application tests; BookReader-specific types do not cross into domain or
  application code.
- The viewer adapter translates the ordered page manifest into BookReader data
  and translates BookReader page changes, navigation, initialization failures,
  and cleanup at the viewer boundary.
- Page derivatives remain immutable, generation-versioned, and eligible for
  long-lived shared caching after a generation becomes active.
- Initial abuse protection consists of separate viewer/API metrics, caching,
  request rate limiting, failure monitoring, and embed-host monitoring. A more
  complex quota system is out of scope until beta traffic provides evidence.
- The viewer must not expose application secrets or forward Supabase sessions.
  Public reader access uses the existing public access boundary and may later
  use short-lived signed derivative URLs if abuse or rights requirements
  justify them.
- Internet Archive BookReader’s AGPL-3.0 licensing and source-distribution
  obligations require legal review before public production distribution.

## Testing Decisions

- Tests verify externally observable reader behavior and protocol outcomes, not
  BookReader’s internal implementation.
- The highest application seam is the existing `ReaderSession`/`ReaderRenderer`
  boundary. Application tests use a fake renderer to verify fallback,
  page-change propagation, rerender, destroy, and reader-failure behavior.
- Viewer adapter tests use a fake BookReader factory to verify manifest
  translation, initialization, navigation delegation, page-change translation,
  failure reporting, resize handling, and cleanup.
- Viewer browser tests verify that the isolated viewer loads in a browser,
  initializes BookReader with a complete manifest, displays a page, navigates,
  preserves PDF fallback behavior, and does not load BookReader resources in the
  main application’s initial route.
- Cross-origin tests verify allowed viewer requests, rejected or unavailable
  beta access, slug alias resolution, and the absence of credentials in viewer
  requests.
- Rollout tests verify publication eligibility, tester allowlists, independent
  reader/embed kill switches, and fallback when a publication lacks a complete
  active generation.
- Performance tests measure time to first visible page, initial and
  adjacent-page requests, cache behavior, memory use across representative
  publication sizes, viewer bundle size, and derivative bandwidth on desktop
  and mobile.
- Failure tests cover unavailable viewer assets, BookReader initialization
  failure, page image failure, incomplete generations, stale or invalid slugs,
  endpoint failure, and disabled beta access.
- Prior art includes the existing provider-neutral reader contract tests,
  public reader application tests, page-generation tests, publication
  processing tests, and configured Playwright browser tests.

## Out of Scope

- Rewriting or forking Internet Archive BookReader.
- Creating a reusable reader package for unrelated applications.
- Deploying a separate backend service or separate catalogue for the viewer.
- A full repository-wide monorepo migration.
- Parent-page control or event messaging for embeds in V1.
- Automatic iframe resizing based on viewer messages.
- Publisher-facing embed configuration UI during beta.
- Per-publication embed opt-out UI during the initial permissive policy.
- Arbitrary theme, color, toolbar, or custom-CSS parameters.
- Live invalidation of an already-open viewer when publication visibility or
  active generation changes.
- Private/authenticated publication embedding.
- A complex quota, billing, or anti-scraping system before beta usage provides
  evidence.
- Replacing the retained PDF or treating page derivatives as preservation
  originals.
- Processing PDFs during a reader or embed request.

## Further Notes

- This spec refines the existing BookReader reading-path decision by adding a
  separately deployed viewer boundary. The viewer remains a Biblioteca
  application feature and does not become a general-purpose package or a
  Viveiro Digital runtime dependency.
- The rollout should proceed as a stealth beta with selected publications and
  testers before the embed URL is exposed in public Biblioteca interfaces.
- The existing active-generation and PDF fallback work remains a prerequisite.
  A viewer must consume only a complete active generation and must never select
  or construct one.
- The embed URL is a reuse surface. Its default permissive policy is deliberate,
  while the separate embedding-access vocabulary preserves the ability to
  restrict reuse independently from reading later.
- The viewer host should be treated as independently observable and replaceable
  even when it shares the repository and operational ownership with the main
  application.
