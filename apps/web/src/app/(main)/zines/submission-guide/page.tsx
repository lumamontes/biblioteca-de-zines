import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/app/config/site";

export const metadata: Metadata = {
  title: `Envio, preservação e direitos - ${siteConfig.name}`,
  description:
    "Entenda como a Biblioteca de Zines processa, disponibiliza e preserva publicações enviadas por artistas e coletivos.",
  alternates: {
    canonical: `${siteConfig.url}/zines/submission-guide`,
  },
};

const sections = [
  {
    title: "Por que processamos os arquivos",
    children: (
      <>
        A Biblioteca de Zines transforma os PDFs publicados em imagens otimizadas para o leitor digital. Isso permite carregar as páginas progressivamente, navegar de uma página para outra e oferecer uma leitura mais consistente em celulares e computadores.
      </>
    ),
  },
  {
    title: "O que acontece depois do envio",
    children: (
      <ul className="list-disc space-y-2 pl-5">
        <li>A submissão é revisada antes de entrar no acervo público.</li>
        <li>Depois da publicação, o PDF é baixado e todas as páginas são processadas em imagens para o leitor.</li>
        <li>Quando não há uma imagem de capa válida, a primeira página do PDF pode ser usada como capa.</li>
        <li>Os arquivos processados são armazenados para entrega do leitor e podem ser reutilizados para evitar processamento desnecessário.</li>
        <li>O PDF original continua sendo a fonte informada no envio; os arquivos gerados são derivados para leitura e entrega.</li>
      </ul>
    ),
  },
  {
    title: "Revisão e publicação",
    children: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Cada envio é revisado por pessoas voluntárias antes da publicação.</li>
        <li>Por isso, não podemos garantir uma publicação imediata.</li>
        <li>Se você precisa da publicação para um lançamento ou outra data específica, escreva para bibliotecadezines@gmail.com. Vamos receber a informação e fazer o possível para considerar o prazo.</li>
        <li>Quando a publicação estiver disponível, avisaremos por e-mail se um endereço tiver sido informado no formulário.</li>
      </ul>
    ),
  },
  {
    title: "Direitos das pessoas autoras",
    children: (
      <>
        O envio não transfere os direitos autorais da obra para a Biblioteca. A pessoa autora, artista ou coletivo continua responsável por seus direitos e pela autorização de uso de textos, imagens, músicas e outros materiais incluídos na publicação. Envie apenas trabalhos próprios ou materiais para os quais você tenha autorização.
      </>
    ),
  },
  {
    title: "Disponibilização pública",
    children: (
      <>
        A publicação no acervo torna públicos os dados cadastrados, a capa, as imagens processadas e o acesso de leitura definido para a zine. A disponibilização na Biblioteca não coloca a obra em domínio público, não cria uma licença nova e não autoriza usos que a pessoa autora não tenha permitido.
      </>
    ),
  },
  {
    title: "Preservação digital",
    children: (
      <>
        A preservação aqui significa manter informações de catálogo e derivados digitais para que a publicação possa continuar legível e encontrável. Links externos podem mudar, arquivos podem ser substituídos e nenhum serviço online garante disponibilidade permanente. Por isso, recomendamos que autoras e coletivos mantenham seus próprios arquivos originais e cópias de preservação.
      </>
    ),
  },
  {
    title: "Pesquisa e melhorias em andamento",
    children: (
      <>
        Estamos estudando como melhorar o cuidado com o acervo ao longo do tempo, incluindo resiliência da infraestrutura, organização de metadados, catalogação, memória comunitária e continuidade do projeto. Ainda não temos uma solução definitiva nem adotamos uma ferramenta específica: estamos primeiro entendendo as necessidades de quem produz, mantém e consulta zines. Acompanhe a{' '}
        <a
          href="https://github.com/lumamontes/biblioteca-de-zines/discussions/115"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          discussão sobre preservação digital e catalogação
        </a>{' '}
        e participe com referências, críticas e sugestões.
        {' '}O trabalho está organizado no milestone{' '}
        <a
          href="https://github.com/lumamontes/biblioteca-de-zines/milestone/3"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          Biblioteca archive care pilot
        </a>. A primeira etapa é estabelecer uma linha de base do acervo, entendendo como funcionam hoje nossas submissões, catalogação, arquivos, acesso e manutenção; acompanhe a{' '}
        <a
          href="https://github.com/lumamontes/biblioteca-de-zines/issues/106"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          tarefa de linha de base do acervo
        </a>.
      </>
    ),
  },
  {
    title: "Correções e remoção",
    children: (
      <>
        Se você é responsável pela obra e quiser corrigir informações, substituir um arquivo ou solicitar a remoção da publicação e de seus derivados, entre em contato usando o e-mail informado na submissão. Avaliaremos o pedido e, quando aplicável, removeremos a publicação e os arquivos derivados do acervo público.
      </>
    ),
  },
  {
    title: "Onde os arquivos ficam e por que usamos essas ferramentas",
    children: (
      <div className="space-y-4">
        <p>
          O PDF enviado é a fonte da publicação. As imagens de páginas e capas são arquivos derivados, criados para tornar a leitura mais rápida e permitir a navegação página a página. Eles não substituem o PDF original nem definem direitos de reutilização.
        </p>
        <p>
          O Internet Archive BookReader é o software que usamos para exibir o leitor. Não enviamos automaticamente os PDFs da Biblioteca para o Internet Archive nem usamos o serviço como nosso armazenamento principal. Aceitamos fontes externas como Google Drive, Internet Archive, site próprio da pessoa autora ou outros serviços, desde que o link forneça um PDF acessível para download e processamento. Quando o link aponta apenas para uma página de leitura externa, ele pode continuar sendo usado como fallback, mas não necessariamente como fonte processável.
        </p>
        <p>
          Os arquivos derivados de leitura são armazenados na infraestrutura de entrega da Biblioteca. No futuro, uploads diretos poderão permitir que originais autorizados também sejam mantidos pela Biblioteca, seguindo uma política própria de preservação e acesso.
        </p>
      </div>
    ),
  },
  {
    title: "Quais links podem ser usados",
    children: (
      <>
        Hoje o formulário recebe links para PDFs hospedados externamente. Você pode usar Google Drive, Internet Archive, seu próprio site ou outro serviço, desde que o servidor consiga acessar o link e obter os bytes de um PDF válido. Links que exigem login, senha ou autorização especial, que expiram, que bloqueiam acessos automatizados ou que abrem apenas uma página HTML de leitura podem não ser processados. O endereço precisa funcionar no momento da revisão e do processamento da publicação.
      </>
    ),
  },
];

export default function SubmissionGuidePage() {
  return (
    <main className="flex-1 px-4 py-10 md:px-8 md:py-16">
      <article className="mx-auto max-w-3xl">
        <header className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            Guia de submissão
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl">
            Envio, preservação e direitos
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">
            Como usamos os arquivos enviados para preparar uma experiência de leitura acessível e cuidar da publicação com respeito ao trabalho de quem cria.
          </p>
        </header>

        <div className="space-y-10 text-base leading-relaxed text-neutral-700">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-xl font-semibold text-neutral-950">{section.title}</h2>
              {section.children}
            </section>
          ))}
        </div>

        <footer className="mt-14 border-t border-neutral-200 pt-8 text-sm text-neutral-600">
          <p>
            Quer enviar uma publicação?{' '}
            <Link href="/zines/apply" className="font-medium text-neutral-950 underline underline-offset-4">
              Volte para o formulário de submissão.
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
