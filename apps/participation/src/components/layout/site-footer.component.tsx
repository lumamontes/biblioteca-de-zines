export function SiteFooter({ catalogueUrl, repository }: { catalogueUrl: string; repository: string }) {
  return (
    <footer className="site-footer">
      <p>
        As decisões e o andamento das propostas são registrados no{' '}
        <a href={`https://github.com/${repository}`} className="external">repositório da Biblioteca no GitHub</a>.
        Votos e comentários feitos aqui não exigem conta no GitHub.
      </p>
      <p><a href={catalogueUrl}>Voltar ao catálogo da Biblioteca de Zines</a></p>
    </footer>
  );
}
