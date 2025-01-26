import { Tables } from "../../database.types";

type Author = Tables<'authors'>;

type LibraryZinesAuthors = {
  authors: Author;
}[];

type Zine = Tables<'library_zines'> & {
  library_zines_authors: LibraryZinesAuthors;
};