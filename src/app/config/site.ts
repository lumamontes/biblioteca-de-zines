export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    github: string;
  };
};

export const siteConfig: SiteConfig = {
  name: "Biblioteca de Zines",
  description:
    "Website para arquivar e compartilhar zines de artistas independentes",
  url: "https://biblioteca-de-zines.com.br",
  ogImage: "https://biblioteca-de-zines.com.br/manifest/og.jpg",
  links: {
    github: "https://github.com/lumamontes/biblioteca-de-zines",
  },
};

export const siteExternalLinks = {
  SUBMISSIONS_FORM: "https://forms.gle/ydedperb4c2WbiRW9",
  NEWSLETTER: "https://bibliotecadezines.substack.com/",
  SUBMISSIONS_RESPONSES_SHEET: "https://docs.google.com/spreadsheets/d/1KxPa0oReM8I1YAqWiFKCB2aotDIZuf7d7OlpnrpDiDY/edit?gid=1274334694#gid=1274334694",
  INSTAGRAM: "https://www.instagram.com/bibliotecadezines/",
};

export const PLACEHOLDER_COVER_IMAGE = "./zines.png"