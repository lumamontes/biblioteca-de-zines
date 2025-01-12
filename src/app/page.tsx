import NavSocialLinks from "@/components/nav-social-links";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  return (
    <main className="flex min-h-screen items-center max-w-6xl mx-auto md:px-12 justify-between flex-col md:flex-row">
      <div className="w-full p-12 md:p-0 gap-4 ">
        <div className="flex gap-4 flex-col">
          <p className="text-sm">
            <code>Virtual e Código Aberto</code>&nbsp;
          </p>
          <h1 className="text-4xl">Biblioteca de Zines</h1>
          <p className="text-base">
            Uma biblioteca virtual para catalogar e arquivar iniciativas
            independentes em formato de zine{" "}
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-4 md:flex-row text-center">
          <Link
            href={`/zines`}
            className="text-base px-6 py-3 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center"
          >
            Explorar :)
          </Link>
          <Link
            href="https://substack.com/@bibliotecadezines?r=53s7hh&utm_campaign=profile&utm_medium=profile-page"
            target="_blank"
            className="text-base px-6 py-3 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center"
          >
            Newsletter
          </Link>
        </div>
      </div>
      <div className="h-48 w-full  mt-10 md:mt-0 md:w-1/2 flex items-center justify-center">
        <Image
          src="/ezgif-5-847f1efa8d.gif"
          alt="Logo da biblioteca de zines"
          width={301}
          height={288}
          loading="lazy"
        />
      </div>
      <NavSocialLinks />
    </main>
  );
}
