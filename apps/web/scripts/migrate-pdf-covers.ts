import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { getExcludedCoverMigrationIds } from '../src/application/cover-generation/cover-migration-report';
import { parseCoverMigrationId, runCoverMigration, scopeCoverMigrationZines } from '../src/application/cover-generation/cover-migration-runner';
import { createCoverMigrationDependencies } from '../src/composition/cli/create-cover-migration-dependencies';
import { isReachableImage } from '../src/infrastructure/cover-generation/cover-reference-validator';

const reportPath = getArgument('--report') ?? '/tmp/biblioteca-zines-monitor/resource-report.json';
const apply = process.argv.includes('--apply');
const onlyId = parseCoverMigrationId(getArgument('--only-id'));

async function main(): Promise<void> {
  const { processCandidate, supabase } = await createCoverMigrationDependencies();
  const report = JSON.parse(await readFile(reportPath, 'utf8')) as { results?: Array<{ resourceId?: string; outcome?: string }> };
  const excludedIds = getExcludedCoverMigrationIds(report);

  const { data: zines, error } = await supabase
    .from('library_zines')
    .select('id, title, pdf_url, processed_pdf_url, cover_image, import_status')
    .eq('is_published', true)
    .not('pdf_url', 'is', null);

  if (error) throw new Error(`Failed to load zines: ${error.message}`);

  const scopedZines = scopeCoverMigrationZines(zines ?? [], onlyId);
  console.log(`Excluded by monitor report: ${excludedIds.size}`);
  const summary = await runCoverMigration({
    apply,
    excludedIds,
    isReachableImage,
    onFailure: (zine, error) => console.error(`  failed (${zine.id}):`, error),
    onSelected: (zine) => console.log(`[${apply ? 'process' : 'would process'}] ${zine.id}: ${zine.title}`),
    processCandidate,
    zines: scopedZines,
  });
  console.log(`${apply ? 'Processed' : 'Selected'} ${summary.selected} zines; ${summary.failed} failures`);
  if (summary.failed > 0) process.exitCode = 1;
}

function getArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}


main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
