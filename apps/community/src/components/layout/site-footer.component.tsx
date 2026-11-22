export function SiteFooter({ repository, demo }: { repository: string; demo: boolean }) {
  return (
    <footer className="site-footer">
      <p>
        As decisões da equipe ficam registradas no <a className="link" href={`https://github.com/${repository}`}>GitHub</a>.
        Para votar e comentar aqui, você não precisa de conta.
      </p>
      {demo ? <p>Versão de teste: o GitHub é simulado e os dados são exemplos.</p> : null}
    </footer>
  );
}
