"use client";

import { useState, useEffect } from "react";
import { Zine } from "@/types/apply-zine";

const STORAGE_KEY = "apply-zine-zines";

export function useZineForm() {
  const [zines, setZines] = useState<Zine[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedZines = JSON.parse(saved);
        if (Array.isArray(parsedZines)) {
          setZines(parsedZines);
        }
      } catch (error) {
        console.warn("Failed to parse saved zines data:", error);
      }
    }
  }, []);

  // Save to localStorage whenever zines change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zines));
  }, [zines]);

  const addZine = () => {
    const newZine: Zine = {
      id: Date.now().toString(),
      title: "",
      collectionTitle: "",
      publicationYear: "",
      pdfUrl: "",
      description: "",
      coverImageUrl: "",
    };
    setZines([...zines, newZine]);
  };

  const removeZine = (id: string) => {
    setZines(zines.filter(zine => zine.id !== id));
  };

  const updateZine = (id: string, field: keyof Omit<Zine, 'id'>, value: string) => {
    setZines(zines.map(zine => 
      zine.id === id ? { ...zine, [field]: value } : zine
    ));
  };

  const validateZines = (): string | null => {
    if (zines.length === 0) {
      return "Por favor, adicione pelo menos uma zine.";
    }

    for (const zine of zines) {
      if (!zine.title.trim() || !zine.pdfUrl.trim()) {
        return "Título e link do PDF são obrigatórios para todas as zines.";
      }
    }

    return null;
  };

  const clearZines = () => {
    setZines([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    zines,
    addZine,
    removeZine,
    updateZine,
    validateZines,
    clearZines,
  };
} 