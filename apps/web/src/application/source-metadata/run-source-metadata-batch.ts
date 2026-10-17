import type {
  SourceMetadataBatchDependencies,
  SourceMetadataBatchResult,
} from './source-metadata-batch-types';
import { createSourceMetadataReport } from './create-source-metadata-report';
import type { SourceMetadataBatchRun } from './source-metadata-batch-types';

export async function runSourceMetadataBatch(
  dependencies: SourceMetadataBatchDependencies,
  options: { limit?: number } = {},
): Promise<SourceMetadataBatchRun> {
  const sources = await dependencies.listSources();
  const selected = options.limit === undefined ? sources : sources.slice(0, Math.max(0, options.limit));
  const results: SourceMetadataBatchResult[] = [];
  const observations = [];

  for (const source of selected) {
    const observation = await dependencies.observe(source);
    const observationId = await dependencies.record(observation);
    results.push({ sourceId: source.sourceId, observationId, status: observation.status });
    observations.push({ observation, catalogue: source.catalogue });
  }

  return { results, report: createSourceMetadataReport(observations) };
}
