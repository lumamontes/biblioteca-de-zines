import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { isSameOrigin, seeOther } from '../../proposals/[segment]/proposal-page.helpers';
import { suggestFromForm } from '@/composition/server/suggestion-commands.service';

/** Without JavaScript the idea form posts here and is redirected to the new proposal. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return new Response('Origem não permitida.', { status: 403 });
  const result = await suggestFromForm(await request.formData());
  if (result.status !== 'created') return seeOther('/suggest?incomplete=1');
  revalidatePath('/', 'layout');
  return seeOther(result.path);
}
