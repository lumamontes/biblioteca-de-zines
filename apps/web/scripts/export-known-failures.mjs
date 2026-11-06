#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function createKnownFailuresReport(resources, report) {
  const resourcesById = new Map(resources.map((resource) => [resource.id, resource]));
  const failures = [];

  for (const result of report.results ?? []) {
    if (result.outcome === 'available') continue;

    const resource = resourcesById.get(result.resourceId);
    if (!resource) throw new Error(`Monitor result has no matching resource: ${result.resourceId}`);

    failures.push({
      title: result.title ?? resource.title,
      url: resource.url,
      cause: failureCause(resource.url, result.outcome),
    });
  }

  return {
    version: 1,
    failures,
  };
}

function failureCause(url, outcome) {
  if (url.includes('drive.google.com/drive/folders/')) return 'drive-folder';
  if (url.includes('drive.google.com')) return outcome === 'inaccessible' ? 'drive-restricted' : 'external-uncertain';
  return outcome === 'inaccessible' ? 'external-not-found' : 'external-uncertain';
}

async function main() {
  const [resourcesPath, reportPath, outputPath] = process.argv.slice(2);
  if (!resourcesPath || !reportPath || !outputPath) {
    throw new Error('Usage: export-known-failures.mjs <resources> <report> <output>');
  }

  const resources = JSON.parse(await readFile(resourcesPath, 'utf8'));
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  const output = `${JSON.stringify(createKnownFailuresReport(resources, report), null, 2)}\n`;
  await writeFile(outputPath, output, 'utf8');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  });
}
