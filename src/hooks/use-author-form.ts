"use client";

import { useState, useEffect, useCallback } from "react";
import { composable } from 'composable-functions';
import { z } from 'zod';
import { Author, AuthorSchema, FORM_STORAGE_KEY, defaultFormData } from "@/schemas/apply-zine";
import { get, set } from "@/utils/local-storage";
import { useAuthorsListEditor } from "./use-authors-list-editor";

const validateAuthors = composable((authors: Author[]) => {
  const schema = z.array(AuthorSchema).min(1, 'Pelo menos um autor é obrigatório');
  const result = schema.safeParse(authors);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.errors[0]?.message || 'Erro de validação');
});

export function useAuthorForm() {
  const [authors, setAuthorsState] = useState<Author[]>([{ name: "", socialLinks: [] }]);

  useEffect(() => {
    const formData = get(FORM_STORAGE_KEY, defaultFormData);
    if (formData.authors && formData.authors.length > 0) {
      setAuthorsState(formData.authors);
    }
  }, []);

  const setAuthors = (newAuthors: Author[]) => {
    setAuthorsState(newAuthors);
    const formData = get(FORM_STORAGE_KEY, defaultFormData);
    formData.authors = newAuthors;
    set(FORM_STORAGE_KEY, formData);
  };

  const editor = useAuthorsListEditor(authors, setAuthors);

  const clearAuthors = useCallback(() => {
    setAuthors([{ name: "", socialLinks: [] }]);
  }, []);

  return {
    authors,
    ...editor,
    validateAuthors,
    clearAuthors,
  };
}
