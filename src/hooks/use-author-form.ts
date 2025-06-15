"use client";

import { useState, useEffect, useCallback } from "react";
import { Author } from "@/types/apply-zine";

const STORAGE_KEY = "apply-zine-authors";

export function useAuthorForm() {
  const [authors, setAuthors] = useState<Author[]>([{ name: "", socialLinks: [""] }]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedAuthors = JSON.parse(saved);
        if (Array.isArray(parsedAuthors) && parsedAuthors.length > 0) {
          setAuthors(parsedAuthors);
        }
      } catch (error) {
        console.warn("Failed to parse saved authors data:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authors));
  }, [authors]);

  const addAuthor = () => {
    setAuthors([...authors, { name: "", socialLinks: [""] }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthorName = (index: number, name: string) => {
    const newAuthors = [...authors];
    newAuthors[index].name = name;
    setAuthors(newAuthors);
  };

  const addSocialLinkToAuthor = (authorIndex: number) => {
    const newAuthors = [...authors];
    newAuthors[authorIndex].socialLinks.push("");
    setAuthors(newAuthors);
  };

  const removeSocialLinkFromAuthor = (authorIndex: number, linkIndex: number) => {
    const newAuthors = [...authors];
    if (newAuthors[authorIndex].socialLinks.length > 1) {
      newAuthors[authorIndex].socialLinks = newAuthors[authorIndex].socialLinks.filter((_, i) => i !== linkIndex);
      setAuthors(newAuthors);
    }
  };

  const updateAuthorSocialLink = (authorIndex: number, linkIndex: number, link: string) => {
    const newAuthors = [...authors];
    newAuthors[authorIndex].socialLinks[linkIndex] = link;
    setAuthors(newAuthors);
  };

  const validateAuthors = (): string | null => {
    if (authors.length === 0 || authors[0].name.trim() === "") {
      return "Por favor, adicione pelo menos um autor.";
    }
    return null;
  };

  const clearAuthors = useCallback(() => {
    setAuthors([{ name: "", socialLinks: [""] }]);
    localStorage.removeItem(STORAGE_KEY);
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