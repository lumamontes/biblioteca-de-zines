import Link from "next/link";

export function ChangelogIntroduction() {
  return (
    <div className="mb-10 border-l-4 border-neutral-900 bg-neutral-50 p-5 text-neutral-700">
      <h2 className="mb-3 text-xl font-bold text-neutral-950">
        Novidades para nerds
      </h2>
      <p className="mb-3 leading-relaxed">
        Este é o changelog técnico da Biblioteca: um registro das mudanças
        relevantes no sistema, escrito para pessoas que usam, mantêm ou estudam
        o projeto. Ele explica o que mudou e por que isso importa, em vez de
        repetir o histórico bruto de commits.
      </p>
      <p className="leading-relaxed">
        O formato segue o{" "}
        <Link
          href="https://keepachangelog.com/en/1.1.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:bg-blue-50 hover:text-blue-900"
        >
          Keep a Changelog
        </Link>
        : as entradas são agrupadas por mudança, usam categorias como
        Adicionado, Alterado e Corrigido, e ficam marcadas com a data em que
        chegaram à `main`. O que ainda está em desenvolvimento aparece em
        Não publicado.
      </p>
    </div>
  );
}
