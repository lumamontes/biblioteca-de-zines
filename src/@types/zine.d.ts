type Author = {
  authors: {
    id: string;
    uuid: string;
    name: string;
    bio: string;
    url: string;
  }
};

type Zine = {
  id: string;
  uuid: string;
  title: string;
  description: string;
  tags: string[];
  cover_image: string;
  pdf_url: string;
  library_zines_authors: Author[];
};