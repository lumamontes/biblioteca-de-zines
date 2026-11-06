import type { ReaderControllerState } from './reader-controller.types';

export const READER_API_ORIGIN = process.env.NEXT_PUBLIC_READER_API_ORIGIN ?? 'https://www.biblioteca-de-zines.com.br';
export const DEFAULT_READER_FALLBACK = { label: 'Abrir a publicação', url: '' };
export const INITIAL_READER_STATE: ReaderControllerState = {
  fallback: DEFAULT_READER_FALLBACK,
  state: 'loading',
};
