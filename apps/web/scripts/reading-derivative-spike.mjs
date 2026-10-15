#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { scanArchive } from './archive-inventory.mjs';

const DEFAULT_ARCHIVE = 'archive';
const DEFAULT_OUTPUT = 'docs/spikes/reading-derivative-inventory';
const DERIVATIVE_BYTES_PER_PAGE = [250_000, 500_000, 1_000_000];

let pdfjsPromise;

async function inspectPdf(buffer) {
  pdfjsPromise ??= import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfjs = await pdfjsPromise;
  const document = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    verbosity: 0,
    isEvalSupported: false,
  }).promise;

  const pages = [];
  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      pages.push({ width: viewport.width, height: viewport.height });
      page.cleanup?.();
    }
  } finally {
    await document.cleanup?.();
    await document.destroy?.();
  }

  const widths = pages.map((page) => page.width);
  const heights = pages.map((page) => page.height);
  const orientation = pages.reduce((counts, page) => {
    const kind = Math.abs(page.width - page.height) < 1 ? 'square' : page.width > page.height ? 'landscape' : 'portrait';
    counts[kind] += 1;
    return counts;
  }, { portrait: 0, landscape: 0, square: 0 });

  return {
    status: 'valid',
    pageCount: pages.length,
    dimensions: {
      first: pages[0] ?? null,
      minWidth: Math.min(...widths),
      maxWidth: Math.max(...widths),
      minHeight: Math.min(...heights),
      maxHeight: Math.max(...heights),
      orientation,
    },
  };
}

