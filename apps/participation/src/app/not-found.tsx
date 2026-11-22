import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="intro" aria-labelledby="page-title">
      <h1 id="page-title" className="page-title">Não encontramos esta página</h1>
      <p className="lead">O endereço pode estar incompleto. As propostas continuam na lista.</p>
      <p><Link href="/" className="button">Ver todas as propostas</Link></p>
    </section>
  );
}
