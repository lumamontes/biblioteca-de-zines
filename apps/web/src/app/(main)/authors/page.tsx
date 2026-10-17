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

export default async function AuthorsPage() {
  const authors = await (await createAuthorReader()).getAll();
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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
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
      )}
    </main>
  );
}
