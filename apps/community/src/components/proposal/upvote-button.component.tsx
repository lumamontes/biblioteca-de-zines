import { ProgressiveForm } from './progressive-form.component';

type UpvoteButtonProps = {
  proposalNumber: number;
  proposalPath: string;
  count: number;
  pressed: boolean;
  /** Where the no-JavaScript fallback returns after voting. */
  returnTo: '/' | 'proposal';
  action: (formData: FormData) => Promise<void>;
};

/** One upvote; pressing it again withdraws it. Works without JavaScript. */
export function UpvoteButton({ proposalNumber, proposalPath, count, pressed, returnTo, action }: UpvoteButtonProps) {
  return (
    <ProgressiveForm fallbackAction={`${proposalPath}/vote`} action={action} className="upvote">
      <input type="hidden" name="proposalNumber" value={proposalNumber} />
      {returnTo === '/' ? <input type="hidden" name="returnTo" value="/" /> : null}
      <button type="submit" name="intent" value="support" className={`up${pressed ? ' up--on' : ''}`} aria-pressed={pressed}>
        <span aria-hidden="true">▲</span> {count}
        <span className="visually-hidden">{pressed ? ', você apoiou. Apoiar de novo retira o apoio.' : count === 1 ? ' apoio. Apoiar esta ideia' : ' apoios. Apoiar esta ideia'}</span>
      </button>
    </ProgressiveForm>
  );
}
