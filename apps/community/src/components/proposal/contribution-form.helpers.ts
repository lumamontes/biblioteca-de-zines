import { DISPLAY_NAME_STORAGE_KEY, DRAFT_STORAGE_PREFIX } from './proposal-text.config';
import type { ContributionDraft } from './contribution-form.types';

// Storage can be unavailable (private mode, blocked cookies). The form keeps working without it.

export function loadDraft(proposalNumber: number): ContributionDraft | null {
  try {
    const raw = window.localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${proposalNumber}`);
    return raw ? (JSON.parse(raw) as ContributionDraft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(proposalNumber: number, draft: ContributionDraft): void {
  try {
    window.localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${proposalNumber}`, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export function clearDraft(proposalNumber: number): void {
  try {
    window.localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${proposalNumber}`);
  } catch {
    /* ignore */
  }
}

export function loadDisplayName(): string {
  try {
    return window.localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveDisplayName(name: string): void {
  try {
    window.localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, name);
  } catch {
    /* ignore */
  }
}

export function newContributionId(): string {
  return crypto.randomUUID();
}
