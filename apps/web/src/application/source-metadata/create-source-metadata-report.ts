import type { SourceMetadataReport, SourceMetadataReportInput } from './source-metadata-report-types';

export function createSourceMetadataReport(
  inputs: readonly SourceMetadataReportInput[],
): SourceMetadataReport {
  const observationsByDigest = new Map<string, string[]>();
  const failedSources: SourceMetadataReport['failedSources'] = [];
  const missingTextLayers: string[] = [];
  const metadataConflicts: SourceMetadataReport['metadataConflicts'] = [];

  for (const { observation, catalogue } of inputs) {
    const digest = observation.fixity?.digest;
    if (digest) observationsByDigest.set(digest, [...(observationsByDigest.get(digest) ?? []), observation.observationId]);
    if (observation.status !== 'observed') {
      failedSources.push({ observationId: observation.observationId, status: observation.status, reason: observation.failureReason });
    }
    if (observation.textLayerStatus === 'absent' || observation.textLayerStatus === 'partial') {
      missingTextLayers.push(observation.observationId);
    }
    compare('title', observation.embeddedMetadata?.title, catalogue?.title, observation.observationId, metadataConflicts);
    compare('author', observation.embeddedMetadata?.author, catalogue?.author, observation.observationId, metadataConflicts);
  }

  return {
    duplicateChecksums: [...observationsByDigest]
      .filter(([, observationIds]) => observationIds.length > 1)
      .map(([digest, observationIds]) => ({ digest, observationIds })),
    failedSources,
    missingTextLayers,
    metadataConflicts,
  };
}

function compare(
  field: 'title' | 'author',
  observedValue: string | null | undefined,
  catalogueValue: string | null | undefined,
  observationId: string,
  conflicts: SourceMetadataReport['metadataConflicts'],
): void {
  if (!observedValue || !catalogueValue || observedValue === catalogueValue) return;
  conflicts.push({ observationId, field, catalogueValue, observedValue });
}
