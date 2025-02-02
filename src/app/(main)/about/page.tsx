import { ExternalLink } from "@/components/about/external-link";
import { Section } from "@/components/about/section";
import Image from "next/image";

const RELATED_LINKS = [
  {
    title: "Zine de arte da UTFPR:",
    description: "Links e drives diversos.",
    url: "https://linktr.ee/zinegororoba?fbclid=PAZXh0bgNhZW0CMTEAAab5hJGLob0HFsQ3p81t9Ia5srBCHnb1LWaN2NSUrHVRvvYmHP9c6y9FU0E_aem_abJKWth6AsD2IIn5-HK22g",
  },
  {
    title: "Zineteca digital colaborativa:",
    description: "Coleção disponível no Google Drive.",
    url: "https://drive.google.com/drive/folders/1XcSyJqUTRjb-nnmYgIla6WfRJ8WMJ5B1",
  },
  {
    title: "Marca de Fantasia",
    description: "Publicou centenas de zines e quadrinhos. Atualmente, 99% do catálogo é gratuito para download.",
    url: "https://marcadefantasia.com/",
  },
  {
    title: "Listagem de bibliotecas de zines ao redor do mundo",
    description: "Veja a lista aqui",
    url: "https://zines.barnard.edu/zine-libraries",
  },
];

export default function About() {
  return (
    <div className="flex flex-col items-center min-h-screen w-full mx-auto p-6 md:p-8 gap-12 max-w-screen-md">
      
      <Image src="/logo.png" alt="Logo da Biblioteca de Zines" width={500} height={500} priority sizes="(max-width: 768px) 100vw, 500px" />

      <Section title="Sobre a Biblioteca de Zines">
        O projeto Biblioteca de Zines é uma iniciativa gratuita e código-aberto que surgiu para oferecer um espaço para zines independentes do Brasil.
        Aqui você encontra zines de diversas temáticas, produzidos por pessoas de diferentes lugares do país.
      </Section>

      <Section title="O que é um zine?">
        O termo zine vem da palavra fanzine, que significa fã + revista. São publicações independentes, feitas por uma ou mais pessoas, com temáticas diversas.
        Os zines podem ser feitos de forma artesanal, com colagens, desenhos, textos e fotografias.
      </Section>

      <Image src="/about.png" alt="Imagem sobre Zines" width={500} height={500} sizes="(max-width: 768px) 100vw, 500px" />

      <Section title="Código Aberto">
        A Biblioteca de Zines é um projeto <strong>de código aberto</strong>. Sinta-se à vontade para contribuir com o projeto, seja sugerindo melhorias, reportando bugs ou enviando um zine para ser adicionado à biblioteca.
      </Section>

      <hr className="w-full max-w-xl mx-auto my-8 border-neutral-200" />

      <nav className="w-full max-w-xl mx-auto">
        <p className="text-lg font-bold text-center mb-4">Links legais relacionados</p>
        <ul className="list-disc list-inside space-y-3 text-sm">
          {RELATED_LINKS.map((link, index) => (
            <ExternalLink key={index} {...link} />
          ))}
        </ul>
      </nav>
    </div>
  );
}
