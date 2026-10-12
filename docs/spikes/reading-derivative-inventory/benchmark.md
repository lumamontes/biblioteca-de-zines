# Reading Derivative Rendering Benchmark

This benchmark renders the inventory sample with the existing server-side PDF renderer at its current scale, then converts each page to WebP quality 82. It does not upload or persist page derivatives.

## Results

| Reason | Pages | Render time | PNG total | WebP total | WebP/page |
| --- | ---: | ---: | ---: | ---: | ---: |
| shortest (roma-quando-nos-tornaremos-fotos.pdf) | 1 | 3757 ms | 1.1 MB | 457 KB | 457 KB |
| median-pages (pedro-daquer-o-que-sao-zines.pdf) | 8 | 18568 ms | 5.8 MB | 555 KB | 69 KB |
| p90-pages (nihilo-malassombro.pdf) | 20 | 39224 ms | 10.1 MB | 1.3 MB | 64 KB |
| longest (lais-melo-osasunafever.pdf) | 122 | 54052 ms | 17.0 MB | 10.7 MB | 88 KB |
| largest-source (papermelon-ser-um-ser-devagar.pdf) | 9 | 36466 ms | 8.2 MB | 2.7 MB | 301 KB |
| landscape (daniella-deisy-lesbozine.pdf) | 27 | 6469 ms | 271 KB | 377 KB | 14 KB |

## Sample totals

- Pages rendered: 187
- Total render time: 158536 ms
- PNG output: 42.5 MB
- WebP output: 16.1 MB
- Average WebP page: 86 KB
- Serial-render estimate for all 3242 archive pages: 45.8 minutes

## Interpretation

- WebP output is a measured sample, not a final quality decision. Text-heavy and artwork-heavy pages may need different quality settings.
- The benchmark confirms that source PDF bytes do not predict page-derivative bytes or render time reliably.
- Production processing should remain asynchronous and activate a generation only after every page succeeds.
- The measured WebP/page value can replace the planning assumptions in the inventory report when estimating storage for the archive.
