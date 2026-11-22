import { randomUUID } from 'node:crypto';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { STAGE_LABEL } from '@/domain/stage.config';
import { isDecidedStage } from '@/domain/stage.service';
import { parseProposalSegment } from '@/domain/proposal-path.helpers';
import { ContributionForm } from '@/components/proposal/contribution-form.component';
import { ContributionList } from '@/components/proposal/contribution-list.component';
import { OfficialResponseBlock } from '@/components/proposal/official-response.component';
import { formatDate, formatDateTime, paragraphs } from '@/components/proposal/proposal-formatting.helpers';
import { TechnicalDetails } from '@/components/proposal/technical-details.component';
import { VoteControls } from '@/components/proposal/vote-controls.component';
import { getCommunityServer } from '@/composition/server/community-server.service';
import { readVoterHash } from '@/composition/server/voter-session.service';
import { contributeAction, voteAction } from './actions';
import { contributionResultFromQuery } from './proposal-page.helpers';

export const dynamic = 'force-dynamic';

type ProposalPageProps = {
  params: Promise<{ segment: string }>;
  searchParams: Promise<{ contribution?: string; contributionError?: string }>;
};

async function loadProposal(segment: string, voterHash: string | null) {
  const number = parseProposalSegment(segment);
  if (number === null) notFound();
  const { queries } = await getCommunityServer();
  const proposal = await queries.getProposal(number, voterHash);
  if (!proposal) notFound();
  return proposal;
}

export async function generateMetadata({ params }: ProposalPageProps): Promise<Metadata> {
  // Metadata never reads the voter cookie: it is the same for everyone.
  const proposal = await loadProposal((await params).segment, null);
  return { title: proposal.title, description: proposal.question.slice(0, 160) };
}

export default async function ProposalPage({ params, searchParams }: ProposalPageProps) {
  const { segment } = await params;
  const query = await searchParams;
  const proposal = await loadProposal(segment, await readVoterHash());
  // Shared links keep working after a title change: any slug resolves by number.
  if (`/proposals/${segment}` !== proposal.canonicalPath) {
    const search = new URLSearchParams(Object.entries(query).filter((entry): entry is [string, string] => typeof entry[1] === 'string')).toString();
    permanentRedirect(search ? `${proposal.canonicalPath}?${search}` : proposal.canonicalPath);
  }
  const noScriptResult = contributionResultFromQuery(proposal, query);

  const decided = isDecidedStage(proposal.stage) && proposal.decision !== null;
  const origin = proposal.origin === 'community' && proposal.originalReport
    ? `Sugestão de ${proposal.originalReport.displayName}`
    : 'Pergunta da equipe';

  return (
    <>
      <Link href="/" className="back">← Comunidade</Link>

      <header>
        <p className="eyebrow">{STAGE_LABEL[proposal.stage]} · {origin}</p>
        <h1 className="title">{proposal.title}</h1>
      </header>

      {decided && proposal.decision ? (
        <OfficialResponseBlock response={proposal.decision.response} text={proposal.decision.justification}>
          {proposal.decision.nextSteps ? (
            <>
              <p className="eyebrow callout__subhead">Próximos passos</p>
              {paragraphs(proposal.decision.nextSteps).map((paragraph, index) => <p key={index} className="text">{paragraph}</p>)}
            </>
          ) : null}
        </OfficialResponseBlock>
      ) : null}

      <div className={decided ? 'section' : undefined}>
        {decided ? <h2 className="section-title">A pergunta</h2> : null}
        {paragraphs(proposal.question).map((paragraph, index) => <p key={index} className="text">{paragraph}</p>)}
      </div>

      {proposal.openDecision && !decided ? (
        <div className="callout section-sm">
          <p className="eyebrow">O que está em aberto</p>
          <p className="text">{proposal.openDecision}</p>
        </div>
      ) : null}

      {proposal.awaitingRelease ? <p className="muted section-sm">A equipe concluiu esta melhoria. Ela aparece como disponível quando estiver no ar.</p> : null}
      {proposal.release && proposal.stage === 'available' ? (
        <p className="muted section-sm">No ar desde <time dateTime={proposal.release.confirmedAt}>{formatDate(proposal.release.confirmedAt)}</time>.</p>
      ) : null}
      {!proposal.presentedByTeam ? <p className="muted section-sm">A equipe deixou de apresentar esta pergunta. O histórico continua aqui.</p> : null}
      {proposal.archiveReason ? <p className="muted section-sm">Arquivada: {proposal.archiveReason}</p> : null}
      {proposal.stale && proposal.syncedAt ? (
        <p className="muted section-sm">Atualizado com o GitHub em {formatDateTime(proposal.syncedAt)}.</p>
      ) : null}

      <VoteControls
        proposalNumber={proposal.number}
        returnPath={proposal.canonicalPath}
        support={proposal.votes.support}
        oppose={proposal.votes.oppose}
        viewerVote={proposal.viewerVote}
        open={proposal.votingOpen}
        action={voteAction}
      />

      {proposal.responses.length > 0 ? (
        <section className="section" aria-labelledby="responses-title">
          <h2 id="responses-title" className="section-title">Respostas da equipe</h2>
          {proposal.responses.map((response) => <OfficialResponseBlock key={response.githubCommentId} response={response} />)}
        </section>
      ) : null}

      <section className="section" aria-labelledby="conversation-title">
        <h2 id="conversation-title" className="section-title">Conversa</h2>
        <ContributionList contributions={proposal.contributions} />
      </section>

      {proposal.contributionOpen ? (
        <section className="section" aria-labelledby="contribute-title">
          <h2 id="contribute-title" className="section-title">Comentar</h2>
          <ContributionForm
            proposalNumber={proposal.number}
            fallbackAction={`${proposal.canonicalPath}/contribute`}
            initialState={noScriptResult.state}
            initialText={noScriptResult.text}
            initialDisplayName={noScriptResult.displayName}
            issueNumber={proposal.principalIssue?.number ?? null}
            initialContributionId={noScriptResult.contributionId ?? randomUUID()}
            action={contributeAction}
          />
        </section>
      ) : null}

      <TechnicalDetails proposal={proposal} />
    </>
  );
}
