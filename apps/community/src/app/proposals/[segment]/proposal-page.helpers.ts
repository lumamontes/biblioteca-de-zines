import type { ProposalDetailView } from '@/application/community-view.types';
import { DELIVERY_MESSAGES } from '@/application/contribution.config';
import type { ContributionFormState } from '@/components/proposal/contribution-form.types';

const FIELD_ERRORS: Readonly<Record<string, string>> = {
  text: 'Escreva seu comentário antes de enviar.',
  displayName: 'Escreva seu nome. Pode ser um apelido.',
};

/** Rebuilds the form result after a submission made without JavaScript (see the contribute route). */
export function contributionResultFromQuery(
  proposal: ProposalDetailView,
  query: { contribution?: string; contributionError?: string },
): { state?: ContributionFormState; text?: string; displayName?: string; contributionId?: string } {
  if (query.contributionError) {
    const fields = query.contributionError.split(',').filter((field) => field in FIELD_ERRORS) as ('text' | 'displayName')[];
    if (fields.length > 0) return { state: { status: 'invalid', errors: Object.fromEntries(fields.map((field) => [field, FIELD_ERRORS[field]])) } };
    return { state: { status: 'error', message: 'Não foi possível guardar seu comentário agora. Tente de novo em instantes.' } };
  }
  const contribution = proposal.contributions.find((item) => item.id === query.contribution);
  if (!contribution) return {};
  const state: ContributionFormState = {
    status: 'saved',
    contributionId: contribution.id,
    delivery: contribution.delivery,
    githubUrl: contribution.githubUrl,
    message: DELIVERY_MESSAGES[contribution.delivery],
  };
  // A failed delivery comes back with its text and key, so "Tentar de novo" retries the same contribution.
  return contribution.delivery === 'failed' ? { state, text: contribution.text ?? '', displayName: contribution.displayName, contributionId: contribution.id }
    : { state };
}

/** Relative 303 redirect, so the browser keeps the host it used (and its cookies) behind any proxy. */
export function seeOther(path: string): Response {
  return new Response(null, { status: 303, headers: { Location: path } });
}

/**
 * Server actions already reject cross-site posts; the no-JavaScript route handlers apply the
 * same rule so another site cannot submit votes or comments through a visitor's browser.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Older browsers omit Origin on same-origin form posts.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
