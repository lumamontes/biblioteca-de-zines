import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleCard from "@/components/blog/blog-article-card";
import { PublicUpdate } from "@/components/updates/public-update";
import { getPublicUpdates } from "@/content/updates";
import { getBlogArticles } from "@/services/blog-service";

export const metadata: Metadata = {
  title: "Publicações | Biblioteca de Zines",
  description:
    "Novidades da Biblioteca de Zines e artigos publicados no Substack.",
};

function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function truncateText(text: string, maxLength = 150): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
}

export default async function PublicationsPage() {
  const [articles, updates] = await Promise.all([
    getBlogArticles(),
    Promise.resolve(getPublicUpdates()),
  ]);

  return (
    <main className="min-h-screen bg-white px-4 py-8 md:py-12">
      <div className="mx-auto max-w-screen-md">
        <header className="mb-12">
          <h1 className="mb-4 text-3xl font-bold">Publicações</h1>
          <p className="max-w-2xl leading-relaxed text-neutral-700">
            Novidades da Biblioteca, relatos de atividades e textos publicados
            no nosso Substack.
          </p>
        </header>

        <section aria-labelledby="updates-heading">
          <h2 id="updates-heading" className="mb-6 text-2xl font-bold">
            Novidades da Biblioteca
          </h2>
          <div>
            {updates.map((update) => (
              <PublicUpdate key={update.slug} update={update} />
            ))}
          </div>
        </section>

        <section
          aria-labelledby="articles-heading"
          className="mt-16 border-t border-neutral-200 pt-10"
        >
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="articles-heading" className="text-2xl font-bold">
              Textos
            </h2>
            <Link
              href="https://bibliotecadezines.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              Abrir Substack
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {articles.map((article) => (
                <BlogArticleCard
                  key={article.link}
                  article={article}
                  formattedDate={formatDate(article.pubDate)}
                  description={truncateText(stripHtml(article.description || ""))}
                />
              ))}
            </div>
          ) : (
            <p className="text-neutral-600">
              Nenhum texto disponível no momento.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
