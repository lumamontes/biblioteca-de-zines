#!/usr/bin/env node

import 'dotenv/config';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { promisify } from 'node:util';
import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import slugify from 'slugify';

const execFileAsync = promisify(execFile);

export const INVENTORY_SCHEMA_VERSION = 1;
export const INVENTORY_TOOL_VERSION = '0.1.0';
export const KNOWN_FAILURE_CAUSES = [
  'drive-restricted',
  'drive-folder',
  'external-not-found',
  'external-uncertain',
];
const KNOWN_FAILURE_DETAILS = {
  'drive-restricted': 'Historical monitor result: the Drive file was broken or unavailable from the public source link.',
  'drive-folder': 'Historical monitor result: the source was a Drive folder link, not a supported file link.',
  'external-not-found': 'Historical monitor result: the external source returned a not-found response.',
  'external-uncertain': 'Historical monitor result: the external source could not be conclusively classified.',
};
export const INVENTORY_TABLES = [
  'library_zines',
  'authors',
  'library_zines_authors',
  'form_uploads',
];

export function normalizeKnownFailures(input = []) {
  const source = Array.isArray(input) ? { version: 1, failures: input } : input;
  if (!source || !Array.isArray(source.failures)) {
    throw new Error('Known failures must be an array or an object with a failures array');
  }

  for (const failure of source.failures) {
    if (!failure || !KNOWN_FAILURE_CAUSES.includes(failure.cause)) {
      throw new Error(`Unknown known-failure cause: ${failure?.cause ?? 'missing'}`);
    }
    if (!failure.slug && !failure.url && failure.id == null) {
      throw new Error('Known failures require a slug, URL, or catalogue ID');
    }
  }

  return {
    version: source.version ?? 1,
    failures: source.failures.map((failure) => ({
      ...failure,
      details: failure.details ?? KNOWN_FAILURE_DETAILS[failure.cause],
    })),
  };
}

const DEFAULT_PAGE_SIZE = 1000;

