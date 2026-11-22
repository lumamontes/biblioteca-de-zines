import Link from 'next/link';
import type { ProposalSummary } from '@/application/community-view.types';
import { countLabel, voteSummary } from './proposal-formatting.helpers';
import { StageBadge } from './stage-badge.component';

export function ProposalCard({ proposal, headingLevel = 3 }: { proposal: ProposalSummary; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const noVotes = proposal.votes.support === 0 && proposal.votes.oppose === 0;
  return (
    <article className="card">
      <p className="card__meta">
        <StageBadge stage={proposal.stage} />
        {proposal.origin === 'community' ? <span className="tag">Sugestão da comunidade</span> : null}
      </p>
      <Heading className="card__title">
        <Link href={proposal.path} className="card__link">{proposal.title}</Link>
      </Heading>
      <p className="card__facts">
        <span className={noVotes ? 'card__invite' : undefined}>{noVotes ? 'Ainda sem votos: sua opinião conta' : voteSummary(proposal.votes.support, proposal.votes.oppose)}</span>
        <span aria-hidden="true"> · </span>
        <span>{countLabel(proposal.contributionCount, 'contribuição', 'contribuições')}</span>
        {proposal.hasOfficialResponse ? (
          <>
            <span aria-hidden="true"> · </span>
            <span>com resposta da equipe</span>
          </>
        ) : null}
      </p>
    </article>
  );
}
