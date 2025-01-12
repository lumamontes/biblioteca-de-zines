//TODO: Substituir por conexão com CMS/Banco de Dados pra evitar hardcoding
export const zines = [
  {
    title: "Spotlight Project #4",
    slug: "spotlight-project-4",
    description: "(Português/English) Conheça Freddie, uma incrível artista e designer de Portugal!",
    tags: ["Macapá", "Ilustração", "Comics"],
    cover: "/Freddie-Coveer_3.png",
    url: "/Freddie - Spotlight Project_compressed.pdf",
    author: {
        url: "https://bento.me/luanagm",
        name: "Luana Góes"
    }
  },
  {
    title: "Spotlight Project #4",
    slug: "spotlight-project-3",
    description: "(Português/English) Conheça Freddie, uma incrível artista e designer de Portugal!",
    tags: ["Macapá", "Ilustração", "Comics"],
    cover: "/Freddie-Coveer_3.png",
    url: "/Freddie - Spotlight Project_compressed.pdf",
    author: {
        url: "https://bento.me/luanagm",
        name: "Luana Góes"
    }
  },
  {
    title: "Spotlight Project #4",
    slug: "spotlight-project-2",
    description: "(Português/English) Conheça Freddie, uma incrível artista e designer de Portugal!",
    tags: ["Macapá", "Ilustração", "Comics"],
    cover: "/Freddie-Coveer_3.png",
    url: "/Freddie - Spotlight Project_compressed.pdf",
    author: {
        url: "https://bento.me/luanagm",
        name: "Luana Góes"
    }
  },
  {
    title: "Spotlight Project #4",
    slug: "spotlight-project-2",
    description: "(Português/English) Conheça Freddie, uma incrível artista e designer de Portugal!",
    tags: ["Macapá", "Ilustração", "Comics"],
    cover: "/Freddie-Coveer_3.png",
    url: "/Freddie - Spotlight Project_compressed.pdf",
    author: {
        url: "https://bento.me/luanagm",
        name: "Luana Góes"
    }
  },
  {
    title: "Spotlight Project #4",
    slug: "spotlight-project-5",
    description: "(Português/English) Conheça Freddie, uma incrível artista e designer de Portugal!",
    tags: ["Macapá", "Ilustração", "Comics"],
    cover: "/Freddie-Coveer_3.png",
    url: "/Freddie - Spotlight Project_compressed.pdf",
    author: {
        url: "https://bento.me/luanagm",
        name: "Luana Góes"
    }
  },
];

export function getZinePreview(slug: string) {
  return zines.find((zine) => zine.slug === slug);
}
