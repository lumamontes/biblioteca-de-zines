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
  url: "https://biblioteca-de-zines.vercel.app",
  ogImage: "https://biblioteca-de-zines.vercel.app/manifest/og.jpg",
  links: {
    github: "https://github.com/lumamontes/biblioteca-de-zines",
  },
};

export const siteExternalLinks = {
  SUBMISSIONS_FORM: "https://forms.gle/ydedperb4c2WbiRW9",
  SUBMISSIONS_RESPONSES_SHEET: "https://docs.google.com/spreadsheets/d/1KxPa0oReM8I1YAqWiFKCB2aotDIZuf7d7OlpnrpDiDY/edit?gid=1274334694#gid=1274334694",
  NEWSLETTER:
    "https://substack.com/@bibliotecadezines?r=53s7hh&utm_campaign=profile&utm_medium=profile-page",
};
