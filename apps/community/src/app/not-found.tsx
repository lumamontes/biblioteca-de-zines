import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="column">
      <h1 className="title">Página não encontrada</h1>
      <p className="lead">O endereço pode estar incompleto.</p>
      <Link href="/" className="link">Voltar para a comunidade</Link>
    </div>
  );
}
