export type CoverMigrationMonitorReport = {
  results?: Array<{ resourceId?: string; outcome?: string }>;
};

export function getExcludedCoverMigrationIds(report: CoverMigrationMonitorReport): Set<number> {
  return new Set(
    (report.results ?? [])
      .filter((result) => result.outcome === 'inaccessible'
        || result.outcome === 'invalid'
        || result.outcome === 'invalid-input')
      .map((result) => parseResourceId(result.resourceId))
      .filter((id): id is number => id !== null),
  );
}

function parseResourceId(resourceId: string | undefined): number | null {
  const match = resourceId?.match(/^library_zines:(\d+)$/);
  return match ? Number(match[1]) : null;
}
