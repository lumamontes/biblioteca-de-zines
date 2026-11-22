import Link from 'next/link';
import type { ProposalOrder } from '@/application/participation-view.types';
import { ProposalCard } from '@/components/proposal/proposal-card.component';
import { getParticipationServer } from '@/composition/server/participation-server.service';

export const dynamic = 'force-dynamic';

type ListPageProps = { searchParams: Promise<{ order?: string }> };

export default async function ProposalListPage({ searchParams }: ListPageProps) {
  const { order: rawOrder } = await searchParams;
  const order: ProposalOrder = rawOrder === 'support' ? 'support' : 'recent';
  const { queries } = await getParticipationServer();
  const list = await queries.listProposals(order);

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">Participe</p>
        <h1 id="page-title" className="page-title">Ajude a decidir o que a Biblioteca faz em seguida</h1>
        <p className="lead">
          Vote, comente e acompanhe as respostas da equipe em cada proposta. Você não precisa ter conta no GitHub.
        </p>
        <p>
          <Link href="/suggest" className="button">Sugerir uma melhoria</Link>
        </p>
      </section>

      <div className="list-layout">
        <div className="stack">
          <nav className="order" aria-label="Ordenar propostas">
            <span>Ordenar:</span>
            <Link href="/" aria-current={order === 'recent' ? 'true' : undefined}>Mais recentes</Link>
            <Link href="/?order=support" aria-current={order === 'support' ? 'true' : undefined}>Mais apoio</Link>
          </nav>

          {list.featured.length > 0 ? (
            <section className="list-section" aria-labelledby="featured-title">
              <h2 id="featured-title" className="section-title">A equipe quer ouvir você</h2>
              <p className="list-section__hint note">Perguntas escolhidas pela equipe, porque uma decisão depende de quem usa a Biblioteca. Algumas têm poucos votos e são importantes mesmo assim.</p>
              <ul className="cards">
                {list.featured.map((proposal) => <li key={proposal.number}><ProposalCard proposal={proposal} /></li>)}
              </ul>
            </section>
          ) : null}

          <section className="list-section" aria-labelledby="suggestions-title">
            <h2 id="suggestions-title" className="section-title">Sugestões recentes</h2>
            {list.suggestions.length > 0 ? (
              <ul className="cards">
                {list.suggestions.map((proposal) => <li key={proposal.number}><ProposalCard proposal={proposal} /></li>)}
              </ul>
            ) : (
              <p className="empty">Nenhuma sugestão aguardando triagem. <Link href="/suggest">Que tal enviar a primeira?</Link></p>
            )}
          </section>

          {list.open.length > 0 ? (
            <section className="list-section" aria-labelledby="open-title">
              <h2 id="open-title" className="section-title">Em conversa</h2>
              <ul className="cards">
                {list.open.map((proposal) => <li key={proposal.number}><ProposalCard proposal={proposal} /></li>)}
              </ul>
            </section>
          ) : null}

          {list.decided.length > 0 ? (
            <section className="list-section" aria-labelledby="decided-title">
              <h2 id="decided-title" className="section-title">Decididas recentemente</h2>
              <ul className="cards">
                {list.decided.map((proposal) => <li key={proposal.number}><ProposalCard proposal={proposal} /></li>)}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="list-aside panel how" aria-labelledby="how-title">
          <h2 id="how-title" className="panel__title">Como funciona</h2>
          <ol>
            <li>Você sugere, vota ou comenta numa proposta.</li>
            <li>A equipe liga a proposta a uma issue do GitHub e responde lá. A resposta aparece aqui, no mesmo endereço.</li>
            <li>Quando a melhoria estiver no ar, a proposta mostra “Disponível na Biblioteca”.</li>
          </ol>
          <p className="note">Depois que uma proposta é ligada a uma issue, novos comentários e nomes de exibição ficam públicos no GitHub. O formulário avisa antes do envio.</p>
        </aside>
      </div>
    </>
  );
}
