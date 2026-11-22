import { INPUT_LIMITS } from './input-validation.config';

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

function clean(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : '';
}

function validateDisplayName(name: string): string | undefined {
  if (!name) return 'Escreva um nome de exibição. Pode ser um pseudônimo.';
  if (name.length > INPUT_LIMITS.displayName) return `Use até ${INPUT_LIMITS.displayName} caracteres no nome de exibição.`;
  return undefined;
}

export function validateSuggestion(input: { title: unknown; report: unknown; displayName: unknown }) {
  const title = clean(input.title);
  const report = clean(input.report);
  const displayName = clean(input.displayName);
  const errors: FieldErrors<'title' | 'report' | 'displayName'> = {};
  if (title.length < INPUT_LIMITS.titleMin) errors.title = `Escreva um título com pelo menos ${INPUT_LIMITS.titleMin} caracteres.`;
  else if (title.length > INPUT_LIMITS.titleMax) errors.title = `Use até ${INPUT_LIMITS.titleMax} caracteres no título.`;
  if (!report) errors.report = 'Conte o que você precisa e por quê.';
  else if (report.length > INPUT_LIMITS.text) errors.report = `Use até ${INPUT_LIMITS.text} caracteres.`;
  const nameError = validateDisplayName(displayName);
  if (nameError) errors.displayName = nameError;
  return { values: { title, report, displayName }, errors };
}

export function validateContribution(input: { text: unknown; displayName: unknown }) {
  const text = clean(input.text);
  const displayName = clean(input.displayName);
  const errors: FieldErrors<'text' | 'displayName'> = {};
  if (!text) errors.text = 'Escreva seu comentário antes de enviar.';
  else if (text.length > INPUT_LIMITS.text) errors.text = `Use até ${INPUT_LIMITS.text} caracteres.`;
  const nameError = validateDisplayName(displayName);
  if (nameError) errors.displayName = nameError;
  return { values: { text, displayName }, errors };
}

export function isContributionId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
