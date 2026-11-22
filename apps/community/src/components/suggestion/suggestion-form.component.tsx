'use client';

import { useActionState } from 'react';
import { INITIAL_SUGGESTION_FORM_STATE } from './suggestion-form.config';
import type { SuggestionAction } from './suggestion-form.types';

export function SuggestionForm({ action }: { action: SuggestionAction }) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_SUGGESTION_FORM_STATE);
  const errors = state.status === 'invalid' ? state.errors : {};
  const values = state.status === 'idle' ? { title: '', report: '', displayName: '' } : state.values;

  return (
    <form action={formAction} className="form" noValidate>
      <div className="field field--trap" aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field">
        <label htmlFor="title">Sua ideia em uma frase</label>
        <p id="title-hint" className="muted">Por exemplo: “Encontrar todas as zines de um coletivo”.</p>
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
        <label htmlFor="report">Conte mais</label>
        <textarea
          id="report"
          name="report"
          rows={5}
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
        <label htmlFor="displayName">Seu nome <span className="field__hint">(pode ser apelido)</span></label>
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

      <p id="suggestion-notice" className="form__notice">
        Sua ideia e seu nome ficam públicos aqui.
      </p>

      <div className="form__actions">
        <button
          type="submit"
          className="button"
          aria-disabled={isPending || undefined}
          aria-describedby="suggestion-notice"
          onClick={(event) => {
            if (isPending) event.preventDefault();
          }}
        >
          ENVIAR :)
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
