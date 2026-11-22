import type { Metadata } from 'next';
import Link from 'next/link';
import { SuggestionForm } from '@/components/suggestion/suggestion-form.component';
import { suggestAction } from './actions';

export const metadata: Metadata = { title: 'Sugerir uma melhoria' };

export default function SuggestPage() {
  return (
    <>
      <Link href="/" className="back">← Todas as propostas</Link>
      <section className="intro" aria-labelledby="page-title">
        <h1 id="page-title" className="page-title">Sugerir uma melhoria</h1>
        <p className="lead">
          Conte o que você precisa na Biblioteca. A equipe lê todas as sugestões e responde no endereço da sugestão, que você pode guardar e compartilhar.
        </p>
      </section>
      <SuggestionForm action={suggestAction} />
    </>
  );
}
