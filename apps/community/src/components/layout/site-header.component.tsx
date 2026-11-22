import Link from 'next/link';

export function SiteHeader({ catalogueUrl }: { catalogueUrl: string }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <p className="site-header__brand">
          <a href={catalogueUrl}>Biblioteca de Zines</a>
          <span className="site-header__section">Participe</span>
        </p>
        <nav aria-label="Portal da comunidade">
          <ul className="site-header__nav">
            <li><Link href="/">Propostas</Link></li>
            <li><Link href="/suggest">Sugerir</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
