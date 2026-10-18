import { writeFile } from 'node:fs/promises';
import { createReaderPerformancePlan } from '@/infrastructure/reader/performance-plan';

type TimedResponse = {
  cacheControl: string | null;
  elapsedMs: number;
  url: string;
  bytes: number;
  status: number;
};

async function measure(url: string, headers: HeadersInit = {}): Promise<TimedResponse> {
  const started = performance.now();
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Page request failed with ${response.status}: ${url}`);
  const bytes = (await response.arrayBuffer()).byteLength;
  return {
    bytes,
    cacheControl: response.headers.get('cache-control'),
    elapsedMs: Math.round(performance.now() - started),
    status: response.status,
    url,
  };
}

async function main(): Promise<void> {
  const manifestUrl = process.env.READER_PERFORMANCE_URL;
  if (!manifestUrl) throw new Error('Set READER_PERFORMANCE_URL to a public-reader API URL');
  const manifestResponse = await fetch(`${manifestUrl}${manifestUrl.includes('?') ? '&' : '?'}surface=standalone`);
  if (!manifestResponse.ok) throw new Error(`Manifest request failed with ${manifestResponse.status}`);
  const manifest = await manifestResponse.json() as { status: 'ready'; manifest: { pages: { pageNumber: number; imageUrl: string }[] } };
  if (manifest.status !== 'ready') throw new Error('Performance target did not return a ready manifest');

  const plan = createReaderPerformancePlan(manifestUrl, manifest.manifest.pages);
  const first = await measure(plan.firstPageUrl);
  const adjacent = await Promise.all(plan.adjacentPageUrls.map((url) => measure(url)));
  const revisit = await measure(plan.firstPageUrl);
  const result = {
    generatedAt: new Date().toISOString(),
    manifest: { cacheControl: manifestResponse.headers.get('cache-control'), url: plan.manifestUrl },
    pages: { adjacent, first, repeat: revisit },
    requestPlan: {
      adjacentPageRequests: adjacent.length,
      initialPageRequests: 1,
      revisitPageRequests: 1,
      derivativeBandwidthBytes: first.bytes + adjacent.reduce((total, page) => total + page.bytes, 0),
      revisitResponseBytes: revisit.bytes,
      revisitCacheControl: revisit.cacheControl,
    },
  };
  const output = process.env.READER_PERFORMANCE_OUTPUT;
  if (output) await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
