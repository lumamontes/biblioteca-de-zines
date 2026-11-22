import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { isSameOrigin, seeOther } from '../proposal-page.helpers';
import { contributeFromForm } from '@/composition/server/proposal-commands.service';

/**
 * Without JavaScript the comment form posts here. The result is shown on the proposal page
 * from the contribution id; a failed delivery comes back with the text so it can be retried.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ segment: string }> }) {
  if (!isSameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const { segment } = await params;
  const formData = await request.formData();
  const result = await contributeFromForm(formData);
  revalidatePath('/', 'layout');
  const query = new URLSearchParams(
    result.status === 'saved'
      ? { contribution: result.contributionId }
      : { contributionError: result.status === 'invalid' ? Object.keys(result.errors).join(',') : result.status },
  );
  return seeOther(`/proposals/${segment}?${query}#contribute-title`);
}
