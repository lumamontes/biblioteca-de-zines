import type { Update } from "./update-types";

export const updates: Update[] = [
  {
    slug: "leitura-com-mais-contraste",
    date: "2026-10-21",
    kind: "site",
    public: {
      title: "Uma leitura mais confortável no catálogo",
      summary:
        "A página de leitura ganhou uma organização mais clara e um contraste adaptável para os links sociais fixos.",
      body: [
        "Agora é possível alternar entre a visualização de PDF e a leitura digital com os controles organizados na lateral da zine.",
        "Quando os links sociais passam sobre essa lateral em telas grandes, eles recebem um fundo translúcido sutil para continuar visíveis sem esconder completamente o conteúdo. Em telas pequenas, a navegação continua seguindo o fluxo normal da página.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/nova-pagina-detalhamento-zines.png",
          alt: "Nova página de detalhes e leitura de uma zine na Biblioteca de Zines",
        },
      ],
    },
  },
  {
    slug: "biblioteca-em-destaque-na-midia",
    date: "2026-10-15",
    kind: "community",
    public: {
      title: "A Biblioteca de Zines no G1 Amapá",
      summary:
        "Uma matéria do G1 Amapá contou como a Biblioteca amplia o acesso a zines e à produção independente no estado.",
      body: [
        "Luana Góes, idealizadora da Biblioteca, participou de uma matéria do G1 Amapá sobre o projeto, o acervo e a importância de tornar produções independentes mais fáceis de encontrar e ler.",
        "A Biblioteca agradece a todas as pessoas que enviam zines, divulgam o acervo, participam das atividades e ajudam a manter essa coleção viva e acessível.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/g1-amapa.jpg",
          alt: "Arte sobre a matéria do G1 Amapá com imagens da reportagem e da Biblioteca de Zines",
        },
      ],
      sourceUrl:
        "https://g1.globo.com/ap/amapa/noticia/2026/10/14/biblioteca-virtual-reune-mais-de-300-zines-gratuitos-e-amplia-acesso-a-producao-independente-no-ap.ghtml",
      sourceLabel: "Ler matéria no G1 Amapá",
    },
  },
  {
    slug: "visualizador-de-paginas-de-zines",
    date: "2026-10-18",
    kind: "site",
    public: {
      title: "Um novo jeito de ler as páginas das zines",
      summary:
        "A Biblioteca começou a testar um novo visualizador de páginas, com navegação mais fluida e carregamento progressivo.",
      body: [
        "Os PDFs continuam sendo preservados como a representação original. O beta usa imagens das páginas para experimentar uma navegação com zoom, miniaturas e carregamento progressivo, mantendo o PDF disponível quando o processamento das páginas não estiver pronto.",
        "A experiência será liberada gradualmente enquanto acompanhamos seu funcionamento em diferentes telas e com diferentes publicações.",
      ],
      media: [
        {
          kind: "video",
          src: "/novidades/visualizador-paginas.mp4",
          alt: "Vídeo do visualizador de páginas da Biblioteca de Zines",
        },
      ],
    },
  },
  {
    slug: "retrospectiva-da-biblioteca-de-zines",
    date: "2025-12-21",
    kind: "community",
    public: {
      title: "Retrospectiva da Biblioteca de Zines",
      summary:
        "Um ano de zines arquivadas, encontros, colaborações e muita criatividade compartilhada.",
      body: [
        "A Biblioteca cresceu com a participação de zineiros, artistas, pessoas desenvolvedoras, designers, coletivos e apoiadores. Cada zine enviada, atividade compartilhada e conversa ajudou a construir o acervo.",
        "A retrospectiva reúne alguns momentos de 2024 e 2025: publicações, eventos, materiais gratuitos e projetos que ajudaram a colocar mais zines em circulação.",
        "A Biblioteca agradece a todas as pessoas que fazem, enviam, leem, divulgam e ajudam a cuidar das zines.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/retrospectiva-images/retrospectiva-2024-2025-biblioteca-de-zines-1.jpg",
          alt: "Imagem 1 da retrospectiva da Biblioteca de Zines de 2024 e 2025",
        },
        {
          kind: "image",
          src: "/novidades/retrospectiva-images/retrospectiva-2024-2025-biblioteca-de-zines-2.jpg",
          alt: "Imagem 2 da retrospectiva da Biblioteca de Zines de 2024 e 2025",
        },
        {
          kind: "image",
          src: "/novidades/retrospectiva-images/retrospectiva-2024-2025-biblioteca-de-zines-3.jpg",
          alt: "Imagem 3 da retrospectiva da Biblioteca de Zines de 2024 e 2025",
        },
        {
          kind: "image",
          src: "/novidades/retrospectiva-images/retrospectiva-2024-2025-biblioteca-de-zines-4.jpg",
          alt: "Imagem 4 da retrospectiva da Biblioteca de Zines de 2024 e 2025",
        },
        {
          kind: "image",
          src: "/novidades/retrospectiva-images/retrospectiva-2024-2025-biblioteca-de-zines-5.jpg",
          alt: "Imagem 5 da retrospectiva da Biblioteca de Zines de 2024 e 2025",
        },
        {
          kind: "image",
          src: "/novidades/retrospectiva-images/retrospectiva-2024-2025-biblioteca-de-zines-6.jpg",
          alt: "Imagem 6 da retrospectiva da Biblioteca de Zines de 2024 e 2025",
        },
        {
          kind: "image",
          src: "/novidades/retrospectiva-images/retrospectiva-2024-2025-biblioteca-de-zines-7.jpg",
          alt: "Imagem 7 da retrospectiva da Biblioteca de Zines de 2024 e 2025",
        },
        {
          kind: "image",
          src: "/novidades/retrospectiva-images/retrospectiva-2024-2025-biblioteca-de-zines-8.jpg",
          alt: "Imagem 8 da retrospectiva da Biblioteca de Zines de 2024 e 2025",
        },
      ],
      sourceUrl: "https://www.instagram.com/p/DShdbKfjmG7/?img_index=1",
      sourceLabel: "Ver retrospectiva no Instagram",
    },
  },
  {
    slug: "biblioteca-de-zines-na-ueap",
    date: "2025-11-28",
    kind: "community",
    public: {
      title: "Uma oficina de fanzines na UEAP",
      summary:
        "Uma apresentação sobre fanzines para uma turma de Letras da Universidade Estadual do Amapá virou também um encontro de criação, troca e circulação de zines.",
      body: [
        "A atividade foi um convite da professora doutora Jeniffer Yara, da UEAP, e começou com uma apresentação de Luana Góes, idealizadora da Biblioteca de Zines, sobre fanzines e produção independente.",
        "Depois da conversa, a turma criou suas próprias zines. Luana também ensinou uma dobra simples de minizine, apresentou o acervo físico da Biblioteca e compartilhou materiais de coletivos e artistas independentes, como o Coletivo Ventos do Norte e Cabelo Nuvem.",
        "A atividade promoveu a troca de referências, a distribuição de zines e uma conversa sobre criação, circulação e apoio à produção independente.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/luana-biblioteca-ueap.jpg",
          alt: "Luana Góes apresenta zines para uma turma da UEAP",
        },
      ],
      sourceUrl: "https://www.instagram.com/p/DRmrdOIABnV/?img_index=1",
      sourceLabel: "Ver relato da oficina no Instagram",
    },
  },
  {
    slug: "nova-versao-do-site",
    date: "2025-10-04",
    kind: "site",
    historic: true,
    public: {
      title: "A Biblioteca ganhou uma nova versão do site",
      summary:
        "Uma nova versão do site reuniu o acervo, uma indicação de zine, a seção de notícias e um espaço para o Clube de Zines.",
      body: [
        "A Biblioteca passou a ter uma nova página inicial, com mais caminhos para descobrir zines e acompanhar o que está acontecendo no projeto.",
        "A nova versão também abriu espaço para apresentar o Clube de Zines e compartilhar novidades da comunidade.",
        "Leia, explore, faça zines.",
      ],
      media: [
        {
          kind: "video",
          src: "/novidades/site-nova-versao.mp4",
          alt: "Vídeo de apresentação da nova versão do site",
        },
      ],
    },
  },
  {
    slug: "cuidado-e-inventario-do-acervo",
    date: "2026-09-13",
    kind: "site",
    historic: true,
    public: {
      title: "Mais cuidado com a continuidade do acervo",
      summary:
        "A Biblioteca passou a acompanhar de forma mais repetível os arquivos, registros e fontes que mantêm o acervo acessível.",
      body: [
        "Inventários e verificações ajudam a perceber quando o catálogo, uma fonte externa e uma cópia local deixam de contar a mesma história.",
        "Esse trabalho não muda o que está disponível agora, mas cria uma forma melhor de investigar links quebrados, arquivos ausentes e mudanças no acervo antes que elas se percam.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/monitor-recursos-1.png",
          alt: "Tela de monitoramento de recursos publicados da Biblioteca de Zines",
        },
        {
          kind: "image",
          src: "/novidades/monitor-recursos-2.png",
          alt: "Relatório de observação dos recursos do acervo",
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
        "Cada página reúne as zines publicadas por uma pessoa autora ou coletivo em um só lugar, facilitando o compartilhamento e a leitura de diferentes trabalhos.",
        "A funcionalidade ainda está em desenvolvimento. A ideia é continuar melhorando essas páginas com a participação de quem faz parte da comunidade.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/pagina-de-autor-1.jpg",
          alt: "Apresentação das páginas de autor da Biblioteca de Zines",
        },
        {
          kind: "image",
          src: "/novidades/pagina-de-autor-2.jpg",
          alt: "Exemplo de uma página de autor com zines publicadas",
        },
        {
          kind: "image",
          src: "/novidades/pagina-de-autor-3.jpg",
          alt: "Exemplo de uma página de autor em uma tela de celular",
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
        "Categorias, etiquetas e filtros ajudam a descobrir publicações por diferentes caminhos.",
      body: [
        "A organização do catálogo foi ampliada para facilitar a descoberta sem reduzir a diversidade das zines a uma única classificação.",
        "É possível combinar busca, ano e categorias para encontrar publicações por assuntos e interesses diferentes.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/categorias-e-filtros.png",
          alt: "Tela do acervo com filtros por ano e categorias",
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
      title: "Enviar uma zine ficou mais simples",
      summary:
        "A Biblioteca passou a receber submissões diretamente pelo próprio site.",
      body: [
        "O formulário organiza as informações da zine, valida os dados e encaminha a submissão para revisão da equipe.",
        "Essa mudança substituiu o envio por Google Forms e aproximou o processo de submissão do catálogo e do painel de revisão.",
      ],
      media: [
        {
          kind: "video",
          src: "/novidades/formulario-de-submissao.mp4",
          alt: "Vídeo de apresentação do formulário de submissão",
        },
      ],
    },
  },
  {
    slug: "painel-de-revisao-do-acervo",
    date: "2025-03-01",
    kind: "site",
    historic: true,
    public: {
      title: "Um painel para cuidar das zines recebidas",
      summary:
        "A Biblioteca criou um painel interno para que mantenedoras e pessoas revisoras acompanhem, editem e publiquem as submissões do acervo.",
      body: [
        "Nos primeiros meses do projeto, a Biblioteca passou a organizar as zines recebidas em um painel próprio. A ferramenta reúne as informações enviadas, os links dos arquivos e o estado de cada submissão.",
        "Com esse painel, a equipe consegue revisar os dados, fazer ajustes quando necessário e publicar as zines no catálogo com mais clareza e cuidado.",
        "Esse trabalho de bastidor ajuda a transformar cada envio em uma publicação acessível para quem lê e pesquisa zines independentes.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/catalogo-revisao-dashboard.png",
          alt: "Painel interno de revisão das zines recebidas pela Biblioteca",
        },
      ],
    },
  },
  {
    slug: "mes-internacional-de-zines",
    date: "2026-07-01",
    kind: "community",
    public: {
      title: "Julho é o Mês Internacional da Zine",
      summary:
        "Para celebrar o International Zine Month, a Biblioteca preparou um template de minizine para imprimir e preencher.",
      body: [
        "O International Zine Month reúne celebrações e propostas de criação em diferentes lugares. A Biblioteca entrou na brincadeira com um template simples para quem quiser fazer uma minizine no papel.",
        "Imprima, preencha, dobre e compartilhe a sua criação. Zines também são uma forma de experimentar, trocar ideias e colocar trabalhos em circulação.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/mes-internacional-zines.webp",
          alt: "Cartaz do Mês Internacional da Zine de julho de 2026",
        },
      ],
      sourceUrl:
        "https://drive.google.com/file/d/1ka2nroNuvwskiyUxHvUSfxP1EIImAF0y/view",
      sourceLabel: "Baixar o template de minizine",
    },
  },
  {
    slug: "origem-da-biblioteca",
    date: "2025-01-12",
    kind: "community",
    historic: true,
    public: {
      title: "Bem-vindas à Biblioteca de Zines",
      summary:
        "A Biblioteca começou como uma coleção digital colaborativa e de código aberto para zines independentes do Brasil.",
      body: [
        "A Biblioteca nasceu para arquivar e compartilhar zines brasileiras. O projeto é gratuito, colaborativo e aberto a pessoas que queiram ler, fazer, enviar ou ajudar a cuidar do acervo.",
        "A ideia começou pequena e cresceu com a colaboração de uma comunidade que ajudou a transformar o projeto em um espaço para descobrir e celebrar zines independentes.",
        "Explore, leia, divulgue e, mais importante, faça zines.",
      ],
      media: [
        {
          kind: "image",
          src: "/novidades/bem-vindo-biblioteca.webp",
          alt: "Cartaz de apresentação da Biblioteca de Zines",
        },
      ],
      sourceUrl: "https://www.biblioteca-de-zines.com.br/",
      sourceLabel: "Visitar a Biblioteca de Zines",
    },
  },
];

export function getPublicUpdates(): Update[] {
  return updates
    .filter((update) => update.public)
    .sort((a, b) => b.date.localeCompare(a.date));
}
