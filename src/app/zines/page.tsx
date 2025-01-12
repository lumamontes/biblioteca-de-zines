import Image from "next/image";
import Link from "next/link";
import { zines } from "@/data/zines";
export default async function Zines() {
  return (
      <div className="p-12 md:pt-12 md:px-0 gap-4 grid grid-cols-1 md:grid-cols-2">
      {
        zines.map((zine) => (
          <div key={zine.slug} className="w-full pt-2 md:pt-8 md:p-0 gap-4  max-h-[500px] flex flex-col justify-between">
            <div className="flex gap-4 flex-col justify-center items-center">
              <Image
                src={zine.cover}
                alt="Girl in the city"
                width={241}
                height={238}
                priority
              />
              <h1 className="text-xl">{zine.title} por {zine.author?.name ?? ''}</h1>
              <p className="text-base">
                {zine.description}
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-4 text-center md:flex-row justify-center">
              <Link
                href={`/zines/${zine.slug}`}
                className="text-base px-4 py-2 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center"
              >
                Ver mais
              </Link>
              <Link
                href={zine.author?.url || "#"}
                target="_blank"
                className="text-base px-4 py-2 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center"
              >
                Conhecer autor
              </Link>
            </div>
          </div>
        ))
      }
      </div>
  );
}
