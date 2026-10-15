import { getBlogArticles } from "@/services/blog-service";
import Link from "next/link";
import { Metadata } from "next";
import BlogArticleCard from "@/components/blog/blog-article-card";

export const metadata: Metadata = {
  title: "Blog | Biblioteca de Zines",
  description: "Artigos e posts da Biblioteca de Zines no Substack",
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export default async function BlogPage() {
  const articles = await getBlogArticles();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-mono mb-6 text-center">
          Blog
        </h1>
        <div className="prose max-w-none text-center">
          <p className="text-sm mb-4 text-gray-600 font-mono">
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
        </div>
      </section>

      {/* Articles Grid */}
      {articles && articles.length > 0 ? (
        <section className="px-4 py-12 max-w-6xl mx-auto border-t border-gray-200">
          <div
            role="grid"
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            aria-live="polite"
          >
            {articles.map((article) => {
              const description = truncateText(
                stripHtml(article.description || "")
              );
              const formattedDate = formatDate(article.pubDate);

              return (
                <BlogArticleCard
                  key={article.link}
                  article={article}
                  formattedDate={formattedDate}
                  description={description}
                />
              );
            })}
          </div>
        </section>
      ) : (
        <section className="px-4 py-12 max-w-4xl mx-auto border-t border-gray-200 text-center">
          <p className="font-mono text-gray-600 mb-6">
            Nenhum artigo disponível no momento.
          </p>
          <Link
            href="https://bibliotecadezines.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm border border-black px-6 py-2 hover:bg-black hover:text-white transition-colors inline-block"
          >
            Visitar Substack
          </Link>
        </section>
      )}
    </div>
  );
}

