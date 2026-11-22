import type { SuggestionFormState } from '@/components/suggestion/suggestion-form.types';
import { getCommunityServer } from './community-server.service';

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

/** Shared by the server action (with JavaScript) and the route handler (without it). */
export async function suggestFromForm(formData: FormData): Promise<SuggestionFormState> {
  const values = { title: text(formData, 'title'), report: text(formData, 'report'), displayName: text(formData, 'displayName') };
  if (formData.get('website')) return { status: 'error', message: 'Não foi possível enviar a ideia.', values };
  const { suggestions } = await getCommunityServer();
  const result = await suggestions.suggest(values);
  if (result.status === 'invalid') return { status: 'invalid', errors: result.errors, values };
  return { status: 'created', path: result.path };
}
