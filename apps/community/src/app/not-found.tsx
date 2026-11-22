import Link from 'next/link';

export default function NotFound() {
  return (
    <header className="header-block">
      <h1 className="title">Página não encontrada</h1>
      <p className="intro">O endereço pode estar incompleto.</p>
      <Link href="/" className="link">Voltar para a comunidade</Link>
    </header>
  );
}
