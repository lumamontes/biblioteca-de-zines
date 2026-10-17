import type { Metadata } from "next";
import Link from "next/link";
import { createAuthorReader } from "@/composition/server/author-reader";
import { BreadcrumbStructuredData, WebsiteStructuredData } from "@/components/seo/structured-data";
import { siteConfig } from "@/app/config/site";

export const metadata: Metadata = {
  title: `Autores - ${siteConfig.name}`,
  description: "Conheça os autores dos zines publicados na Biblioteca de Zines.",
  alternates: {
    canonical: `${siteConfig.url}/authors`,
  },
  openGraph: {
    url: `${siteConfig.url}/authors`,
  },
};

function getAuthorInitial(name: string) {
  return name.trim().charAt(0).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

export default async function AuthorsPage() {
  const authors = await (await createAuthorReader()).getAll();
  const authorsByInitial = authors.reduce<Map<string, typeof authors>>((groups, author) => {
    const initial = getAuthorInitial(author.name);
    const group = groups.get(initial) || [];
    group.push(author);
    groups.set(initial, group);
    return groups;
  }, new Map());
  const authorGroups = Array.from(authorsByInitial.entries()).sort(([first], [second]) =>
    first.localeCompare(second, "pt-BR"),
  );
  const breadcrumbItems = [
    { name: "Início", url: siteConfig.url },
    { name: "Autores", url: `${siteConfig.url}/authors`, current: true },
  ];

  return (
    <main className="container mx-auto min-h-screen max-w-6xl px-4 py-8">
      <WebsiteStructuredData
        title={`Autores - ${siteConfig.name}`}
        description="Conheça os autores dos zines publicados na Biblioteca de Zines."
        url={`${siteConfig.url}/authors`}
      />
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <h1 className="mb-8 text-3xl font-bold">Autores</h1>
      {authors.length === 0 ? (
        <p>Não há autores publicados no momento.</p>
      ) : (
        <>
          <nav aria-label="Navegar por letra" className="mb-10 flex flex-wrap gap-2">
            {authorGroups.map(([initial]) => (
              <a
                key={initial}
                href={`#letter-${initial}`}
                className="border border-black px-3 py-1 text-sm font-medium transition hover:bg-neutral-100"
              >
                {initial}
              </a>
            ))}
          </nav>

          <div className="space-y-10">
            {authorGroups.map(([initial, groupedAuthors]) => (
              <section key={initial} id={`letter-${initial}`} className="scroll-mt-6">
                <h2 className="mb-4 border-b border-black pb-2 text-2xl font-bold">{initial}</h2>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedAuthors.map((author) => (
                    <li key={author.id}>
                      <Link
                        href={`/authors/${author.slug}`}
                        className="block border border-black p-4 transition hover:bg-neutral-100"
                      >
                        <span className="font-medium">{author.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
