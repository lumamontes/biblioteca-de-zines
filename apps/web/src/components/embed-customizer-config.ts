import type { ReaderBranding } from '@biblioteca-de-zines/reader';

export function parseReaderBranding(value: string): ReaderBranding {
  return value === 'biblioteca' ? 'biblioteca' : 'none';
}
