import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';
import { parseCoverMigrationId, runCoverMigration, scopeCoverMigrationZines } from '../src/application/cover-generation/cover-migration-runner';
import { getExcludedCoverMigrationIds } from '../src/application/cover-generation/cover-migration-report';
import { createCoverMigrationDependencies } from '../src/composition/cli/create-cover-migration-dependencies';
import type { CoverMigrationMonitorReport } from '../src/application/cover-generation/cover-migration-report';
import { isReachableImage } from '../src/infrastructure/cover-generation/cover-reference-validator';

const reportPath = getArgument('--report') ?? '/tmp/biblioteca-zines-monitor/resource-report.json';
const apply = process.argv.includes('--apply');
const onlyIdFlagIndex = process.argv.indexOf('--only-id');

async function main(): Promise<void> {
  if (onlyIdFlagIndex >= 0 && getArgument('--only-id') === undefined) {
    throw new Error('--only-id requires a positive integer value');
  }
  const onlyId = process.argv.includes('--only-id')
    ? parseCoverMigrationId(getArgument('--only-id'))
    : undefined;
  const dependencies = await createCoverMigrationDependencies();
  const supabase = dependencies.supabase;
  const report = JSON.parse(await readFile(reportPath, 'utf8')) as CoverMigrationMonitorReport;
  const excludedIds = getExcludedCoverMigrationIds(report);

  const zines = await loadPublishedZines(supabase);

  const scopedZines = scopeCoverMigrationZines(zines, onlyId);
  const summary = await runCoverMigration({
    apply,
    excludedIds,
    isReachableImage,
    onSelected: (zine) => console.log(`[${apply ? 'process' : 'would process'}] ${zine.id}: ${zine.title}`),
    onFailure: (zine, error) => {
      console.error(`failed (${zine.id}):`, error);
    },
    processCandidate: apply ? dependencies.processCandidate : undefined,
    zines: scopedZines,
  });
  console.log(`${apply ? 'Applying' : 'Dry run'} PDF cover migration`);
  console.log(JSON.stringify({ ...summary, excludedByMonitor: excludedIds.size }));
  if (summary.failed > 0) process.exitCode = 1;
}

async function loadPublishedZines(supabase: SupabaseClient<Database>) {
  const pageSize = 500;
  const zines: Array<{
    cover_image: string | null;
    id: number;
    import_status: string | null;
    pdf_url: string | null;
    processed_pdf_url: string | null;
    title: string;
  }> = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from('library_zines')
      .select('id, title, pdf_url, processed_pdf_url, cover_image, import_status')
      .eq('is_published', true)
      .not('pdf_url', 'is', null)
      .order('id', { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(`Failed to load zines: ${error.message}`);
    zines.push(...(data ?? []));
    if (!data || data.length < pageSize) return zines;
  }
}

function getArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
