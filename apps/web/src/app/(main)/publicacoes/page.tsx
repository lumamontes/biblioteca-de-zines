import { getBlogArticles } from "@/services/blog-service";
import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleCard from "@/components/blog/blog-article-card";

export const metadata: Metadata = {
  title: "Publicações | Biblioteca de Zines",
  description: "Artigos e posts da Biblioteca de Zines no Substack.",
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

export default async function PublicacoesPage() {
  const articles = await getBlogArticles();

  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-6 text-center text-3xl font-mono">Publicações</h1>
        <p className="text-center text-sm text-gray-600 font-mono">
          Artigos e posts da Biblioteca de Zines. Leia mais no{" "}
          <Link
            href="https://bibliotecadezines.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Substack
          </Link>
          .
        </p>
      </section>

      {articles.length > 0 ? (
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 border-t border-gray-200 px-4 py-12 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <BlogArticleCard
              key={article.link}
              article={article}
              formattedDate={formatDate(article.pubDate)}
              description={truncateText(stripHtml(article.description || ""))}
            />
          ))}
        </section>
      ) : (
        <section className="mx-auto max-w-4xl border-t border-gray-200 px-4 py-12 text-center">
          <p className="mb-6 font-mono text-gray-600">
            Nenhuma publicação disponível no momento.
          </p>
          <Link
            href="https://bibliotecadezines.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-black px-6 py-2 font-mono text-sm transition-colors hover:bg-black hover:text-white"
          >
            Visitar Substack
          </Link>
        </section>
      )}
    </div>
  );
}
