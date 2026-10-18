import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';
import { selectPageMigrationCandidates, type PageMigrationZine } from '../src/application/page-generation/page-migration-service';

type MonitorReport = { results?: Array<{ resourceId?: string; outcome?: string }> };
const reportPath = getArgument('--report') ?? '/tmp/biblioteca-zines-monitor/resource-report.json';
const apply = process.argv.includes('--apply');
const onlyId = getArgument('--only-id');

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  const supabase = createClient<Database>(url, key);
  const report = JSON.parse(await readFile(reportPath, 'utf8')) as MonitorReport;
  const excludedIds = new Set((report.results ?? [])
    .filter(({ outcome }) => outcome === 'inaccessible' || outcome === 'invalid' || outcome === 'invalid-input')
    .map(({ resourceId }) => parseResourceId(resourceId)).filter((id): id is number => id !== null));
  const { data, error } = await supabase.from('library_zines')
    .select('id, title, pdf_url, processed_pdf_url, import_status, active_page_generation, total_pages, is_published')
    .eq('is_published', true).not('pdf_url', 'is', null);
  if (error) throw new Error(`Failed to load zines: ${error.message}`);
  const scoped = onlyId ? (data ?? []).filter((zine) => zine.id === Number(onlyId)) : data ?? [];
  const candidates = selectPageMigrationCandidates(scoped as PageMigrationZine[], excludedIds);
  console.log(`${apply ? 'Applying' : 'Dry run'} PDF page migration for ${candidates.length} zines`);
  console.log(`Excluded by monitor report: ${excludedIds.size}`);
  let failures = 0;
  if (apply) {
    const { createZinePageProcessor } = await import('../src/composition/server/create-zine-page-processor');
    const processor = createZinePageProcessor(supabase);
    for (const zine of candidates) {
      console.log(`[process] ${zine.id}: ${zine.title}`);
      try {
        await processor({ attemptCount: 0, id: zine.id, isPublished: true, pdfUrl: zine.pdf_url!, title: zine.title, zineId: zine.id });
      } catch (error) {
        failures += 1;
        console.error(`[failed] ${zine.id}:`, error);
      }
    }
  } else {
    for (const zine of candidates) console.log(`[would process] ${zine.id}: ${zine.title}`);
  }
  console.log(`${apply ? 'Processed' : 'Selected'} ${candidates.length} zines; ${failures} failures`);
  if (failures) process.exitCode = 1;
}

function getArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
function parseResourceId(resourceId: string | undefined): number | null {
  const match = resourceId?.match(/^library_zines:(\d+)$/);
  return match ? Number(match[1]) : null;
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
