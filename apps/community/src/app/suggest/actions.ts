'use server';

import { revalidatePath } from 'next/cache';
import type { SuggestionFormState } from '@/components/suggestion/suggestion-form.types';
import { suggestFromForm } from '@/composition/server/suggestion-commands.service';

/** Returns the new proposal's path; the form navigates there, so the base path is applied by the router. */
export async function suggestAction(_previous: SuggestionFormState, formData: FormData): Promise<SuggestionFormState> {
  const result = await suggestFromForm(formData);
  if (result.status === 'created') revalidatePath('/', 'layout');
  return result;
}
