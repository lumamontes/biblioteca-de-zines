import type { Metadata } from 'next';
import Link from 'next/link';
import { SuggestionForm } from '@/components/suggestion/suggestion-form.component';
import { suggestAction } from './actions';

export const metadata: Metadata = { title: 'Sugerir uma ideia' };

export default function SuggestPage() {
  return (
    <div className="column">
      <Link href="/" className="back">← Comunidade</Link>
      <h1 className="title">Sugerir uma ideia</h1>
      <p className="lead">O que você gostaria de ver na Biblioteca de Zines? A equipe lê todas as ideias e responde na página da sua ideia.</p>
      <SuggestionForm action={suggestAction} />
    </div>
  );
}
