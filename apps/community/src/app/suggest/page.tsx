import type { Metadata } from 'next';
import Link from 'next/link';
import { SuggestionForm } from '@/components/suggestion/suggestion-form.component';
import { suggestAction } from './actions';

export const metadata: Metadata = { title: 'Sugerir uma melhoria' };

export default function SuggestPage() {
  return (
    <>
      <Link href="/" className="back">← Comunidade</Link>
      <header className="header-block">
        <h1 className="title">Sugerir uma melhoria</h1>
        <p className="intro">
          O que você gostaria de ver na Biblioteca de Zines? A equipe lê todas as sugestões e responde no endereço da sua sugestão.
        </p>
      </header>
      <SuggestionForm action={suggestAction} />
    </>
  );
}
