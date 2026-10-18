import Link from "next/link";

export function UpdatesHeader({ technical }: { technical: boolean }) {
  return (
    <header className="mb-12">
      <h1 className="mb-4 text-3xl font-bold">
        {technical ? "Novidades para nerds" : "Novidades"}
      </h1>
      <p className="max-w-2xl leading-relaxed text-neutral-700">
        {technical
          ? "O changelog técnico da Biblioteca: cada entrada registra uma mudança relevante e aponta para sua origem no código."
          : "Uma linha do tempo das novidades publicadas no site: mudanças, atividades e coisas que compartilhamos com a comunidade."}
      </p>
      <nav aria-label="Visão das novidades" className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/novidades" className={!technical ? "font-bold underline" : "underline"}>
          Novidades
        </Link>
        <Link
          href="/novidades?view=nerds"
          className={technical ? "font-bold underline" : "underline"}
        >
          Novidades para nerds
        </Link>
      </nav>
    </header>
  );
}
