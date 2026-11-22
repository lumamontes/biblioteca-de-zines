'use client';

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { INITIAL_CONTRIBUTION_FORM_STATE } from './contribution-form.config';
import {
  clearDraft,
  loadDisplayName,
  loadDraft,
  newContributionId,
  saveDisplayName,
  saveDraft,
} from './contribution-form.helpers';
import type { ContributionAction, ContributionFormState } from './contribution-form.types';

type ContributionFormProps = {
  proposalNumber: number;
  /** Route handler used when JavaScript is unavailable. */
  fallbackAction: string;
  /** Result of a submission made without JavaScript, read back from the page address. */
  initialState?: ContributionFormState;
  initialText?: string;
  initialDisplayName?: string;
  issueNumber: number | null;
  /** Generated on the server so the form also works without JavaScript. */
  initialContributionId: string;
  action: ContributionAction;
};

export function ContributionForm({ proposalNumber, fallbackAction, initialState, initialText = '', initialDisplayName = '', issueNumber, initialContributionId, action }: ContributionFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState ?? INITIAL_CONTRIBUTION_FORM_STATE);
  const [contributionId, setContributionId] = useState(initialContributionId);
  const [text, setText] = useState(initialText);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const handledResult = useRef<ContributionFormState | null>(null);

  useEffect(() => {
    const draft = loadDraft(proposalNumber);
    if (draft) {
      setContributionId(draft.contributionId);
      setText(draft.text);
    }
    const storedName = loadDisplayName();
    if (storedName) setDisplayName(storedName);
  }, [proposalNumber]);

  useEffect(() => {
    if (state === handledResult.current || state.status !== 'saved') return;
    handledResult.current = state;
    if (state.delivery === 'failed') return; // Keep text and key: a retry reuses the same contribution.
    clearDraft(proposalNumber);
    setText('');
    setContributionId(newContributionId());
  }, [state, proposalNumber]);

  const failed = state.status === 'saved' && state.delivery === 'failed';
  const errors = state.status === 'invalid' ? state.errors : {};
  const statusMessage = isPending
    ? 'Enviando seu comentário…'
    : state.status === 'saved' || state.status === 'closed' || state.status === 'error'
      ? state.message
      : '';

  return (
    <form
      action={fallbackAction}
      method="post"
      className="contribute"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (isPending) return;
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
    >
      <input type="hidden" name="proposalNumber" value={proposalNumber} />
      <input type="hidden" name="contributionId" value={contributionId} />
      <div className="field field--trap" aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p id="publication-notice" className="notice">
        {issueNumber
          ? <>Seu comentário e seu nome de exibição serão publicados na <strong>issue #{issueNumber} do GitHub</strong>, que é pública. Não inclua dados pessoais.</>
          : <>Seu comentário e seu nome de exibição ficam públicos neste portal. Se a equipe ligar esta sugestão a uma issue do GitHub, os próximos comentários serão publicados lá.</>}
      </p>

      <div className="field">
        <label htmlFor="displayName">Nome de exibição <span className="field__hint">(pode ser um pseudônimo)</span></label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="nickname"
          maxLength={60}
          required
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value);
            saveDisplayName(event.target.value);
          }}
          aria-invalid={errors.displayName ? true : undefined}
          aria-describedby={errors.displayName ? 'displayName-error' : undefined}
        />
        {errors.displayName ? <p id="displayName-error" className="field__error">{errors.displayName}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="text">Seu comentário</label>
        <textarea
          id="text"
          name="text"
          rows={5}
          maxLength={4000}
          required
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            saveDraft(proposalNumber, { contributionId, text: event.target.value });
          }}
          aria-invalid={errors.text ? true : undefined}
          aria-describedby={['publication-notice', errors.text ? 'text-error' : null].filter(Boolean).join(' ')}
        />
        {errors.text ? <p id="text-error" className="field__error">{errors.text}</p> : null}
      </div>

      <div className="contribute__actions">
        <button
          type="submit"
          className="button"
          aria-disabled={isPending || undefined}
          aria-describedby="publication-notice"
        >
          {failed ? 'Tentar de novo' : 'Enviar comentário'}
        </button>
      </div>

      <p role="status" aria-live="polite" className={`form-status${failed ? ' form-status--error' : ''}`}>
        {statusMessage}
        {state.status === 'saved' && state.delivery === 'sent' && state.githubUrl ? (
          <> <a href={state.githubUrl} className="external">Ver no GitHub</a></>
        ) : null}
      </p>
    </form>
  );
}
