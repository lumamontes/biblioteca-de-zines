# 01: Feasibility Lab: External PDF And Page-Turn Rendering

**What to build:** A focused runnable spike that compares direct external-PDF rendering, ordered page-image rendering, and existing page-turn mechanisms against representative visual publication fixtures. The spike must determine whether the desired reading experience is technically viable without persistent PDF-to-image conversion and document the dependency, browser, performance, and licensing findings.

**Blocked by:** None (can start immediately).

**Status:** completed

- [x] Test direct external PDF loading with PDF.js core APIs, without using the generic PDF.js viewer UI.
- [x] Test progressive visible-page rendering, adjacent-page preparation, worker usage, and page cleanup.
- [x] Test a page-turn library such as StPageFlip with PDF-rendered page surfaces.
- [x] Test an ordered image representation through the same page-turn mechanism.
- [x] Test desktop page-turn navigation, emulated mobile layout, covers, interior spreads, and slide navigation. Real-device touch validation remains a follow-up for ticket 06.
- [x] Test compatible and incompatible source conditions, including CORS and range-request differences.
- [x] Measure first-page readiness, adjacent-page readiness, memory behavior, retained pages, and animation smoothness where the environment exposed the measurement. Production budgets remain a ticket 06 concern.
- [x] Audit candidate dependency licenses and browser/runtime constraints.
- [x] Record the recommended architecture and explicitly identify which downstream tickets must be changed, merged, split, or cancelled.

Findings: see `findings.md`. Downstream tickets are provisional until the larger-PDF and real-device validation in ticket 06 is complete.
