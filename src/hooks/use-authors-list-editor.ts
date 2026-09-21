import { Author } from "@/schemas/apply-zine";

/**
 * Add/remove/update handlers for an authors list, kept independent of where
 * the list itself lives (localStorage-backed state in useAuthorForm,
 * react-hook-form state in the admin edit dialog, etc).
 */
export function useAuthorsListEditor(
  authors: Author[],
  setAuthors: (authors: Author[]) => void,
) {
  const addAuthor = () => {
    setAuthors([...authors, { name: "", socialLinks: [] }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthorName = (index: number, name: string) => {
    const next = [...authors];
    next[index] = { ...next[index], name };
    setAuthors(next);
  };

  const addSocialLinkToAuthor = (authorIndex: number) => {
    const next = [...authors];
    next[authorIndex] = {
      ...next[authorIndex],
      socialLinks: [...(next[authorIndex].socialLinks || []), ""],
    };
    setAuthors(next);
  };

  const removeSocialLinkFromAuthor = (authorIndex: number, linkIndex: number) => {
    const next = [...authors];
    next[authorIndex] = {
      ...next[authorIndex],
      socialLinks: (next[authorIndex].socialLinks || []).filter((_, i) => i !== linkIndex),
    };
    setAuthors(next);
  };

  const updateAuthorSocialLink = (authorIndex: number, linkIndex: number, link: string) => {
    const next = [...authors];
    const links = [...(next[authorIndex].socialLinks || [])];
    links[linkIndex] = link;
    next[authorIndex] = { ...next[authorIndex], socialLinks: links };
    setAuthors(next);
  };

  return {
    addAuthor,
    removeAuthor,
    updateAuthorName,
    addSocialLinkToAuthor,
    removeSocialLinkFromAuthor,
    updateAuthorSocialLink,
  };
}
