export interface Author {
  name: string;
  socialLinks: string[];
}

export interface Zine {
  id: string;
  title: string;
  collectionTitle: string;
  publicationYear: string;
  pdfUrl: string;
  description: string;
  coverImageUrl: string;
} 