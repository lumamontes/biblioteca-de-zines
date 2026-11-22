import { VoteIcon } from './vote-icon.component';
import Link from 'next/link';
import type { ProposalSummary } from '@/application/community-view.types';
import { countLabel, novidadeUrl } from './proposal-formatting.helpers';
import { UpvoteButton } from './upvote-button.component';

type ProposalNoteProps = {
  proposal: ProposalSummary;
  catalogueUrl: string;
  action: (formData: FormData) => Promise<void>;
};

export function ProposalNote({ proposal, catalogueUrl, action }: ProposalNoteProps) {
  const votingOpen = proposal.stage !== 'available' && proposal.stage !== 'not_planned' && proposal.stage !== 'archived';
  return (
    <li className="proposal-row">
      <h2 className="note__title">
        <Link href={proposal.path}>{proposal.title}</Link>
      </h2>
      <div className="note__foot">
        {votingOpen ? (
          <UpvoteButton
            proposalNumber={proposal.number}
            proposalPath={proposal.path}
            count={proposal.votes.support}
            pressed={proposal.viewerVoted}
            returnTo="/"
            action={action}
          />
        ) : (
          <span className="up up--static" aria-label={countLabel(proposal.votes.support, 'apoio', 'apoios')}><VoteIcon /> {proposal.votes.support}</span>
        )}
        <span className="note__meta">
          {proposal.stage === 'available' && proposal.updateSlug ? (
            <a href={novidadeUrl(catalogueUrl, proposal.updateSlug)}>✓ já está no ar</a>
          ) : proposal.stage === 'available' ? '✓ já está no ar' : proposal.stage === 'not_planned' ? 'não vamos seguir agora' : countLabel(proposal.contributionCount, 'comentário', 'comentários')}
        </span>
      </div>
    </li>
  );
}
