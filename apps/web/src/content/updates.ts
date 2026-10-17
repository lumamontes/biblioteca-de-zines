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
    slug: "observacoes-de-metadados-das-fontes",
    date: "2026-10-17",
    kind: "site",
    historic: true,
    public: {
      title: "Mais contexto sobre os arquivos do acervo",
      summary:
        "A Biblioteca passou a registrar melhor o que observa sobre arquivos, fontes e processos de preservação.",
      body: [
        "Essas observações ajudam a diferenciar o que foi encontrado em um arquivo, o que foi extraído automaticamente e o que foi revisado como informação do catálogo.",
        "É uma melhoria importante para cuidar do acervo sem transformar uma observação técnica em uma afirmação automática sobre autoria, direitos ou autenticidade.",
      ],
    },
  },
  {
    slug: "leitor-em-monorepo",
    date: "2026-10-14",
    kind: "site",
    historic: true,
    public: {
      title: "O leitor de zines ganhou uma casa própria",
      summary:
        "O leitor passou a viver separado do site principal, deixando a experiência de leitura mais preparada para crescer.",
      body: [
        "A Biblioteca agora organiza o site, o leitor e os contratos compartilhados como partes distintas do mesmo projeto.",
        "Para quem lê, isso prepara uma experiência mais estável sem mudar o acervo ou a proposta de acesso gratuito.",
      ],
    },
  },
  {
    slug: "processamento-completo-de-paginas",
    date: "2026-10-12",
    kind: "site",
    historic: true,
    public: {
      title: "Uma experiência de leitura mais completa",
      summary:
        "A Biblioteca começou a preparar a geração de páginas para que os zines possam ser lidos diretamente no site.",
      body: [
        "O novo caminho trabalha com páginas completas, capas derivadas e recuperação segura quando um processamento precisa ser refeito.",
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
        "A Biblioteca passou a ter inventários e verificações mais repetíveis para acompanhar arquivos, registros e acessos.",
      body: [
        "Esse trabalho ajuda a perceber diferenças entre o catálogo, as fontes e os arquivos locais antes que elas se tornem problemas difíceis de investigar.",
      ],
    },
  },
  {
    slug: "paginas-de-autores",
    date: "2025-12-20",
    kind: "site",
    historic: true,
    public: {
      title: "Autores ganharam páginas próprias",
      summary:
        "Agora é possível conhecer as pessoas e coletivos do acervo e encontrar os zines relacionados a cada autoria.",
      body: [
        "A listagem também ganhou paginação para continuar navegável conforme a coleção cresce.",
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
        "A organização do catálogo continua sendo construída para facilitar a descoberta sem reduzir a diversidade dos zines a uma única classificação.",
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
        "O formulário organiza as informações do zine, valida os dados e encaminha a submissão para revisão da equipe.",
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
        "Essa base tornou possível cuidar do acervo como uma coleção viva, em vez de apenas reunir links soltos.",
      ],
    },
  },
  {
    slug: "primeira-integracao-de-dados",
    date: "2025-01-13",
    kind: "site",
    historic: true,
    public: {
      title: "A Biblioteca começou a guardar seu próprio catálogo",
      summary:
        "O projeto ganhou sua primeira estrutura persistente para cuidar dos dados do acervo.",
      body: [
        "Foi o começo da transformação da ideia de uma biblioteca digital em uma ferramenta colaborativa para zines independentes.",
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
    },
  },
];

export function getPublicUpdates(): Update[] {
  return updates
    .filter((update) => update.public)
    .sort((a, b) => b.date.localeCompare(a.date));
}
