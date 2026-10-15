# 03: Direct PDF Reading With Slide Mode

**What to build:** A visitor can open a browser-consumable external PDF in the custom reader, progressively view its pages with a clean slide transition, and use the standard viewer when the source cannot be consumed or rendered.

**Blocked by:** 02: Standalone Reader Contract And Demo Shell.

**Status:** ready-for-agent

- [ ] Load external PDFs through the source contract without requiring persistent PDF-to-image conversion.
- [ ] Render the first visible page progressively.
- [ ] Prepare adjacent pages without loading every high-resolution page at once.
- [ ] Provide slide navigation for previous and next pages.
- [ ] Preserve page order and report the current page.
- [ ] Handle loading and page-rendering failures through the reader contract.
- [ ] Provide the configured standard-viewer fallback when the custom path is not viable.
- [ ] Document the required CORS and range-request conditions for direct PDF reading.
