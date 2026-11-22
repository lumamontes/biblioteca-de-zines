import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { isSameOrigin, seeOther } from '../proposal-page.helpers';
import { voteFromForm } from '@/composition/server/proposal-commands.service';

/** Without JavaScript the vote form posts here; post/redirect/get keeps refreshes from voting again. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ segment: string }> }) {
  if (!isSameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const { segment } = await params;
  await voteFromForm(await request.formData());
  revalidatePath('/', 'layout');
  return seeOther(`/proposals/${segment}#votes-title`);
}
