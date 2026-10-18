import Link from "next/link";
import type { Metadata } from "next";
import BlogArticleCard from "@/components/blog/blog-article-card";
import { PublicationsHub } from "@/components/publications/publications-hub";
import { ChangelogIntroduction } from "@/components/updates/changelog-introduction";
import { ChangelogSectionView } from "@/components/updates/changelog-section";
import { LatestUpdate } from "@/components/updates/latest-update";
import { PublicUpdate } from "@/components/updates/public-update";
import { getChangelog } from "@/content/changelog";
import { getPublicUpdates } from "@/content/updates";
import { getBlogArticles } from "@/services/blog-service";

export const metadata: Metadata = {
  title: "Publicações | Biblioteca de Zines",
  description:
    "Blog, novidades e changelog técnico da Biblioteca de Zines.",
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
  const changelog = getChangelog();
  const latestUpdate = updates[0];

  return (
    <main className="min-h-screen bg-white px-4 py-8 md:py-12">
      <div className="mx-auto max-w-screen-md">
        <header className="mb-10">
          <h1 className="mb-4 text-3xl font-bold">Publicações</h1>
          <p className="max-w-2xl leading-relaxed text-neutral-700">
            Um só lugar para acompanhar o blog, as novidades da Biblioteca e as
            mudanças técnicas do site.
          </p>
        </header>

        <PublicationsHub
          latestUpdate={
            latestUpdate ? <LatestUpdate update={latestUpdate} /> : null
          }
          blog={
            <>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-2xl font-bold">Blog</h2>
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <p className="text-neutral-600">Nenhum texto disponível no momento.</p>
              )}
            </>
          }
          updates={
            <>
              <h2 className="mb-6 text-2xl font-bold">Novidades</h2>
              {updates.map((update) => (
                <PublicUpdate key={update.slug} update={update} />
              ))}
            </>
          }
          nerds={
            <>
              <ChangelogIntroduction paragraphs={changelog.introduction} />
              {changelog.sections.map((section) => (
                <ChangelogSectionView key={section.title} section={section} />
              ))}
            </>
          }
        />
      </div>
    </main>
  );
}
