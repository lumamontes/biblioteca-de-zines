# 07: Biblioteca de Zines Integration

**What to build:** Biblioteca de Zines embeds the standalone reader using its existing publication metadata and external PDF representation while preserving the standard viewer switch and fallback path.

**Blocked by:** 06: Reader Quality And Device Behavior.

**Status:** ready-for-agent

- [ ] Integrate the standalone reader at the public publication reading boundary.
- [ ] Pass the existing publication title and relevant metadata without coupling the standalone project to Supabase.
- [ ] Pass the existing external PDF URL as the primary representation.
- [ ] Preserve the current standard viewer as an explicit user option and fallback.
- [ ] Verify that reader failure does not prevent access to the publication.
- [ ] Add integration coverage for successful custom reading and standard-viewer fallback.
- [ ] Document the source limitations that apply to externally hosted PDFs.
