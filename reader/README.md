# Visual Publication Reader

This directory is the standalone production shell for the visual publication reader. The public boundary in `src/contract.ts` accepts publication representations, metadata, explicit provider and mode configuration, and an explicit standard-viewer fallback. It does not import React or expose a renderer dependency.

The `demo/` application uses ordered image fixtures and an intentionally incompatible PDF fixture to demonstrate ready, failure, and fallback states. Source loaders and visual renderers can be replaced behind the boundary in later tickets.

```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```