function isoRunId(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function isInside(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function assertSafeOutputDirectory(outputDirectory, {
  repositoryRoot = process.cwd(),
  allowRepositoryOutput = false,
} = {}) {
  if (!allowRepositoryOutput && isInside(repositoryRoot, outputDirectory)) {
    throw new Error(
      `Inventory output must be outside the repository: ${path.resolve(outputDirectory)}`,
    );
  }
}

async function fetchTable({ baseUrl, apiKey, table, fetchImpl, pageSize }) {
  const rows = [];
  let offset = 0;

  while (true) {
    const url = new URL(`/rest/v1/${table}`, baseUrl);
    url.search = new URLSearchParams({
      select: '*',
      order: 'id.asc',
      limit: String(pageSize),
      offset: String(offset),
    }).toString();
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase ${table} request failed: HTTP ${response.status}`);
    }

    const page = await response.json();
    if (!Array.isArray(page)) {
      throw new Error(`Supabase ${table} response was not an array`);
    }

    rows.push(...page);
    if (page.length < pageSize) return rows;
    offset += page.length;
  }
}

export async function createSupabaseSnapshot({
  baseUrl,
  apiKey,
  tableNames = INVENTORY_TABLES,
  pageSize = DEFAULT_PAGE_SIZE,
  fetchImpl = fetch,
  runId = isoRunId(),
  collectedAt = new Date().toISOString(),
} = {}) {
  if (!baseUrl || !apiKey) {
    throw new Error('Supabase base URL and API key are required');
  }

  const tables = {};
  const tableErrors = {};
  for (const table of tableNames) {
    try {
      tables[table] = await fetchTable({ baseUrl, apiKey, table, fetchImpl, pageSize });
    } catch (error) {
      tableErrors[table] = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return {
    schemaVersion: INVENTORY_SCHEMA_VERSION,
    provenance: {
      runId,
      collectedAt,
      tables: [...tableNames],
      query: { select: '*', order: 'id.asc', pageSize },
      transport: 'supabase-rest-read-only',
    },
    tables,
    ...(Object.keys(tableErrors).length > 0 ? { tableErrors } : {}),
  };
}

async function walkFiles(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(absolutePath, root));
    } else if (entry.isFile()) {
      files.push({
        absolutePath,
        relativePath: path.relative(root, absolutePath).split(path.sep).join('/'),
      });
    }
  }

  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

async function identifyMimeType(absolutePath) {
  try {
    const { stdout } = await execFileAsync('file', ['--brief', '--mime-type', absolutePath]);
    return stdout.trim();
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

let pdfjsPromise;
async function validatePdf(buffer) {
  pdfjsPromise ??= import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfjs = await pdfjsPromise;
  const document = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    verbosity: 0,
    isEvalSupported: false,
  }).promise;
  return { status: 'valid', pageCount: document.numPages };
}

async function classifyFile({ absolutePath, buffer }) {
  const mimeType = await identifyMimeType(absolutePath);
  const isPdf = typeof mimeType === 'string'
    ? mimeType === 'application/pdf'
    : absolutePath.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    return { mimeType, pdf: { status: 'not-applicable' } };
  }

  try {
    return { mimeType, pdf: await validatePdf(buffer) };
  } catch (error) {
    return {
      mimeType,
      pdf: {
        status: 'invalid',
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

export async function scanArchive({
  archiveDirectory,
  classifyFile: classify = classifyFile,
  readFileImpl = readFile,
  statImpl = stat,
  runId = null,
  collectedAt = null,
} = {}) {
  if (!archiveDirectory) throw new Error('Archive directory is required');
  const files = [];

  for (const entry of await walkFiles(archiveDirectory)) {
    let buffer;
    let fileStat;
    try {
      buffer = await readFileImpl(entry.absolutePath);
      fileStat = await statImpl(entry.absolutePath);
    } catch (error) {
      files.push({
        relativePath: entry.relativePath,
        extension: path.extname(entry.relativePath).toLowerCase(),
        size: null,
        sha256: null,
        runId,
        collectedAt,
        mimeType: null,
        status: 'invalid',
        pdf: {
          status: 'invalid',
          error: error instanceof Error ? error.message : String(error),
        },
      });
      continue;
    }
    let classification;
    try {
      classification = await classify({
        absolutePath: entry.absolutePath,
        relativePath: entry.relativePath,
        buffer,
      });
    } catch (error) {
      classification = {
        mimeType: null,
        pdf: {
          status: 'invalid',
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }

    files.push({
      relativePath: entry.relativePath,
      extension: path.extname(entry.relativePath).toLowerCase(),
      size: fileStat.size,
      sha256: createHash('sha256').update(buffer).digest('hex'),
      runId,
      collectedAt,
      ...classification,
    });
  }

  return {
    schemaVersion: INVENTORY_SCHEMA_VERSION,
    files,
  };
}

function tableRows(snapshot, table) {
  return Array.isArray(snapshot?.tables?.[table]) ? snapshot.tables[table] : [];
}

function fileStem(relativePath) {
  return path.basename(relativePath).replace(/\.[^.]+$/, '');
}

function urlStem(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    return path.basename(url.pathname).replace(/\.[^.]+$/, '') || null;
  } catch {
    return null;
  }
}

function secondaryCandidates(file, records) {
  return records.filter((record) => secondaryEvidence(file, record).length > 0);
}

function secondaryEvidence(file, record) {
  const stem = fileStem(file.relativePath);
  const evidence = [];
  const titleMatches = typeof record.title === 'string'
    && slugify(record.title, { lower: true, strict: true }) === stem;
  const urlMatches = urlStem(record.pdf_url) === stem;
  const idMatches = record.id != null && String(record.id) === stem;
  if (titleMatches || urlMatches || idMatches) {
    evidence.push('filename');
    if (titleMatches) evidence.push('title');
    if (urlMatches) evidence.push('url');
    if (idMatches) evidence.push('id');
  }
  return evidence;
}

function knownFailureFor(record, knownFailures) {
  return knownFailures.find((failure) => (
    (failure.slug && failure.slug === record.slug)
    || (failure.url && failure.url === record.pdf_url)
    || (failure.id != null && String(failure.id) === String(record.id))
  ));
}

export function buildManifest({ snapshot, files, knownFailures = [] } = {}) {
  const records = tableRows(snapshot, 'library_zines');
  const knownFailureInput = normalizeKnownFailures(knownFailures);
  const failureRows = knownFailureInput.failures;
  const filesByRecord = new Map();
  const ambiguousFilesByRecord = new Map();
  const fileResults = files.map((file) => {
    const stem = fileStem(file.relativePath);
    const exact = records.filter((record) => record.slug === stem);
    const candidates = exact.length > 0 ? exact : secondaryCandidates(file, records);
    let match;

    if (candidates.length === 1) {
      const record = candidates[0];
      const method = exact.length === 1 ? 'slug' : 'secondary';
      match = {
        status: 'matched',
        method,
        confidence: method === 'slug' ? 'exact' : 'secondary',
        recordId: record.id,
        slug: record.slug ?? null,
        ...(method === 'secondary' ? { evidence: secondaryEvidence(file, record) } : {}),
      };
      const matches = filesByRecord.get(record.id) ?? [];
      matches.push(file.relativePath);
      filesByRecord.set(record.id, matches);
    } else if (candidates.length > 1) {
      match = {
        status: 'ambiguous',
        candidates: candidates.map((record) => ({ id: record.id, slug: record.slug ?? null })),
      };
      for (const record of candidates) {
        const files = ambiguousFilesByRecord.get(record.id) ?? [];
        files.push(file.relativePath);
        ambiguousFilesByRecord.set(record.id, files);
      }
    } else {
      match = { status: 'unmatched-file' };
    }

    return {
      ...file,
      status: file.status ?? (file.pdf?.status === 'invalid' ? 'invalid' : match.status),
      match,
    };
  });

  const recordResults = records.map((record) => {
    const matchedFiles = filesByRecord.get(record.id) ?? [];
    const ambiguousFiles = ambiguousFilesByRecord.get(record.id) ?? [];
    const knownFailure = knownFailureFor(record, failureRows);
    if (matchedFiles.length > 0) {
      return {
        id: record.id,
        slug: record.slug ?? null,
        status: 'matched',
        files: matchedFiles,
        ...(knownFailure ? { knownFailure } : {}),
      };
    }
    if (knownFailure) {
      return {
        id: record.id,
        slug: record.slug ?? null,
        status: 'known-failure',
        knownFailure,
      };
    }
    if (ambiguousFiles.length > 0) {
      return {
        id: record.id,
        slug: record.slug ?? null,
        status: 'ambiguous',
        files: ambiguousFiles,
      };
    }
    return { id: record.id, slug: record.slug ?? null, status: 'missing', relation: 'unmatched-record', files: [] };
  });

  const manifest = {
    schemaVersion: INVENTORY_SCHEMA_VERSION,
    files: fileResults,
    records: recordResults,
    knownFailures: failureRows,
    provenance: {
      ...(snapshot?.provenance ?? {}),
      knownFailuresVersion: knownFailureInput.version,
    },
  };

  return { ...manifest, sample: selectDeterministicSample(manifest) };
}

export function selectDeterministicSample(manifest, { limitPerCategory = 5 } = {}) {
  const fileCategories = {};
  for (const file of manifest.files ?? []) {
    const categories = [file.status ?? file.match?.status];
    if (file.pdf?.status === 'invalid') categories.push('invalid-pdf');
    for (const category of categories) {
      if (!category || category === 'matched') continue;
      const values = fileCategories[category] ?? [];
      values.push(file.relativePath);
      fileCategories[category] = values;
    }
  }

  const recordCategories = {};
  for (const record of manifest.records ?? []) {
    if (record.status === 'matched') continue;
    const values = recordCategories[record.status] ?? [];
    values.push(record.id);
    recordCategories[record.status] = values;
  }

  return {
    files: Object.fromEntries(Object.entries(fileCategories)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, values]) => [category, values.sort().slice(0, limitPerCategory)])),
    records: Object.fromEntries(Object.entries(recordCategories)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, values]) => [category, values.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
      }).slice(0, limitPerCategory)])),
  };
}

export function compareManifests(before, after) {
  if (before.schemaVersion !== after.schemaVersion) {
    throw new Error(`Unsupported manifest schema comparison: ${before.schemaVersion} -> ${after.schemaVersion}`);
  }

  const beforeFiles = new Map((before.files ?? []).map((file) => [file.relativePath, file]));
  const afterFiles = new Map((after.files ?? []).map((file) => [file.relativePath, file]));
  const fileKeys = new Set([...beforeFiles.keys(), ...afterFiles.keys()]);
  const files = { added: [], removed: [], changed: [], unchanged: [] };

  for (const key of [...fileKeys].sort()) {
    const oldFile = beforeFiles.get(key);
    const newFile = afterFiles.get(key);
    if (!oldFile) files.added.push(key);
    else if (!newFile) files.removed.push(key);
    else if (
      oldFile.sha256 !== newFile.sha256
      || oldFile.size !== newFile.size
      || oldFile.status !== newFile.status
      || oldFile.match?.status !== newFile.match?.status
    ) files.changed.push(key);
    else files.unchanged.push(key);
  }

  const beforeRecords = new Map((before.records ?? []).map((record) => [String(record.id), record]));
  const afterRecords = new Map((after.records ?? []).map((record) => [String(record.id), record]));
  const recordKeys = new Set([...beforeRecords.keys(), ...afterRecords.keys()]);
  const records = { changed: [], unchanged: [] };

  for (const key of [...recordKeys].sort()) {
    const oldRecord = beforeRecords.get(key);
    const newRecord = afterRecords.get(key);
    const oldFingerprint = oldRecord && JSON.stringify({
      status: oldRecord.status,
      files: oldRecord.files ?? [],
      knownFailure: oldRecord.knownFailure ?? null,
    });
    const newFingerprint = newRecord && JSON.stringify({
      status: newRecord.status,
      files: newRecord.files ?? [],
      knownFailure: newRecord.knownFailure ?? null,
    });
    if (!oldRecord || !newRecord || oldFingerprint !== newFingerprint) {
      records.changed.push({
        id: newRecord?.id ?? oldRecord.id,
        from: oldRecord?.status ?? null,
        to: newRecord?.status ?? null,
      });
    } else {
      records.unchanged.push({ id: newRecord.id, status: newRecord.status });
    }
  }

  return { files, records };
}

function countBy(items, field) {
  return items.reduce((counts, item) => {
    const value = item[field] ?? 'unknown';
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

export function renderReport({ snapshot, manifest, comparison = null, archiveDirectory }) {
  const valid = manifest.files.filter((file) => file.pdf?.status === 'valid').length;
  const invalid = manifest.files.filter((file) => file.pdf?.status === 'invalid').length;
  const lines = [
    '# Biblioteca archive inventory',
    '',
    'This is a private, local report. It is evidence for the archive baseline, not a preservation guarantee.',
    '',
    '## Run',
    '',
    `- Run ID: ${manifest.provenance.runId ?? 'unknown'}`,
    `- Collected at: ${manifest.provenance.collectedAt ?? 'unknown'}`,
    `- Archive directory: ${archiveDirectory}`,
    `- Schema version: ${manifest.schemaVersion}`,
    `- Tool version: ${manifest.provenance.toolVersion ?? 'unknown'}`,
    `- Known-failure input version: ${manifest.provenance.knownFailuresVersion ?? 'unknown'}`,
    `- Run purpose: ${manifest.provenance.runPurpose ?? 'unknown'}`,
    `- Review status: ${manifest.provenance.reviewStatus ?? 'unknown'}`,
    '',
    '## Coverage',
    '',
    `- Local files: ${manifest.files.length}`,
    `- Structurally valid PDFs: ${valid}`,
    `- Invalid PDFs: ${invalid}`,
    `- Catalogue records: ${manifest.records.length}`,
    `- Known historical failures: ${manifest.knownFailures.length}`,
    '',
    '## File statuses',
    '',
    '```json',
    JSON.stringify(countBy(manifest.files, 'status'), null, 2),
    '```',
    '',
    '## Domain distinctions',
    '',
    '- A catalogue record describes a zine; a local archive file is evidence of observed bytes.',
    '- Original, reading copy, preview, and derivative status are not inferred from a filename or PDF validity.',
    '- A known failure is historical evidence and is not a current recheck result.',
    '',
    '## Unknowns and risks',
    '',
    '- Authorization, consent, correction, restriction, and removal status require maintainer review.',
    '- A matched and readable local archive file does not establish that it is an authorised original.',
    '- Missing or ambiguous relationships require manual investigation before storage or migration decisions.',
    '',
    '## Deterministic review sample',
    '',
    '```json',
    JSON.stringify(manifest.sample, null, 2),
    '```',
    '',
    '## Catalogue statuses',
    '',
    '```json',
    JSON.stringify(countBy(manifest.records, 'status'), null, 2),
    '```',
    ...(Object.keys(snapshot?.tableErrors ?? {}).length > 0
      ? [
        '',
        '## Snapshot table errors',
        '',
        '```json',
        JSON.stringify(snapshot.tableErrors, null, 2),
        '```',
      ]
      : []),
    '',
    '## Evidence boundaries',
    '',
    '- Supabase data is a production snapshot collected through read-only requests.',
    '- Local file checks describe observed bytes and parser results only.',
    '- Historical monitor failures are not rechecked by this run.',
    '- A valid local PDF or reachable URL does not prove authorization, redundancy, or recovery.',
  ];

  if (comparison) {
    lines.push('', '## Change from previous run', '', '```json', JSON.stringify(comparison, null, 2), '```');
  }

  return `${lines.join('\n')}\n`;
}

async function readJsonFile(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export async function runInventory({
  archiveDirectory,
  outputDirectory,
  knownFailures = [],
  previousManifest = null,
  baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
  apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
  tableNames = INVENTORY_TABLES,
  fetchImpl = fetch,
  classifyFile = undefined,
  runId = isoRunId(),
  collectedAt = new Date().toISOString(),
  calibration = true,
  repositoryRoot = process.cwd(),
  allowRepositoryOutput = false,
} = {}) {
  outputDirectory ??= defaultOutputDirectory(runId);
  assertSafeOutputDirectory(outputDirectory, { repositoryRoot, allowRepositoryOutput });
  await mkdir(outputDirectory, { recursive: true });
  const snapshot = await createSupabaseSnapshot({
    baseUrl,
    apiKey,
    tableNames,
    fetchImpl,
    runId,
    collectedAt,
  });
  snapshot.provenance = {
    ...snapshot.provenance,
    toolVersion: INVENTORY_TOOL_VERSION,
    archiveRootDescription: 'local-archive-directory',
    validators: ['file-mime-type', 'pdfjs-structural-parse'],
    knownFailuresVersion: normalizeKnownFailures(knownFailures).version,
    runPurpose: calibration ? 'calibration' : 'repeatable-run',
    reviewStatus: calibration ? 'needs-review' : 'not-requested',
  };
  const archive = await scanArchive({ archiveDirectory, classifyFile, runId, collectedAt });
  const manifest = buildManifest({ snapshot, files: archive.files, knownFailures });
  const comparison = previousManifest ? compareManifests(previousManifest, manifest) : null;

  await writeFile(path.join(outputDirectory, 'supabase-snapshot.json'), json(snapshot));
  await writeFile(path.join(outputDirectory, 'manifest.json'), json(manifest));
  await writeFile(path.join(outputDirectory, 'report.md'), renderReport({
    snapshot,
    manifest,
    comparison,
    archiveDirectory,
  }));
  if (comparison) await writeFile(path.join(outputDirectory, 'comparison.json'), json(comparison));

  return { snapshot, manifest, comparison, outputDirectory };
}

function defaultOutputDirectory(runId) {
  return path.join(os.homedir(), 'Library', 'Application Support', 'biblioteca-zines', 'archive-inventory', runId);
}

function parseArguments(argv) {
  const options = {
    archiveDirectory: 'archive',
    knownFailuresPath: 'monitor/known-failures.json',
    previousManifestPath: null,
    outputDirectory: null,
    allowRepositoryOutput: false,
    calibration: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const next = argv[index + 1];
    if (argument === '--archive') options.archiveDirectory = next;
    else if (argument === '--output') options.outputDirectory = next;
    else if (argument === '--known-failures') options.knownFailuresPath = next;
    else if (argument === '--previous') options.previousManifestPath = next;
    else if (argument === '--allow-repository-output') options.allowRepositoryOutput = true;
    else if (argument === '--no-calibration') options.calibration = false;
    else throw new Error(`Unknown argument: ${argument}`);
    if (argument !== '--allow-repository-output' && argument !== '--no-calibration') index += 1;
  }

  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const runId = isoRunId();
  const knownFailures = options.knownFailuresPath && existsSync(options.knownFailuresPath)
    ? await readJsonFile(options.knownFailuresPath)
    : [];
  const previousManifest = options.previousManifestPath
    ? await readJsonFile(options.previousManifestPath)
    : null;
  const outputDirectory = options.outputDirectory ?? defaultOutputDirectory(runId);
  const result = await runInventory({
    ...options,
    knownFailures,
    previousManifest,
    runId,
    outputDirectory,
  });
  process.stdout.write(`Inventory written to ${result.outputDirectory}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
