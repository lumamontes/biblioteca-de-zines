import Link from 'next/link';
import { ProposalRow } from '@/components/proposal/proposal-row.component';
import { getCommunityServer } from '@/composition/server/community-server.service';
import { LIST_TABS, type ListTab } from './proposal-list.config';

export const dynamic = 'force-dynamic';

type ListPageProps = { searchParams: Promise<{ tab?: string }> };

export default async function CommunityPage({ searchParams }: ListPageProps) {
  const { tab: rawTab } = await searchParams;
  const tab: ListTab = LIST_TABS.find((item) => item.id === rawTab)?.id ?? 'open';
  const { queries } = await getCommunityServer();
  const list = await queries.listProposals();
  const items = list[tab];
  const current = LIST_TABS.find((item) => item.id === tab)!;

  return (
    <>
      <header className="header-block">
        <h1 className="title">Comunidade</h1>
        <p className="intro">
          Ideias e perguntas para melhorar a Biblioteca de Zines. Vote, comente e acompanhe as respostas da equipe, sem precisar de conta no GitHub.
        </p>
        <Link href="/suggest" className="link">Sugerir uma melhoria</Link>
      </header>

      {list.highlight ? (
        <aside className="callout" aria-labelledby="highlight-title">
          <p className="eyebrow">A equipe quer ouvir você</p>
          <h2 id="highlight-title" className="callout__title">
            <Link href={list.highlight.path}>{list.highlight.title}</Link>
          </h2>
          <p className="text">{list.highlight.question}</p>
        </aside>
      ) : null}

      <nav className="tabs" aria-label="Propostas">
        {LIST_TABS.map((item) => (
          <Link key={item.id} href={item.id === 'open' ? '/' : `/?tab=${item.id}`} aria-current={item.id === tab ? 'page' : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>

      <section aria-label={current.label}>
        {items.length > 0 ? (
          <ul className="rows">
            {items.map((proposal) => <ProposalRow key={proposal.number} proposal={proposal} />)}
          </ul>
        ) : (
          <p className="empty">{current.empty}</p>
        )}
      </section>
    </>
  );
}
