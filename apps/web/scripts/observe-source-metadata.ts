import 'dotenv/config';
import { runSourceMetadataBatch } from '../src/application/source-metadata/run-source-metadata-batch';
import { createSourceMetadataBatchDependencies } from '../src/composition/cli/create-source-metadata-batch-dependencies';

const limit = getNumberArgument('--limit');

async function main(): Promise<void> {
  const run = await runSourceMetadataBatch(createSourceMetadataBatchDependencies(), { limit });
  console.table(run.results);
  console.log(JSON.stringify(run.report, null, 2));
}

function getNumberArgument(name: string): number | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = Number(process.argv[index + 1]);
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
