import Image from "next/image";
import Link from "next/link";
import { getThumbnailUrl } from "@/utils/assets";
import { joinAuthors } from "@/utils/utils";
import { Zine } from "@/@types/zine";

type ZineCardProps = {
  zine: Zine;
};

const ZineCard: React.FC<ZineCardProps> = ({ zine }) => {
  const thumbnailUrl = zine.cover_image ? getThumbnailUrl(zine.cover_image) : "";
  return (
    <div
      className="flex flex-col justify-between bg-white rounded-lg overflow-hidden shadow-sm h-full"
    >
      <div className="flex flex-col items-center p-4flex-grow">
        <div className="relative w-full h-56 flex items-center justify-center">
          <Image
            src={thumbnailUrl}
            alt={zine.title}
            fill
            className="rounded-md object-contain"
          />
        </div>
        <div className="flex flex-col mt-3 text-center">
          <h1 className="text-lg font-medium">
            {zine.title}{" "}
            <span className="text-gray-500 text-sm">por {joinAuthors(zine.library_zines_authors)}</span>
          </h1>
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
