import { createHmac, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { VOTER_COOKIE } from './participation-server.config';
import { getParticipationServer } from './participation-server.service';

/**
 * The browser keeps a random token; the server stores only its HMAC. This gives at most one
 * counted vote per browser and proposal while the cookie exists, not one vote per person.
 */
async function hashToken(token: string): Promise<string> {
  const { settings } = await getParticipationServer();
  return createHmac('sha256', settings.voterSecret).update(token).digest('hex');
}

function isValidToken(token: string | undefined): token is string {
  return typeof token === 'string' && /^[0-9a-f]{32}$/.test(token);
}

export async function readVoterHash(): Promise<string | null> {
  const token = (await cookies()).get(VOTER_COOKIE.name)?.value;
  return isValidToken(token) ? hashToken(token) : null;
}

/** Only callable from server actions, where cookies can be set. */
export async function ensureVoterHash(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VOTER_COOKIE.name)?.value;
  if (isValidToken(existing)) return hashToken(existing);
  const token = randomBytes(16).toString('hex');
  const { settings } = await getParticipationServer();
  store.set(VOTER_COOKIE.name, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: settings.secureCookies,
    maxAge: VOTER_COOKIE.maxAgeSeconds,
    path: '/',
  });
  return hashToken(token);
}
