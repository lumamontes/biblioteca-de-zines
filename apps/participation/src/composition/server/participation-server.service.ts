import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { githubFixture } from '../../../fixtures/github.fixture';
import { participationFixture, withExtremeContent } from '../../../fixtures/participation.fixture';
import { FixtureGitHubGateway } from '@/infrastructure/github/fixture-github.gateway';
import { JsonFileParticipationRepository } from '@/infrastructure/json-file.repository';
import { createParticipation, type Participation } from '../participation.composition';
import { readServerSettings, type ServerSettings } from './participation-server.config';

export type ParticipationServer = Participation & {
  settings: ServerSettings;
  /** Present only while GitHub is simulated. Used by the local triage simulator. */
  fixtureGitHub: FixtureGitHubGateway;
  ready: Promise<void>;
};

const globalForParticipation = globalThis as typeof globalThis & { participationServer?: ParticipationServer };

function build(): ParticipationServer {
  const settings = readServerSettings();
  const clock = () => new Date();
  const repository = new JsonFileParticipationRepository({
    filePath: join(settings.dataDirectory, 'participation.json'),
    seed: () => (settings.extremeSeed ? withExtremeContent(participationFixture()) : participationFixture()),
    durable: settings.durableData,
  });
  const github = new FixtureGitHubGateway({
    filePath: join(settings.dataDirectory, 'github-fixture.json'),
    seed: githubFixture,
    failureMode: settings.failureMode,
    clock,
  });
  const participation = createParticipation({
    repository,
    github,
    config: { publicOrigin: settings.publicOrigin, maintainers: settings.maintainers, voterSecret: settings.voterSecret },
    clock,
    newId: randomUUID,
  });
  // The first sync fills public titles, official responses and stages from the simulated GitHub.
  const ready = participation.sync.syncAll().then(() => undefined);
  return { ...participation, settings, fixtureGitHub: github, ready };
}

/** One instance per server process, reused across dev hot reloads. */
export async function getParticipationServer(): Promise<ParticipationServer> {
  globalForParticipation.participationServer ??= build();
  await globalForParticipation.participationServer.ready;
  return globalForParticipation.participationServer;
}

export async function isTriageEnabled(): Promise<boolean> {
  const server = await getParticipationServer();
  // Without maintainer sign-in, triage only runs against the simulated GitHub.
  return server.settings.localTriage && server.fixtureGitHub.kind === 'fixture';
}
