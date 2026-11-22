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
import { formatDate, formatDateTime, noteColor, novidadeUrl, paragraphs } from '@/components/proposal/proposal-formatting.helpers';
import { TechnicalDetails } from '@/components/proposal/technical-details.component';
import { UpvoteButton } from '@/components/proposal/upvote-button.component';
import { getCommunityServer } from '@/composition/server/community-server.service';
import { readVoterHash } from '@/composition/server/voter-session.service';
import { contributeAction, voteAction } from './actions';
import { contributionResultFromQuery } from './proposal-page.helpers';
import { withBasePath } from '@/app/base-path.helpers';

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
  const { settings: catalogueSettings } = await getCommunityServer();

  const decided = isDecidedStage(proposal.stage) && proposal.decision !== null;

  return (
    <div className="column">
      <Link href="/" className="back">← Comunidade</Link>

      <article className={`note note--${noteColor(proposal)} note--wide note--lead`}>
        <h1 className="note__heading">{proposal.title}</h1>
        {paragraphs(proposal.question).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        {proposal.openDecision && !decided ? (
          <p><strong>Ainda estamos decidindo:</strong> {proposal.openDecision}</p>
        ) : null}
        {proposal.originalReport && proposal.origin === 'community' ? (
          <p className="note__byline">sugerida por {proposal.originalReport.displayName}</p>
        ) : null}
      </article>

      <div className="votes" id="votes">
        {proposal.votingOpen ? (
          <>
            <UpvoteButton
              proposalNumber={proposal.number}
              proposalPath={proposal.canonicalPath}
              count={proposal.votes.support}
              pressed={proposal.viewerVote === 1}
              returnTo="proposal"
              action={voteAction}
            />
            <span className="muted">{proposal.viewerVote === 1 ? 'Você apoiou. Toque de novo para retirar.' : 'Apoie se você também quer isso.'}</span>
          </>
        ) : (
          <span className="muted">▲ {proposal.votes.support} · {STAGE_LABEL[proposal.stage].toLowerCase()}</span>
        )}
      </div>

      {proposal.awaitingRelease ? <p className="muted">Pronto! Aparece como disponível assim que estiver no ar.</p> : null}
      {proposal.release && proposal.stage === 'available' ? (
        <p className="muted">
          ✓ No ar desde <time dateTime={proposal.release.confirmedAt}>{formatDate(proposal.release.confirmedAt)}</time>.
          {proposal.updateSlug ? <> <a href={novidadeUrl(catalogueSettings.catalogueUrl, proposal.updateSlug)}>Ler a novidade</a></> : null}
        </p>
      ) : null}
      {proposal.archiveReason ? <p className="muted">Arquivada: {proposal.archiveReason}</p> : null}
      {!proposal.presentedByTeam ? <p className="muted">A equipe deixou de apresentar esta pergunta. O histórico continua aqui.</p> : null}
      {proposal.stale && proposal.syncedAt ? <p className="muted">Atualizado com o GitHub em {formatDateTime(proposal.syncedAt)}.</p> : null}

      {proposal.decision || proposal.responses.length > 0 ? (
        <section aria-labelledby="responses-title">
          <h2 id="responses-title" className="section-title">A Biblioteca de Zines respondeu</h2>
          <div className="responses">
            {decided && proposal.decision ? (
              <OfficialResponseBlock response={proposal.decision.response} text={proposal.decision.justification} color="green">
                {proposal.decision.nextSteps ? <p><strong>Próximos passos:</strong> {proposal.decision.nextSteps}</p> : null}
              </OfficialResponseBlock>
            ) : null}
            {proposal.responses.map((response) => <OfficialResponseBlock key={response.githubCommentId} response={response} />)}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="conversation-title">
        <h2 id="conversation-title" className="section-title">Comentários ({proposal.contributionCount})</h2>
        <ContributionList contributions={proposal.contributions} />
      </section>

      {proposal.contributionOpen ? (
        <section aria-labelledby="contribute-title">
          <h2 id="contribute-title" className="section-title">Comentar</h2>
          <ContributionForm
            proposalNumber={proposal.number}
            fallbackAction={withBasePath(`${proposal.canonicalPath}/contribute`)}
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
    </div>
  );
}
