import Link from "next/link";
import { getThumbnailUrl } from "@/utils/assets";
import { joinAuthors, getZineCategories } from "@/utils/utils";
import { Zine } from "@/@types/zine";
import CategoryBadge from "./category-badge";
import YearBadge from "./year-badge";
import { PLACEHOLDER_COVER_IMAGE } from "@/app/config/site";

type ZineCardProps = {
  zine: Zine;
  onCategoryClick?: (category: string) => void;
};

const ZineCard: React.FC<ZineCardProps> = ({ zine, onCategoryClick }) => {
  const thumbnailUrl = zine.cover_image ? getThumbnailUrl(zine.cover_image) : PLACEHOLDER_COVER_IMAGE;
  const categories = getZineCategories(zine.tags);
  const publishedYear = zine.year;
  
  return (
    <div
      className="flex flex-col justify-between bg-white rounded-lg overflow-hidden shadow-sm h-full"
    >
      <div className="flex flex-col items-center p-4flex-grow">
        <div className="relative w-full h-56 flex items-center justify-center">
          <img
            src={thumbnailUrl}
            alt={zine.title}
            className="rounded-md object-contain w-full h-full"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col mt-3 text-center">
          <h1 className="text-lg font-medium">
            {zine.title}{" "}
            <span className="text-gray-500 text-sm">por {joinAuthors(zine.library_zines_authors)}</span>
          </h1>
          <div className="max-w-sm flex justify-center mt-2 mx-auto">
            {publishedYear && <YearBadge year={publishedYear} />}
          </div>
            {categories.length > 0 && (
           <CategoryBadge categories={categories} onCategoryClick={onCategoryClick} />
          )}
          <p className="mt-2 text-sm text-gray-600">{zine.description}</p>
          
       
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-2 p-4">
        <Link
          href={`/zines/${zine.slug}`}
          className="flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition"
        >
          Ver mais
        </Link>
      </div>
    </div>
  );
};

export default ZineCard;