async function classifyPdf({ relativePath, buffer }) {
  if (path.extname(relativePath).toLowerCase() !== '.pdf') {
    return { mimeType: 'application/octet-stream', pdf: { status: 'not-applicable' } };
  }

  try {
    return { mimeType: 'application/pdf', pdf: await inspectPdf(buffer) };
  } catch (error) {
    return {
      mimeType: 'application/pdf',
      pdf: {
        status: 'invalid',
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

function percentile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * fraction));
  return sorted[index];
}

function summarize(files) {
  const pdfs = files.filter((file) => file.pdf?.status === 'valid');
  const publicFiles = pdfs.filter((file) => !file.relativePath.startsWith('unpublished/'));
  const unpublishedFiles = pdfs.filter((file) => file.relativePath.startsWith('unpublished/'));
  const pageCounts = pdfs.map((file) => file.pdf.pageCount);
  const sourceSizes = pdfs.map((file) => file.size);
  const totalPages = pageCounts.reduce((sum, count) => sum + count, 0);
  const totalBytes = pdfs.reduce((sum, file) => sum + file.size, 0);
  const averagePages = pdfs.length === 0 ? 0 : totalPages / pdfs.length;
  const orientation = pdfs.reduce((counts, file) => {
    for (const [kind, count] of Object.entries(file.pdf.dimensions.orientation)) counts[kind] += count;
    return counts;
  }, { portrait: 0, landscape: 0, square: 0 });
  const estimate = DERIVATIVE_BYTES_PER_PAGE.map((bytesPerPage) => ({
    bytesPerPage,
    totalBytes: totalPages * bytesPerPage,
    publicBytes: publicFiles.reduce((sum, file) => sum + file.pdf.pageCount, 0) * bytesPerPage,
  }));

  return {
    fileCount: files.length,
    validPdfCount: pdfs.length,
    invalidPdfCount: files.filter((file) => file.pdf?.status === 'invalid').length,
    publicPdfCount: publicFiles.length,
    unpublishedPdfCount: unpublishedFiles.length,
    totalSourceBytes: totalBytes,
    totalPages,
    sourceSize: {
      min: Math.min(...sourceSizes),
      median: percentile(sourceSizes, 0.5),
      p90: percentile(sourceSizes, 0.9),
      max: Math.max(...sourceSizes),
    },
    orientation,
    pageCount: {
      min: Math.min(...pageCounts),
      max: Math.max(...pageCounts),
      average: averagePages,
      median: percentile(pageCounts, 0.5),
      p90: percentile(pageCounts, 0.9),
    },
    estimates: estimate,
  };
}

function benchmarkSample(files) {
  const candidates = files
    .filter((file) => file.pdf?.status === 'valid' && !file.relativePath.startsWith('unpublished/'))
    .sort((left, right) => left.pdf.pageCount - right.pdf.pageCount || right.size - left.size);
  const byPageCount = (target) => candidates.reduce((closest, file) => (
    Math.abs(file.pdf.pageCount - target) < Math.abs(closest.pdf.pageCount - target) ? file : closest
  ));
  const selected = [
    ['shortest', candidates[0]],
    ['median-pages', byPageCount(percentile(candidates.map((file) => file.pdf.pageCount), 0.5))],
    ['p90-pages', byPageCount(percentile(candidates.map((file) => file.pdf.pageCount), 0.9))],
    ['longest', candidates.at(-1)],
    ['largest-source', [...candidates].sort((left, right) => right.size - left.size)[0]],
    ['landscape', [...candidates].sort((left, right) => right.pdf.dimensions.orientation.landscape - left.pdf.dimensions.orientation.landscape)[0]],
  ];
  const seen = new Set();
  return selected.flatMap(([reason, file]) => {
    if (!file || seen.has(file.relativePath)) return [];
    seen.add(file.relativePath);
    return [{
      reason,
      relativePath: file.relativePath,
      sourceBytes: file.size,
      pageCount: file.pdf.pageCount,
      firstPageDimensions: file.pdf.dimensions.first,
    }];
  });
}

function formatBytes(bytes) {
  if (bytes < 1_000_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

function renderReport({ archiveDirectory, generatedAt, summary, files, sample }) {
  const invalid = files.filter((file) => file.pdf?.status === 'invalid');
  const lines = [
    '# Reading Derivative Inventory Spike',
    '',
    'This spike inspects the local PDF archive only. It does not render page images, upload files, or change archive contents.',
    '',
    '## Scope',
    '',
    `- Generated: ${generatedAt}`,
    `- Archive: ${archiveDirectory}`,
    `- PDFs inspected: ${summary.validPdfCount}`,
    `- Public PDFs: ${summary.publicPdfCount}`,
    `- Unpublished PDFs: ${summary.unpublishedPdfCount}`,
    `- Invalid PDFs: ${summary.invalidPdfCount}`,
    `- Source bytes: ${formatBytes(summary.totalSourceBytes)}`,
    `- Total pages: ${formatNumber(summary.totalPages)}`,
    `- Page orientation: ${formatNumber(summary.orientation.portrait)} portrait, ${formatNumber(summary.orientation.landscape)} landscape, ${formatNumber(summary.orientation.square)} square`,
    '',
    '## Page-count distribution',
    '',
    `- Minimum: ${formatNumber(summary.pageCount.min)} pages`,
    `- Median: ${formatNumber(summary.pageCount.median)} pages`,
    `- Average: ${formatNumber(summary.pageCount.average)} pages`,
    `- P90: ${formatNumber(summary.pageCount.p90)} pages`,
    `- Maximum: ${formatNumber(summary.pageCount.max)} pages`,
    '',
    '## Source-size distribution',
    '',
    `- Minimum: ${formatBytes(summary.sourceSize.min)}`,
    `- Median: ${formatBytes(summary.sourceSize.median)}`,
    `- P90: ${formatBytes(summary.sourceSize.p90)}`,
    `- Maximum: ${formatBytes(summary.sourceSize.max)}`,
    '',
    '## Storage sensitivity',
    '',
    'These are planning estimates, not measured derivative sizes. Actual output depends on renderer scale, format, quality, and page content.',
    '',
    '| Assumed average derivative size | All valid PDFs | Public PDFs |',
    '| ---: | ---: | ---: |',
    ...summary.estimates.map((item) => `| ${formatBytes(item.bytesPerPage)} / page | ${formatBytes(item.totalBytes)} | ${formatBytes(item.publicBytes)} |`),
    '',
    '## Recommended rendering benchmark sample',
    '',
    '| Reason | File | Pages | Source size |',
    '| --- | --- | ---: | ---: |',
    ...sample.map((item) => `| ${item.reason} | \`${item.relativePath}\` | ${item.pageCount} | ${formatBytes(item.sourceBytes)} |`),
    '',
    '## Interpretation',
    '',
    '- The source archive size is not the same as reader delivery size; page derivatives trade storage for lower client CPU and smaller incremental page requests.',
    '- Browser-only PDF rendering can reuse cached PDF bytes after a normal reload, but PDF.js parsing and canvas rendering start again because they are in-memory client state.',
    '- A CDN can share immutable page-image responses across clients. Browser memory caches and service-worker caches cannot share decoded pages between clients.',
    '- Unpublished PDFs are reported separately and must not enter public derivative processing automatically.',
    '- This inventory does not decide derivative quality. A representative rendering benchmark is still required before choosing WebP/PNG, scale, and compression.',
    '',
    '## Recommendation',
    '',
    'Use this inventory to select a representative benchmark sample before processing the archive. Keep the existing PDF as the reading/download fallback. If the benchmark confirms that page images materially improve mobile startup and navigation, generate immutable page derivatives only for approved public publications and deliver them through shared cacheable URLs.',
    '',
    '## Invalid files',
    '',
    invalid.length === 0 ? '- None.' : invalid.map((file) => `- ${file.relativePath}: ${file.pdf.error}`).join('\n'),
  ];
  return `${lines.join('\n')}\n`;
}

function parseArguments(argv) {
  const options = { archive: DEFAULT_ARCHIVE, output: DEFAULT_OUTPUT };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--archive') options.archive = argv[++index];
    else if (argument === '--output') options.output = argv[++index];
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

export function createSummary(files) {
  return summarize(files);
}

export async function runSpike({ archiveDirectory = DEFAULT_ARCHIVE, outputDirectory = DEFAULT_OUTPUT } = {}) {
  const absoluteArchive = path.resolve(archiveDirectory);
  const absoluteOutput = path.resolve(outputDirectory);
  const archive = await scanArchive({ archiveDirectory: absoluteArchive, classifyFile: classifyPdf });
  const summary = summarize(archive.files);
  const sample = benchmarkSample(archive.files);
  const generatedAt = new Date().toISOString();
  await mkdir(absoluteOutput, { recursive: true });
  await writeFile(path.join(absoluteOutput, 'inventory.json'), `${JSON.stringify({ generatedAt, archiveDirectory: absoluteArchive, summary, benchmarkSample: sample, files: archive.files }, null, 2)}\n`);
  await writeFile(path.join(absoluteOutput, 'report.md'), renderReport({ archiveDirectory: absoluteArchive, generatedAt, summary, files: archive.files, sample }));
  return { outputDirectory: absoluteOutput, summary };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSpike(parseArguments(process.argv.slice(2)))
    .then(({ outputDirectory, summary }) => {
      process.stdout.write(`Reading derivative spike written to ${outputDirectory}\n`);
      process.stdout.write(`${summary.validPdfCount} PDFs, ${summary.totalPages} pages\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
}
