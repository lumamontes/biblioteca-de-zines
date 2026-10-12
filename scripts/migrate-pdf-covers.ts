import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';
import { isGeneratedCover, isPlaceholderCover } from '../src/utils/cover-image';

type MonitorReport = {
  results?: Array<{ resourceId?: string; outcome?: string }>;
};

const reportPath = getArgument('--report') ?? '/tmp/biblioteca-zines-monitor/resource-report.json';
const apply = process.argv.includes('--apply');
const onlyId = getArgument('--only-id');

async function main(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
  const report = JSON.parse(await readFile(reportPath, 'utf8')) as MonitorReport;
  const excludedIds = new Set(
    (report.results ?? [])
      .filter((result) => result.outcome === 'inaccessible' || result.outcome === 'invalid')
      .map((result) => parseResourceId(result.resourceId))
      .filter((id): id is number => id !== null),
  );

  const { data: zines, error } = await supabase
    .from('library_zines')
    .select('id, title, pdf_url, processed_pdf_url, cover_image, import_status')
    .eq('is_published', true)
    .not('pdf_url', 'is', null);

  if (error) throw new Error(`Failed to load zines: ${error.message}`);

  const candidates: Array<NonNullable<typeof zines>[number]> = [];
  for (const zine of zines ?? []) {
    if (onlyId && zine.id !== Number(onlyId)) continue;
    if (excludedIds.has(zine.id)) continue;
    if (!zine.pdf_url || isGeneratedCover(zine.cover_image)
      && zine.processed_pdf_url === zine.pdf_url
      && zine.import_status === 'completed') continue;
    if (!isPlaceholderCover(zine.cover_image) && await isReachableImage(zine.cover_image)) continue;
    candidates.push(zine);
  }

  console.log(`${apply ? 'Applying' : 'Dry run'} PDF migration for ${candidates.length} zines`);
  console.log(`Excluded by monitor report: ${excludedIds.size}`);

  const { createCoverGenerationFromUrl } = apply
    ? await import('../src/services/cover-import-service')
    : { createCoverGenerationFromUrl: null };

  let failures = 0;
  for (const zine of candidates) {
    console.log(`[${apply ? 'process' : 'would process'}] ${zine.id}: ${zine.title}`);
    if (apply && zine.pdf_url && createCoverGenerationFromUrl) {
      try {
        await createCoverGenerationFromUrl(zine.id, zine.pdf_url, supabase);
        console.log(`  completed (${zine.id})`);
      } catch (migrationError) {
        failures += 1;
        console.error(`  failed (${zine.id}):`, migrationError);
      }
    }
  }
  console.log(`${apply ? 'Processed' : 'Selected'} ${candidates.length} zines; ${failures} failures`);
  if (failures > 0) process.exitCode = 1;
}

function getArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function parseResourceId(resourceId: string | undefined): number | null {
  const match = resourceId?.match(/^library_zines:(\d+)$/);
  return match ? Number(match[1]) : null;
}

async function isReachableImage(url: string | null): Promise<boolean> {
  if (!url) return false;
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/') === true;
  } catch {
    return false;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
