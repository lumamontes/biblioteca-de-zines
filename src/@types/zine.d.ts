import { Tables } from "@/types/database.types";

type Author = Tables<'authors'>;

type LibraryZinesAuthors = {
  authors: Author;
}[];

type Zine = Tables<'library_zines'> & {
  library_zines_authors: LibraryZinesAuthors;
};

interface ZineTags {
  submission_batch_id?: string;
  categories?: string[];
  [key: string]: unknown;
}
