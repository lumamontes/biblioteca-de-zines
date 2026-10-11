# 02: Standalone Reader Contract And Demo Shell

**What to build:** A standalone project shell with a framework-independent reader contract and a fixture-driven demo application. The shell must accept a publication representation, reader configuration, metadata, and an explicit standard-viewer fallback without exposing renderer-specific APIs.

**Blocked by:** 01: Feasibility Lab: External PDF And Page-Turn Rendering.

**Status:** ready-for-agent

- [ ] Create the standalone project structure selected by the feasibility findings.
- [ ] Define the public reader boundary independently of React or a renderer dependency.
- [ ] Represent external PDF URLs and ordered page-image URLs without treating either as the publication itself.
- [ ] Support explicit provider and reader-mode configuration.
- [ ] Expose loading, ready, failure, and fallback states through the public contract.
- [ ] Provide a demo application with representative fixtures and a standard-viewer action.
- [ ] Keep the contract adaptable to future source representations without implementing IIIF or sharing in this ticket.
