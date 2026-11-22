import { randomUUID } from 'node:crypto';
import { githubFixture } from '../fixtures/github.fixture';
import { participationFixture } from '../fixtures/participation.fixture';
import { emptyState } from '@/application/participation-state.helpers';
import type { ParticipationState } from '@/application/participation.types';
import { createParticipation } from '@/composition/participation.composition';
import { FixtureGitHubGateway } from '@/infrastructure/github/fixture-github.gateway';
import type { FixtureFailureMode } from '@/infrastructure/github/fixture-github.types';
import { JsonFileParticipationRepository } from '@/infrastructure/json-file.repository';

export function createTestParticipation(options: { failureMode?: FixtureFailureMode; seed?: () => ParticipationState } = {}) {
  let now = new Date('2026-11-21T12:00:00.000Z');
  const clock = () => now;
  const repository = new JsonFileParticipationRepository({ filePath: null, seed: options.seed ?? participationFixture, durable: false });
  const github = new FixtureGitHubGateway({ filePath: null, seed: githubFixture, failureMode: options.failureMode ?? 'none', clock });
  const participation = createParticipation({
    repository,
    github,
    config: { publicOrigin: 'https://participe.example', maintainers: ['lumamontes'], voterSecret: 'test' },
    clock,
    newId: randomUUID,
  });
  return {
    ...participation,
    repository,
    github,
    advance(ms: number) {
      now = new Date(now.getTime() + ms);
    },
    async commentsOn(issueNumber: number) {
      return (await github.getIssue(issueNumber))!.comments;
    },
  };
}

export { emptyState };
