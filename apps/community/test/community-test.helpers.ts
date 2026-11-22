import { randomUUID } from 'node:crypto';
import { githubFixture } from '../fixtures/github.fixture';
import { communityFixture } from '../fixtures/community.fixture';
import { emptyState } from '@/application/community-state.helpers';
import type { CommunityState } from '@/application/community.types';
import { createCommunity } from '@/composition/community.composition';
import { FixtureGitHubGateway } from '@/infrastructure/github/fixture-github.gateway';
import type { FixtureFailureMode } from '@/infrastructure/github/fixture-github.types';
import { JsonFileCommunityRepository } from '@/infrastructure/json-file.repository';

export function createTestCommunity(options: { failureMode?: FixtureFailureMode; seed?: () => CommunityState } = {}) {
  let now = new Date('2026-11-21T12:00:00.000Z');
  const clock = () => now;
  const repository = new JsonFileCommunityRepository({ filePath: null, seed: options.seed ?? communityFixture, durable: false });
  const github = new FixtureGitHubGateway({ filePath: null, seed: githubFixture, failureMode: options.failureMode ?? 'none', clock });
  const community = createCommunity({
    repository,
    github,
    config: { publicUrl: 'https://biblioteca.example/comunidade', maintainers: ['lumamontes'], voterSecret: 'test' },
    clock,
    newId: randomUUID,
  });
  return {
    ...community,
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
