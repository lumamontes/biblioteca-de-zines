import type { CommunityRepository, CommunityState } from '@/application/community.types';
import { readJsonFile, writeJsonFileAtomically } from './json-file.helpers';

/**
 * Local-development repository. With a file path it persists to JSON; without one it
 * keeps state in memory for tests. Updates are serialized in this process. It is not a
 * production store: a serverless deploy loses the file between instances.
 */
export class JsonFileCommunityRepository implements CommunityRepository {
  readonly durable: boolean;
  private state: CommunityState;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly options: { filePath: string | null; seed: () => CommunityState; durable: boolean }) {
    this.durable = options.durable;
    const stored = options.filePath ? readJsonFile<CommunityState>(options.filePath) : null;
    this.state = stored ?? options.seed();
    if (!stored) this.persist();
  }

  async read(): Promise<CommunityState> {
    await this.queue;
    return structuredClone(this.state);
  }

  update<Result>(change: (state: CommunityState) => Result): Promise<Result> {
    const run = this.queue.then(() => {
      const draft = structuredClone(this.state);
      const result = change(draft);
      this.state = draft;
      this.persist();
      return structuredClone(result);
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  private persist(): void {
    if (this.options.filePath) writeJsonFileAtomically(this.options.filePath, this.state);
  }
}
