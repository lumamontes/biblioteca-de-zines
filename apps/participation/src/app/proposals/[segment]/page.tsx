import { randomUUID } from 'node:crypto';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { STAGE_TEXT } from '@/domain/stage.config';
import { isDecidedStage } from '@/domain/stage.service';
import { parseProposalSegment } from '@/domain/proposal-path.helpers';
import { ContributionForm } from '@/components/proposal/contribution-form.component';
import { ContributionList } from '@/components/proposal/contribution-list.component';
import { OfficialResponseBlock } from '@/components/proposal/official-response.component';
import { formatDate, formatDateTime, paragraphs } from '@/components/proposal/proposal-formatting.helpers';
import { StageBadge } from '@/components/proposal/stage-badge.component';
import { TechnicalDetails } from '@/components/proposal/technical-details.component';
import { VoteControls } from '@/components/proposal/vote-controls.component';
import { getParticipationServer } from '@/composition/server/participation-server.service';
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
  const { queries } = await getParticipationServer();
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
  const question = (
    <section className="area-question proposal-head" aria-label="Pergunta">
      {decided ? <h2 className="section-title">A pergunta</h2> : null}
      <div className="prose lead">
        {paragraphs(proposal.question).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
      {proposal.originalReport && proposal.origin === 'community' ? (
        <p className="note">Sugerida por <strong>{proposal.originalReport.displayName}</strong> em <time dateTime={proposal.originalReport.submittedAt}>{formatDate(proposal.originalReport.submittedAt)}</time>.</p>
      ) : null}
      {proposal.openDecision && !decided ? (
        <div className="open-decision">
          <p className="open-decision__label">O que está em aberto</p>
          <p>{proposal.openDecision}</p>
        </div>
      ) : null}
      {proposal.questionRevisions.length > 0 ? (
        <p className="note">Pergunta atualizada pela equipe em {formatDate(proposal.questionRevisions[proposal.questionRevisions.length - 1].replacedAt)}.</p>
      ) : null}
    </section>
  );

  return (
    <>
      <Link href="/" className="back">← Todas as propostas</Link>
      <div className="proposal-layout">
        <header className="area-head proposal-head">
          <p><StageBadge stage={proposal.stage} /></p>
          <h1 className="page-title">{proposal.title}</h1>
          <p className="note">{STAGE_TEXT[proposal.stage].description}</p>
          {proposal.awaitingRelease ? <p className="callout">A equipe concluiu esta melhoria no GitHub. Ela aparece como disponível quando a liberação for confirmada.</p> : null}
          {proposal.release && proposal.stage === 'available' ? (
            <p className="callout">Disponível na Biblioteca desde <time dateTime={proposal.release.confirmedAt}>{formatDate(proposal.release.confirmedAt)}</time>.</p>
          ) : null}
          {proposal.archiveReason ? <p className="callout"><strong>Por que foi arquivada:</strong> {proposal.archiveReason}</p> : null}
          {!proposal.presentedByTeam ? <p className="callout">A equipe deixou de apresentar esta pergunta. O histórico continua disponível.</p> : null}
          {proposal.stale && proposal.syncedAt ? (
            <p className="callout">Atualizado com o GitHub em {formatDateTime(proposal.syncedAt)}. Pode haver novidades que ainda não chegaram aqui.</p>
          ) : null}
        </header>

        {decided && proposal.decision ? (
          <section className="area-decision" aria-labelledby="decision-title">
            <h2 id="decision-title" className="section-title">Resultado</h2>
            <OfficialResponseBlock response={proposal.decision.response} text={proposal.decision.justification}>
              {proposal.decision.nextSteps ? (
                <div className="prose">
                  <h3>Próximos passos</h3>
                  {paragraphs(proposal.decision.nextSteps).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                </div>
              ) : null}
            </OfficialResponseBlock>
          </section>
        ) : null}

        {question}

        <div className="area-votes">
          <VoteControls
            proposalNumber={proposal.number}
            returnPath={proposal.canonicalPath}
            support={proposal.votes.support}
            oppose={proposal.votes.oppose}
            viewerVote={proposal.viewerVote}
            open={proposal.votingOpen}
            action={voteAction}
          />
        </div>

        {proposal.decision && proposal.responses.length === 0 ? null : (
          <section className="area-responses" aria-labelledby="responses-title">
            <h2 id="responses-title" className="section-title">{proposal.decision ? 'Outras respostas da equipe' : 'Resposta da equipe'}</h2>
            {proposal.responses.length > 0 ? (
              <div className="responses">
                {proposal.responses.map((response) => <OfficialResponseBlock key={response.githubCommentId} response={response} />)}
              </div>
            ) : (
              <p className="empty">
                {proposal.principalIssue
                  ? 'A equipe ainda não respondeu. Quando responder, a resposta aparece aqui, com autoria e link.'
                  : 'A equipe ainda vai ler esta sugestão e ligá-la a uma issue antes da primeira resposta.'}
              </p>
            )}
          </section>
        )}

        <section className="area-conversation" aria-labelledby="conversation-title">
          <h2 id="conversation-title" className="section-title">Conversa ({proposal.contributionCount})</h2>
          <ContributionList contributions={proposal.contributions} />
        </section>

        <section className="area-contribute" aria-labelledby="contribute-title">
          <h2 id="contribute-title" className="section-title">Contribuir</h2>
          {proposal.contributionOpen ? (
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
          ) : (
            <p className="empty">Esta sugestão foi arquivada e não recebe novos comentários.</p>
          )}
        </section>

        <div className="area-details">
          <TechnicalDetails proposal={proposal} />
        </div>
      </div>
    </>
  );
}
