export type SuggestionFormState =
  | { status: 'idle' }
  | { status: 'invalid'; errors: Partial<Record<'title' | 'report' | 'displayName', string>>; values: { title: string; report: string; displayName: string } }
  | { status: 'error'; message: string; values: { title: string; report: string; displayName: string } }
  | { status: 'created'; path: string };

export type SuggestionAction = (state: SuggestionFormState, formData: FormData) => Promise<SuggestionFormState>;
