# Reading Derivative Inventory Spike

This spike inspects the local PDF archive only. It does not render page images, upload files, or change archive contents.

## Scope

- Generated: 2026-10-12T11:54:11.650Z
- Archive: /Users/luma/www/biblioteca-zines/archive
- PDFs inspected: 310
- Public PDFs: 309
- Unpublished PDFs: 1
- Invalid PDFs: 0
- Source bytes: 3627.8 MB
- Total pages: 3,242
- Page orientation: 2,673 portrait, 569 landscape, 0 square

## Page-count distribution

- Minimum: 1 pages
- Median: 8 pages
- Average: 10.5 pages
- P90: 20 pages
- Maximum: 122 pages

## Source-size distribution

- Minimum: 64 KB
- Median: 4.4 MB
- P90: 32.9 MB
- Maximum: 81.7 MB

## Storage sensitivity

These are planning estimates, not measured derivative sizes. Actual output depends on renderer scale, format, quality, and page content.

| Assumed average derivative size | All valid PDFs | Public PDFs |
| ---: | ---: | ---: |
| 250 KB / page | 810.5 MB | 808.5 MB |
| 500 KB / page | 1621.0 MB | 1617.0 MB |
| 1.0 MB / page | 3242.0 MB | 3234.0 MB |

## Recommended rendering benchmark sample

| Reason | File | Pages | Source size |
| --- | --- | ---: | ---: |
| shortest | `roma-quando-nos-tornaremos-fotos.pdf` | 1 | 8.0 MB |
| median-pages | `pedro-daquer-o-que-sao-zines.pdf` | 8 | 58.9 MB |
| p90-pages | `nihilo-malassombro.pdf` | 20 | 51.1 MB |
| longest | `lais-melo-osasunafever.pdf` | 122 | 15.6 MB |
| largest-source | `papermelon-ser-um-ser-devagar.pdf` | 9 | 81.7 MB |
| landscape | `daniella-deisy-lesbozine.pdf` | 27 | 29.8 MB |

## Interpretation

- The source archive size is not the same as reader delivery size; page derivatives trade storage for lower client CPU and smaller incremental page requests.
- Browser-only PDF rendering can reuse cached PDF bytes after a normal reload, but PDF.js parsing and canvas rendering start again because they are in-memory client state.
- A CDN can share immutable page-image responses across clients. Browser memory caches and service-worker caches cannot share decoded pages between clients.
- Unpublished PDFs are reported separately and must not enter public derivative processing automatically.
- This inventory does not decide derivative quality. A representative rendering benchmark is still required before choosing WebP/PNG, scale, and compression.

## Recommendation

Use this inventory to select a representative benchmark sample before processing the archive. Keep the existing PDF as the reading/download fallback. If the benchmark confirms that page images materially improve mobile startup and navigation, generate immutable page derivatives only for approved public publications and deliver them through shared cacheable URLs.

## Invalid files

- None.
