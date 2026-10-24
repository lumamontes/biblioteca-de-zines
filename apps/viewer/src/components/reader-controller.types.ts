import type { PublicReaderZine } from '@biblioteca-de-zines/reader';
import type { ReaderDeliveryMode, ReaderViewMode } from '@/application/reader-types';

export type ReaderControllerInput = {
  mode: ReaderViewMode;
  page: number;
  slug: string;
  surface: ReaderDeliveryMode;
};

export type ReaderControllerState = {
  publication?: PublicReaderZine;
  fallback: { label: string; url: string };
  state: 'loading' | 'ready' | 'fallback';
};

export type ReaderControllerResult = ReaderControllerState & {
  target: React.RefObject<HTMLDivElement | null>;
};
