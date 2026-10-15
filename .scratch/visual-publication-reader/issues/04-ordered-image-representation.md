# 04: Ordered Image Representation

**What to build:** A visitor can read an ordered set of external page images through the same reader contract used by the PDF path, with progressive loading, responsive layout, and consistent failure behavior.

**Blocked by:** 02: Standalone Reader Contract And Demo Shell.

**Status:** ready-for-agent

- [ ] Accept ordered page-image URLs as a representation.
- [ ] Preserve the supplied page order.
- [ ] Load visible and adjacent images progressively.
- [ ] Avoid retaining unnecessary high-resolution pages.
- [ ] Provide slide navigation using the shared reader shell.
- [ ] Apply the same cover, spread, loading, error, and fallback rules where applicable.
- [ ] Make clear that page images are a reading representation and not automatically the publication original.
