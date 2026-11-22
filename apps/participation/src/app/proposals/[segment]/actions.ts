'use server';

import { revalidatePath } from 'next/cache';
import type { ContributionFormState } from '@/components/proposal/contribution-form.types';
import { contributeFromForm, voteFromForm } from '@/composition/server/proposal-commands.service';

export async function voteAction(formData: FormData): Promise<void> {
  await voteFromForm(formData);
  revalidatePath('/', 'layout');
}

export async function contributeAction(_previous: ContributionFormState, formData: FormData): Promise<ContributionFormState> {
  const result = await contributeFromForm(formData);
  revalidatePath('/', 'layout');
  return result;
}
