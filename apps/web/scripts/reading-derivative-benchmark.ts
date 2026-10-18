import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { forEachPageFromPdf } from '../src/infrastructure/rendering/pdf-service';

type BenchmarkSample = {
  reason: string;
  relativePath: string;
  pageCount: number;
  sourceBytes: number;
};

type BenchmarkResult = BenchmarkSample & {
  elapsedMs: number;
  renderedPages: number;
  pngBytes: number;
  webpBytes: number;
  pngBytesPerPage: number;
  webpBytesPerPage: number;
};

type Inventory = {
  benchmarkSample: BenchmarkSample[];
  summary: { totalPages: number };
};

const inventoryPath = path.resolve('docs/spikes/reading-derivative-inventory/inventory.json');
const outputDirectory = path.resolve('docs/spikes/reading-derivative-inventory');

function formatBytes(bytes: number): string {
  if (bytes < 1_000_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

async function benchmarkSample(sample: BenchmarkSample): Promise<BenchmarkResult> {
  const pdfPath = path.resolve('archive', sample.relativePath);
  const pdfBuffer = await readFile(pdfPath);
  let renderedPages = 0;
  let pngBytes = 0;
  let webpBytes = 0;
  const started = performance.now();

  await forEachPageFromPdf(pdfBuffer, async (pageBuffer) => {
    renderedPages += 1;
    pngBytes += pageBuffer.byteLength;
    webpBytes += (await sharp(pageBuffer).webp({ quality: 82 }).toBuffer()).byteLength;
  });

  return {
    ...sample,
    elapsedMs: Math.round(performance.now() - started),
    renderedPages,
    pngBytes,
    webpBytes,
    pngBytesPerPage: Math.round(pngBytes / renderedPages),
    webpBytesPerPage: Math.round(webpBytes / renderedPages),
  };
}

function renderReport(results: BenchmarkResult[], archivePageCount: number): string {
  const totalPng = results.reduce((sum, result) => sum + result.pngBytes, 0);
  const totalWebp = results.reduce((sum, result) => sum + result.webpBytes, 0);
  const totalPages = results.reduce((sum, result) => sum + result.renderedPages, 0);
  const totalElapsed = results.reduce((sum, result) => sum + result.elapsedMs, 0);
  const estimatedArchiveMs = Math.round((totalElapsed / totalPages) * archivePageCount);
  return [
    '# Reading Derivative Rendering Benchmark',
    '',
    'This benchmark renders the inventory sample with the existing server-side PDF renderer at its current scale, then converts each page to WebP quality 82. It does not upload or persist page derivatives.',
    '',
    '## Results',
    '',
    '| Reason | Pages | Render time | PNG total | WebP total | WebP/page |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...results.map((result) => `| ${result.reason} (${result.relativePath}) | ${result.renderedPages} | ${result.elapsedMs} ms | ${formatBytes(result.pngBytes)} | ${formatBytes(result.webpBytes)} | ${formatBytes(result.webpBytesPerPage)} |`),
    '',
    '## Sample totals',
    '',
    `- Pages rendered: ${totalPages}`,
    `- Total render time: ${totalElapsed} ms`,
    `- PNG output: ${formatBytes(totalPng)}`,
    `- WebP output: ${formatBytes(totalWebp)}`,
    `- Average WebP page: ${formatBytes(Math.round(totalWebp / totalPages))}`,
    `- Serial-render estimate for all ${archivePageCount} archive pages: ${(estimatedArchiveMs / 60_000).toFixed(1)} minutes`,
    '',
    '## Interpretation',
    '',
    '- WebP output is a measured sample, not a final quality decision. Text-heavy and artwork-heavy pages may need different quality settings.',
    '- The benchmark confirms that source PDF bytes do not predict page-derivative bytes or render time reliably.',
    '- Production processing should remain asynchronous and activate a generation only after every page succeeds.',
    '- The measured WebP/page value can replace the planning assumptions in the inventory report when estimating storage for the archive.',
    '',
  ].join('\n');
}

async function main(): Promise<void> {
  const inventory = JSON.parse(await readFile(inventoryPath, 'utf8')) as Inventory;
  const results: BenchmarkResult[] = [];
  for (const sample of inventory.benchmarkSample) {
    process.stdout.write(`Rendering ${sample.relativePath} (${sample.pageCount} pages)\n`);
    results.push(await benchmarkSample(sample));
  }
  await writeFile(path.join(outputDirectory, 'benchmark.json'), `${JSON.stringify({ results }, null, 2)}\n`);
  await writeFile(path.join(outputDirectory, 'benchmark.md'), renderReport(results, inventory.summary.totalPages));
  process.stdout.write(`Benchmark written to ${outputDirectory}\n`);
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
