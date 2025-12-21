import Link from "next/link";
import { BlogArticle } from "@/@types/blog";
import BlogArticleImage from "./blog-article-image";

interface BlogArticleCardProps {
  article: BlogArticle;
  formattedDate: string;
  description: string;
}

export default function BlogArticleCard({
  article,
  formattedDate,
  description,
}: BlogArticleCardProps) {
  return (
    <article
      className="flex flex-col justify-between bg-white rounded-lg overflow-hidden shadow-sm h-full hover:shadow-md transition-shadow"
    >
      <Link
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col h-full"
      >
        {/* Image - Only this part is a client component */}
        {article.image && <BlogArticleImage src={article.image} alt={article.title} />}

        {/* Content */}
        <div className="flex flex-col p-4 flex-grow">
          <h2 className="text-lg font-medium mb-2 line-clamp-2">
            {article.title}
          </h2>
          <time
            dateTime={article.pubDate}
            className="text-xs text-gray-500 mb-2"
          >
            {formattedDate}
          </time>
          {description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">
              {description}
            </p>
          )}
        </div>

        {/* Link indicator */}
        <div className="px-4 pb-4">
          <span className="text-xs text-blue-600 font-medium">
            Ler no Substack →
          </span>
        </div>
      </Link>
    </article>
  );
}

