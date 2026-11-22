import Link from 'next/link';
import type { ProposalSummary } from '@/application/community-view.types';
import { summaryLine } from './proposal-formatting.helpers';

export function ProposalRow({ proposal }: { proposal: ProposalSummary }) {
  return (
    <li className="row">
      <h3 className="row__title">
        <Link href={proposal.path}>{proposal.title}</Link>
      </h3>
      <p className="muted">{summaryLine(proposal)}</p>
    </li>
  );
}
