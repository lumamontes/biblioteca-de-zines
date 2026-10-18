export type ProcessingCliOptions = {
  concurrency: number;
  force: boolean;
  limit: number;
  onlyId?: number;
};

export function parseProcessingOptions(args: string[]): ProcessingCliOptions {
  const limit = getNumberArgument(args, '--limit', 10);
  const concurrency = getNumberArgument(args, '--concurrency', 2);
  const onlyIdValue = getNumberArgument(args, '--only-id', 0);
  const onlyId = onlyIdValue > 0 ? onlyIdValue : undefined;
  const force = args.includes('--force');
  if (force && onlyId === undefined) throw new Error('--force requires --only-id <zine_id>');
  return { concurrency, force, limit, onlyId };
}

function getNumberArgument(args: string[], name: string, fallback: number): number {
  const index = args.indexOf(name);
  const value = index >= 0 ? Number(args[index + 1]) : fallback;
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}
