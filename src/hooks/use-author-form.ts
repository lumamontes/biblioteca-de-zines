"use client";

import { useState, useEffect, useCallback } from "react";
import { composable } from 'composable-functions';
import { z } from 'zod';
import { Author, AuthorSchema, FORM_STORAGE_KEY, defaultFormData } from "@/schemas/apply-zine";
import { get, set } from "@/utils/local-storage";

const validateAuthors = composable((authors: Author[]) => {
  const schema = z.array(AuthorSchema).min(1, 'Pelo menos um autor é obrigatório');
  const result = schema.safeParse(authors);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.errors[0]?.message || 'Erro de validação');
});

export function useAuthorForm() {
  const [authors, setAuthors] = useState<Author[]>([{ name: "", socialLinks: [] }]);

  useEffect(() => {
    const formData = get(FORM_STORAGE_KEY, defaultFormData);
    if (formData.authors && formData.authors.length > 0) {
      setAuthors(formData.authors);
    }
  }, []);

  const saveToStorage = (newAuthors: Author[]) => {
    const formData = get(FORM_STORAGE_KEY, defaultFormData);
    formData.authors = newAuthors;
    set(FORM_STORAGE_KEY, formData);
  };

  const addAuthor = () => {
    const newAuthors = [...authors, { name: "", socialLinks: [] }];
    setAuthors(newAuthors);
    saveToStorage(newAuthors);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      const newAuthors = authors.filter((_, i) => i !== index);
      setAuthors(newAuthors);
      saveToStorage(newAuthors);
    }
  };

  const updateAuthorName = (index: number, name: string) => {
    const newAuthors = [...authors];
    newAuthors[index].name = name;
    setAuthors(newAuthors);
    saveToStorage(newAuthors);
  };

  const addSocialLinkToAuthor = (authorIndex: number) => {
    const newAuthors = [...authors];
    if (newAuthors[authorIndex].socialLinks.length === 0) {
      newAuthors[authorIndex].socialLinks = [''];
    } else {
      newAuthors[authorIndex].socialLinks.push('');
    }
    setAuthors(newAuthors);
    saveToStorage(newAuthors);
  };

  const removeSocialLinkFromAuthor = (authorIndex: number, linkIndex: number) => {
    const newAuthors = [...authors];
    if (newAuthors[authorIndex].socialLinks.length > 0) {
      newAuthors[authorIndex].socialLinks = newAuthors[authorIndex].socialLinks.filter((_, i) => i !== linkIndex);
      setAuthors(newAuthors);
      saveToStorage(newAuthors);
    }
  };

  const updateAuthorSocialLink = (authorIndex: number, linkIndex: number, link: string) => {
    const newAuthors = [...authors];
    if (newAuthors[authorIndex].socialLinks.length === 0) {
      newAuthors[authorIndex].socialLinks = [link];
    } else {
      newAuthors[authorIndex].socialLinks[linkIndex] = link;
    }
    setAuthors(newAuthors);
    saveToStorage(newAuthors);
  };

  const clearAuthors = useCallback(() => {
    const defaultAuthors = [{ name: "", socialLinks: [] }];
    setAuthors(defaultAuthors);
    saveToStorage(defaultAuthors);
  }, []);

  return {
    authors,
    addAuthor,
    removeAuthor,
    updateAuthorName,
    addSocialLinkToAuthor,
    removeSocialLinkFromAuthor,
    updateAuthorSocialLink,
    validateAuthors,
    clearAuthors,
  };
} 