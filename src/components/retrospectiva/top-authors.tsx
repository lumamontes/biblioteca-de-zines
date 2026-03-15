import { TopAuthor } from "@/services/statistics-service";

interface TopAuthorsProps {
  authors: TopAuthor[];
}

export function TopAuthors({ authors }: TopAuthorsProps) {
  return (
    <div className="bg-white border-2 border-black p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">Top Autores</h3>
      <div className="space-y-3">
        {authors.map((author, index) => (
          <div
            key={author.authorId}
            className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black w-8 text-center">
                {index + 1}
              </span>
              <span className="font-medium">{author.authorName}</span>
            </div>
            <span className="font-bold text-zine-green">
              {author.zineCount} zine{author.zineCount !== 1 ? "s" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


