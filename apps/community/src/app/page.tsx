import Link from 'next/link';
import { ProposalNote } from '@/components/proposal/proposal-note.component';
import { getCommunityServer } from '@/composition/server/community-server.service';
import { readVoterHash } from '@/composition/server/voter-session.service';
import { voteAction } from './proposals/[segment]/actions';

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
  const { queries, settings } = await getCommunityServer();
  const { notes } = await queries.listProposals(await readVoterHash());

  return (
    <div className="board">
      <header className="board__intro">
        <h1 className="title">Comunidade</h1>
        <p className="lead">Sugira, apoie e comente ideias para a Biblioteca de Zines.</p>
        <Link href="/suggest" className="link">Sugerir uma ideia</Link>
      </header>
      {notes.length > 0 ? (
        <ul className="mural">
          {notes.map((proposal) => <ProposalNote key={proposal.number} proposal={proposal} catalogueUrl={settings.catalogueUrl} action={voteAction} />)}
        </ul>
      ) : (
        <p className="lead">Ainda não há ideias por aqui. Que tal sugerir a primeira?</p>
      )}
    </div>
  );
}
