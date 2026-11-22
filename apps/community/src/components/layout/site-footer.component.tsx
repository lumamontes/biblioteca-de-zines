export function SiteFooter({ repository, demo }: { repository: string; demo: boolean }) {
  return (
    <footer className="site-footer">
      <p>
        As decisões da equipe ficam registradas no <a className="link" href={`https://github.com/${repository}`}>GitHub</a>.
        {demo ? null : ' Para apoiar e comentar aqui, você não precisa de conta.'}
      </p>
      {demo ? <p>Versão de teste. Votos e sugestões feitos aqui são temporários. As conversas públicas acontecem nas issues do GitHub.</p> : null}
    </footer>
  );
}
