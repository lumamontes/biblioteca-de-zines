import { CATALOGUE_NAV_LINKS, SUGGEST_ZINE_PATH } from './site-header.config';

function NavLinks({ catalogueUrl }: { catalogueUrl: string }) {
  return (
    <ul>
      {CATALOGUE_NAV_LINKS.map((link) => (
        <li key={link.path}>
          <a href={`${catalogueUrl}${link.path}`}>{link.label}</a>
        </li>
      ))}
      <li>
        <a href={`${catalogueUrl}${SUGGEST_ZINE_PATH}`}>Sugerir Zine</a>
      </li>
    </ul>
  );
}

/** Mirrors the catalogue header so moving between the two feels like one site. */
export function SiteHeader({ catalogueUrl }: { catalogueUrl: string }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href={catalogueUrl || '/'} className="site-header__brand">Biblioteca de Zines</a>
        <nav className="site-nav site-nav--desktop" aria-label="Principal">
          <NavLinks catalogueUrl={catalogueUrl} />
        </nav>
        <details className="site-menu">
          <summary>Menu</summary>
          <nav className="site-nav" aria-label="Principal">
            <NavLinks catalogueUrl={catalogueUrl} />
          </nav>
        </details>
      </div>
    </header>
  );
}
