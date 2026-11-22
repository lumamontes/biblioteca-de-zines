import Link from 'next/link';

export function SiteHeader({ catalogueUrl }: { catalogueUrl: string }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-header__brand">Mural da comunidade</Link>
        <a href={catalogueUrl || 'https://www.biblioteca-de-zines.com.br/'} className="site-header__catalogue">Biblioteca de Zines</a>
      </div>
    </header>
  );
}
