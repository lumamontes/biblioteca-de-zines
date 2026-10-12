import { selectCoverMigrationCandidates } from './cover-migration-service';
import type { CoverMigrationZine } from './cover-migration-types';

export type CoverMigrationSummary = {
  completed: number;
  failed: number;
  selected: number;
  skipped: number;
};

export function scopeCoverMigrationZines(
  zines: CoverMigrationZine[],
  onlyId?: number,
): CoverMigrationZine[] {
  return onlyId === undefined ? zines : zines.filter((zine) => zine.id === onlyId);
}

export function parseCoverMigrationId(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (!/^[1-9]\d*$/.test(value)) throw new Error('--only-id must be a positive integer');
  return Number(value);
}

export async function runCoverMigration(input: {
  apply: boolean;
  excludedIds: ReadonlySet<number>;
  isReachableImage: (url: string | null) => Promise<boolean>;
  onFailure?: (zine: CoverMigrationZine, error: unknown) => void;
  onSelected?: (zine: CoverMigrationZine) => void;
  processCandidate?: (zine: CoverMigrationZine) => Promise<void>;
  zines: CoverMigrationZine[];
}): Promise<CoverMigrationSummary> {
  const candidates = await selectCoverMigrationCandidates(
    input.zines,
    input.excludedIds,
    input.isReachableImage,
  );
  const summary: CoverMigrationSummary = {
    completed: 0,
    failed: 0,
    selected: candidates.length,
    skipped: input.zines.length - candidates.length,
  };

  candidates.forEach((candidate) => input.onSelected?.(candidate));
  if (!input.apply) return summary;
  if (!input.processCandidate) throw new Error('A processor is required in apply mode');

  for (const candidate of candidates) {
    try {
      await input.processCandidate(candidate);
      summary.completed += 1;
    } catch (error) {
      summary.failed += 1;
      input.onFailure?.(candidate, error);
    }
  }
  return summary;
}
