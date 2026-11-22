import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FixtureFailureMode } from '@/infrastructure/github/fixture-github.types';

const FAILURE_MODES: readonly FixtureFailureMode[] = ['none', 'lost-confirmation', 'unavailable'];

export type ServerSettings = {
  publicOrigin: string;
  catalogueUrl: string;
  maintainers: string[];
  voterSecret: string;
  dataDirectory: string;
  durableData: boolean;
  failureMode: FixtureFailureMode;
  localTriage: boolean;
  extremeSeed: boolean;
  secureCookies: boolean;
};

export function readServerSettings(env: NodeJS.ProcessEnv = process.env): ServerSettings {
  const onServerless = Boolean(env.VERCEL);
  const failureMode = (env.COMMUNITY_GITHUB_FAILURE ?? 'none') as FixtureFailureMode;
  return {
    publicOrigin: env.COMMUNITY_PUBLIC_ORIGIN ?? 'http://localhost:4200',
    catalogueUrl: env.COMMUNITY_CATALOGUE_URL ?? 'https://biblioteca-de-zines.com.br',
    maintainers: (env.COMMUNITY_MAINTAINERS ?? 'lumamontes').split(',').map((login) => login.trim()).filter(Boolean),
    // Only the simulated GitHub runs today, so a development secret is acceptable. The real
    // gateway (increment 2) must refuse to start without COMMUNITY_VOTER_SECRET.
    voterSecret: env.COMMUNITY_VOTER_SECRET ?? 'local-development-voter-secret',
    dataDirectory: env.COMMUNITY_DATA_DIR ?? (onServerless ? join(tmpdir(), 'community') : join(process.cwd(), '.data')),
    durableData: !onServerless,
    failureMode: FAILURE_MODES.includes(failureMode) ? failureMode : 'none',
    localTriage: env.COMMUNITY_LOCAL_TRIAGE === '1',
    extremeSeed: env.COMMUNITY_SEED === 'extreme',
    secureCookies: env.NODE_ENV === 'production',
  };
}

export const VOTER_COOKIE = {
  name: 'bz_participant',
  maxAgeSeconds: 60 * 60 * 24 * 365,
} as const;

/** Name of the maintainer the local triage acts as. Real sign-in arrives in increment 3. */
export const LOCAL_MAINTAINER = 'lumamontes';
