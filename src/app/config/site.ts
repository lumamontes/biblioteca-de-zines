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
  description: "Website para arquivar e compartilhar zines de artistas independentes",
  url: "https://biblioteca-de-zines.vercel.app",
  ogImage: "https://biblioteca-de-zines.vercel.app/og.jpg",
  links: {
    github: "https://github.com/lumamontes/biblioteca-de-zines",
  },
};

export const siteExternalLinks = {
  submissionsForm: "https://forms.gle/ydedperb4c2WbiRW9",
  newsletter: "https://substack.com/@bibliotecadezines?r=53s7hh&utm_campaign=profile&utm_medium=profile-page",
}
