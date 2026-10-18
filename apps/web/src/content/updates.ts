import type { Update } from "./update-types";

export const updates: Update[] = [
  {
    slug: "retrospectiva-da-biblioteca-de-zines",
    date: "2025-12-21",
    kind: "community",
    public: {
      title: "Retrospectiva da Biblioteca de Zines",
      summary:
        "Um ano de zines arquivados, eventos, colaborações e muita criatividade compartilhada.",
      body: [
        "Desde o primeiro zine arquivado até os primeiros eventos, a Biblioteca cresceu com uma comunidade incrível de zineiros, artistas, devs, designers, coletivos e pessoas apoiadoras.",
        "A Biblioteca agradece a todas as pessoas que enviam zines, levam o projeto para eventos, divulgam o acervo, participam do Clube de Zines e ajudam a colocar mais zines no mundo.",
        "Novos projetos, textos, artes, materiais gratuitos, oficinas e melhorias para o site continuam chegando.",
      ],
      sourceUrl: "https://www.instagram.com/p/DShdbKfjmG7/?img_index=1",
      sourceLabel: "Ver retrospectiva no Instagram",
      media: Array.from({ length: 8 }, (_, index) => ({
        kind: "image" as const,
        src: `/novidades/retrospectiva-${String(index + 1).padStart(2, "0")}.jpg`,
        alt: `Imagem ${index + 1} da retrospectiva da Biblioteca de Zines`,
      })),
    },
  },
  {
    slug: "biblioteca-de-zines-na-ueap",
    date: "2025-11-28",
    kind: "community",
    public: {
      title: "Uma oficina de fanzines na UEAP",
      summary:
        "A Biblioteca participou de uma apresentação sobre fanzines para uma turma de Letras da Universidade Estadual do Amapá.",
      body: [
        "A atividade foi um convite da professora Jeniffer Yara e contou com uma apresentação sobre a Biblioteca, um momento de criação de zines e uma dobra simples de mini zine.",
        "O acervo físico foi levado para a turma, junto com materiais de coletivos e zines para conhecer, compartilhar e inspirar novas produções independentes.",
        "Também foram distribuídas cópias gratuitas de zines sobre fanzines e sobre a própria Biblioteca. A experiência abriu mais uma conversa sobre criação, circulação e apoio à produção independente.",
      ],
      sourceUrl: "https://www.instagram.com/p/DRmrdOIABnV/?img_index=1",
      sourceLabel: "Ver relato da oficina no Instagram",
      media: Array.from({ length: 7 }, (_, index) => ({
        kind: "image" as const,
        src: `/novidades/ueap-${String(index + 1).padStart(2, "0")}.jpg`,
        alt: `Imagem ${index + 1} da oficina de fanzines na UEAP`,
      })),
    },
  },
  {
    slug: "visualizador-de-paginas-de-zines",
    date: "2026-10-12",
    kind: "site",
    historic: true,
    public: {
      title: "Uma nova forma de ver as páginas das zines",
      summary:
        "A Biblioteca começou a preparar um visualizador próprio para exibir as páginas das zines com mais fluidez.",
      body: [
        "Os PDFs continuam sendo preservados como a representação original. A novidade é preparar imagens das páginas para que a navegação possa acontecer de forma progressiva, com zoom, miniaturas e uma alternativa clara quando o processamento não estiver disponível.",
        "O visualizador ainda está em desenvolvimento e será liberado gradualmente, depois de testes de desempenho, acessibilidade, segurança e recuperação.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/visualizador-paginas.svg",
          alt: "Fluxo entre um PDF, imagens das páginas e o visualizador de zines",
          caption: "Do PDF original às imagens usadas para exibir as páginas.",
        },
      ],
    },
  },
  {
    slug: "cuidado-e-inventario-do-acervo",
    date: "2026-09-23",
    kind: "site",
    historic: true,
    public: {
      title: "Mais cuidado com a continuidade do acervo",
      summary:
        "A Biblioteca passou a acompanhar de forma mais repetível os arquivos, registros e fontes que mantêm o acervo acessível.",
      body: [
        "Inventários e verificações ajudam a perceber quando o catálogo, uma fonte externa e uma cópia local deixaram de contar a mesma história.",
        "Esse trabalho não muda o que está disponível agora, mas cria uma forma melhor de investigar links quebrados, arquivos ausentes e mudanças no acervo antes que elas se percam.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/inventario-acervo.svg",
          alt: "Diagrama relacionando catálogo, fontes externas e cópias locais do acervo",
          caption: "O inventário compara o catálogo com suas fontes e arquivos.",
        },
      ],
    },
  },
  {
    slug: "paginas-de-autores",
    date: "2025-12-20",
    kind: "site",
    historic: true,
    public: {
      title: "Pessoas autoras e coletivos ganharam páginas próprias",
      summary:
        "Agora é possível conhecer as pessoas e coletivos do acervo e encontrar as zines relacionadas a cada autoria.",
      body: [
        "As páginas reúnem links de apoio, plataformas reconhecidas e previews quando há informações suficientes para apresentá-los com segurança.",
        "A listagem também ganhou paginação para continuar navegável conforme a coleção cresce.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/autorias-e-coletivos.svg",
          alt: "Diagrama de uma página de autoria com zines e links de apoio",
          caption: "Uma autoria conecta pessoas, coletivos, zines e links de apoio.",
        },
      ],
    },
  },
  {
    slug: "categorias-e-filtros-do-acervo",
    date: "2025-07-01",
    kind: "site",
    historic: true,
    public: {
      title: "O acervo ganhou categorias e filtros",
      summary:
        "Novas categorias, badges e filtros ajudam a descobrir publicações por diferentes caminhos.",
      body: [
        "A organização do catálogo continua sendo construída para facilitar a descoberta sem reduzir a diversidade das zines a uma única classificação.",
      ],
      media: [
        {
          kind: "image",
          src: "/zines.png",
          alt: "Tela do catálogo de zines com cartões e filtros",
          caption: "Filtros e categorias criam novos caminhos para descobrir zines.",
        },
      ],
    },
  },
  {
    slug: "formulario-de-submissao",
    date: "2025-06-15",
    kind: "site",
    historic: true,
    public: {
      title: "Enviar um zine ficou mais simples",
      summary:
        "A Biblioteca passou a receber submissões diretamente pelo próprio site.",
      body: [
        "O formulário organiza as informações da zine, valida os dados e encaminha a submissão para revisão da equipe.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/submissao-zine.svg",
          alt: "Fluxo de envio, revisão e publicação de uma zine",
          caption: "A submissão passa por revisão antes de entrar no acervo público.",
        },
      ],
    },
  },
  {
    slug: "catalogo-de-zines-e-autores",
    date: "2025-01-23",
    kind: "site",
    historic: true,
    public: {
      title: "O catálogo começou a tomar forma",
      summary:
        "A Biblioteca passou a organizar zines, autorias, publicação e administração em um catálogo próprio.",
      body: [
        "Essa base tornou possível cuidar do acervo como uma coleção viva, em vez de apenas reunir links soltos. Zines, pessoas autoras, publicações e o estado de revisão passaram a ter lugares próprios no catálogo.",
      ],
      media: [
        {
          kind: "image",
          src: "/zines.png",
          alt: "Tela do catálogo digital da Biblioteca de Zines",
          caption: "O catálogo reúne publicações independentes em um só lugar.",
        },
      ],
    },
  },
  {
    slug: "origem-da-biblioteca",
    date: "2025-01-12",
    kind: "community",
    historic: true,
    public: {
      title: "Nasce a Biblioteca de Zines",
      summary:
        "O projeto começa como uma coleção digital colaborativa e de código aberto para zines independentes.",
      body: [
        "Desde o início, a Biblioteca existe para ampliar o acesso à produção independente e cuidar de um acervo construído com a comunidade.",
      ],
      media: [
        {
          kind: "image",
          src: "/final_biblioteca.gif",
          alt: "Animação de apresentação da Biblioteca de Zines",
          caption: "Uma biblioteca digital construída com a comunidade.",
        },
      ],
    },
  },
];

export function getPublicUpdates(): Update[] {
  return updates
    .filter((update) => update.public)
    .sort((a, b) => b.date.localeCompare(a.date));
}
