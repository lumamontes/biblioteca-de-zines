import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { githubFixture } from '../../../fixtures/github.fixture';
import { communityFixture, withExtremeContent } from '../../../fixtures/community.fixture';
import { FixtureGitHubGateway } from '@/infrastructure/github/fixture-github.gateway';
import { JsonFileCommunityRepository } from '@/infrastructure/json-file.repository';
import { createCommunity, type Community } from '../community.composition';
import { readServerSettings, type ServerSettings } from './community-server.config';

export type CommunityServer = Community & {
  settings: ServerSettings;
  /** Present only while GitHub is simulated. Used by the local triage simulator. */
  fixtureGitHub: FixtureGitHubGateway;
  ready: Promise<void>;
};

const globalForCommunity = globalThis as typeof globalThis & { communityServer?: CommunityServer };

function build(): CommunityServer {
  const settings = readServerSettings();
  const clock = () => new Date();
  const repository = new JsonFileCommunityRepository({
    filePath: join(settings.dataDirectory, 'community.json'),
    seed: () => (settings.extremeSeed ? withExtremeContent(communityFixture()) : communityFixture()),
    durable: settings.durableData,
  });
  const github = new FixtureGitHubGateway({
    filePath: join(settings.dataDirectory, 'github-fixture.json'),
    seed: githubFixture,
    failureMode: settings.failureMode,
    clock,
  });
  const community = createCommunity({
    repository,
    github,
    config: { publicUrl: settings.publicUrl, maintainers: settings.maintainers, voterSecret: settings.voterSecret },
    clock,
    newId: randomUUID,
  });
  // The first sync fills public titles, official responses and stages from the simulated GitHub.
  const ready = community.sync.syncAll().then(() => undefined);
  return { ...community, settings, fixtureGitHub: github, ready };
}

/** One instance per server process, reused across dev hot reloads. */
export async function getCommunityServer(): Promise<CommunityServer> {
  globalForCommunity.communityServer ??= build();
  await globalForCommunity.communityServer.ready;
  return globalForCommunity.communityServer;
}

export async function isTriageEnabled(): Promise<boolean> {
  const server = await getCommunityServer();
  // Without maintainer sign-in, triage only runs against the simulated GitHub.
  return server.settings.localTriage && server.fixtureGitHub.kind === 'fixture';
}
