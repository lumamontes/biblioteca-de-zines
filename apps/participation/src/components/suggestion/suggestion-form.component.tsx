'use client';

import { useActionState } from 'react';
import { INITIAL_SUGGESTION_FORM_STATE } from './suggestion-form.config';
import type { SuggestionAction } from './suggestion-form.types';

export function SuggestionForm({ action }: { action: SuggestionAction }) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_SUGGESTION_FORM_STATE);
  const errors = state.status === 'invalid' ? state.errors : {};
  const values = state.status === 'idle' ? { title: '', report: '', displayName: '' } : state.values;

  return (
    <form action={formAction} className="contribute" noValidate>
      <div className="field field--trap" aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field">
        <label htmlFor="title">Título</label>
        <p id="title-hint" className="note">Uma frase curta. Por exemplo: “Filtrar zines pelo nome do coletivo”.</p>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={140}
          required
          defaultValue={values.title}
          key={`title-${values.title}`}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={['title-hint', errors.title ? 'title-error' : null].filter(Boolean).join(' ')}
        />
        {errors.title ? <p id="title-error" className="field__error">{errors.title}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="report">O que você precisa e por quê</label>
        <textarea
          id="report"
          name="report"
          rows={6}
          maxLength={4000}
          required
          defaultValue={values.report}
          key={`report-${values.report}`}
          aria-invalid={errors.report ? true : undefined}
          aria-describedby={errors.report ? 'report-error' : undefined}
        />
        {errors.report ? <p id="report-error" className="field__error">{errors.report}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="displayName">Nome de exibição <span className="field__hint">(pode ser um pseudônimo)</span></label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="nickname"
          maxLength={60}
          required
          defaultValue={values.displayName}
          key={`name-${values.displayName}`}
          aria-invalid={errors.displayName ? true : undefined}
          aria-describedby={errors.displayName ? 'displayName-error' : undefined}
        />
        {errors.displayName ? <p id="displayName-error" className="field__error">{errors.displayName}</p> : null}
      </div>

      <p id="suggestion-notice" className="notice">
        Sua sugestão e seu nome de exibição ficam públicos neste portal. Se a equipe ligar a sugestão a uma issue do GitHub, a issue terá um link para esta página.
      </p>

      <div className="contribute__actions">
        <button
          type="submit"
          className="button"
          aria-disabled={isPending || undefined}
          aria-describedby="suggestion-notice"
          onClick={(event) => {
            if (isPending) event.preventDefault();
          }}
        >
          Enviar sugestão
        </button>
      </div>

      <p role="status" aria-live="polite" className={`form-status${state.status === 'error' ? ' form-status--error' : ''}`}>
        {isPending
          ? 'Enviando sua sugestão…'
          : state.status === 'error'
            ? state.message
            : state.status === 'invalid'
              ? 'Confira os campos marcados.'
              : ''}
      </p>
    </form>
  );
}
