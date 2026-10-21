import Link from 'next/link';
import CategoryBadgeWithLink from '@/components/zine-card/category-badge-with-link';
import type { Zine } from '@/@types/zine';
import { joinAuthors } from '@/utils/utils';

type ZineDetailsProps = {
  categories: string[];
  zine: Zine;
};

export function ZineDetails({ categories, zine }: ZineDetailsProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xl font-semibold leading-tight">{zine.title}</p>
        <p className="mt-2 text-sm text-neutral-600">por {joinAuthors(zine.library_zines_authors)}</p>
      </div>

      {zine.library_zines_authors.length > 0 && (
        <div className="grid gap-2">
          {zine.library_zines_authors.map(({ authors }) => (
            <Link
              key={authors.id}
              href={authors.slug ? `/authors/${authors.slug}` : authors.url || '#'}
              {...(authors.slug ? {} : { target: '_blank' })}
              className="flex items-center justify-center border border-black px-3 py-2 text-sm font-medium text-black transition hover:bg-neutral-100"
            >
              Conhecer autor: {authors.name}
            </Link>
          ))}
        </div>
      )}

      {categories.length > 0 && <CategoryBadgeWithLink categories={categories} />}

      <p className="text-sm leading-6 text-neutral-700">{zine.description}</p>
    </div>
  );
}
