import type { Novidade } from "./novidades-types";

export const novidades: Novidade[] = [
  {
    slug: "retrospectiva-da-biblioteca-de-zines",
    date: "2025-12-21",
    kind: "biblioteca",
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
    kind: "biblioteca",
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
    slug: "leitura-de-zines-e-autores",
    date: "2025-02-02",
    kind: "site",
    historic: true,
    public: {
      title: "Encontrar zines e autorias ficou mais fácil",
      summary:
        "A Biblioteca passou a oferecer buscas e filtros para navegar pelo acervo com mais facilidade.",
      body: [
        "Esta é uma entrada histórica curada a partir do desenvolvimento anterior do site.",
      ],
    },
    nerds: {
      kind: "adicionado",
      summary: "Adicionados filtros de busca para zines e autorias.",
      pullRequests: [
        {
          number: 51,
          url: "https://github.com/lumamontes/biblioteca-de-zines/pull/51",
        },
      ],
    },
  },
  {
    slug: "categorias-no-acervo",
    date: "2025-07-01",
    kind: "site",
    historic: true,
    public: {
      title: "O acervo ganhou categorias",
      summary:
        "Agora é possível descobrir publicações por assuntos e categorias do acervo.",
      body: [
        "Esta é uma entrada histórica curada a partir do desenvolvimento anterior do site.",
      ],
    },
    nerds: {
      kind: "adicionado",
      summary: "Criada a estrutura de categorias, filtros e badges para o catálogo.",
      pullRequests: [
        {
          number: 74,
          url: "https://github.com/lumamontes/biblioteca-de-zines/pull/74",
        },
        {
          number: 78,
          url: "https://github.com/lumamontes/biblioteca-de-zines/pull/78",
        },
      ],
    },
  },
  {
    slug: "novo-leitor-de-zines",
    date: "2026-10-12",
    kind: "site",
    historic: true,
    public: {
      title: "Um novo jeito de ler zines",
      summary:
        "A Biblioteca começou a preparar uma experiência de leitura mais completa para as publicações do acervo.",
      body: [
        "Esta é uma entrada histórica curada a partir do desenvolvimento da nova versão do leitor.",
      ],
    },
    nerds: {
      kind: "adicionado",
      summary:
        "Adicionada a arquitetura de derivados de páginas e processamento resiliente para o leitor.",
      pullRequests: [
        {
          number: 134,
          url: "https://github.com/lumamontes/biblioteca-de-zines/pull/134",
        },
        {
          number: 143,
          url: "https://github.com/lumamontes/biblioteca-de-zines/pull/143",
        },
      ],
    },
  },
];

export function getNovidades(view: "public" | "nerds"): Novidade[] {
  return novidades
    .filter((novidade) => (view === "nerds" ? novidade.nerds : novidade.public))
    .sort((a, b) => b.date.localeCompare(a.date));
}
