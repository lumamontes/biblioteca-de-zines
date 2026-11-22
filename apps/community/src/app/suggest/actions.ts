'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { SuggestionFormState } from '@/components/suggestion/suggestion-form.types';
import { getCommunityServer } from '@/composition/server/community-server.service';

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export async function suggestAction(_previous: SuggestionFormState, formData: FormData): Promise<SuggestionFormState> {
  const values = { title: text(formData, 'title'), report: text(formData, 'report'), displayName: text(formData, 'displayName') };
  if (formData.get('website')) return { status: 'error', message: 'Não foi possível enviar a sugestão.', values };
  const { suggestions } = await getCommunityServer();
  const result = await suggestions.suggest(values);
  if (result.status === 'invalid') return { status: 'invalid', errors: result.errors, values };
  revalidatePath('/', 'layout');
  redirect(result.path);
}
