import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { isSameOrigin, seeOther } from '../proposal-page.helpers';
import { voteFromForm } from '@/composition/server/proposal-commands.service';

/** Without JavaScript the vote form posts here; post/redirect/get keeps refreshes from voting again. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ segment: string }> }) {
  if (!isSameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const { segment } = await params;
  const formData = await request.formData();
  await voteFromForm(formData);
  revalidatePath('/', 'layout');
  // Votes cast from the board return to the board; everything else returns to the proposal.
  return seeOther(formData.get('returnTo') === '/' ? '/' : `/proposals/${segment}#votes`);
}
