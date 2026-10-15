# 05: Page-Turn Reading Mode

**What to build:** PDF-backed and image-backed publications can use the validated page-turn renderer, with physical-feeling pointer and touch interaction, real-zine cover behavior, interior spreads, and an explicit switch to slide mode.

**Blocked by:** 02: Standalone Reader Contract And Demo Shell; 03: Direct PDF Reading With Slide Mode; 04: Ordered Image Representation.

**Status:** ready-for-agent

- [ ] Integrate the page-turn mechanism selected by the feasibility findings behind the renderer contract.
- [ ] Support pointer dragging on desktop.
- [ ] Support touch gestures on mobile.
- [ ] Show the front cover as a single page.
- [ ] Show interior pages as spreads when the viewport permits.
- [ ] Show the back cover as a single page.
- [ ] Handle narrow viewports with single-page presentation.
- [ ] Support switching between page-turn and slide modes.
- [ ] Keep the renderer replaceable and avoid exposing its dependency-specific API.
