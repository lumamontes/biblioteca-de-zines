"use client";

import { useState, useEffect, useCallback } from "react";
import { composable } from "composable-functions";
import { z } from "zod";
import {
  Zine,
  ZineSchema,
  defaultFormData,
  FORM_STORAGE_KEY,
} from "@/schemas/apply-zine";
import { get, set } from "@/utils/local-storage";

const validateZines = composable((zines: Zine[]) => {
  const schema = z.array(ZineSchema).min(1, "Adicione pelo menos uma zine 📚");
  const result = schema.safeParse(zines);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.errors[0]?.message || "Erro de validação");
});

export function useZineForm() {
  const [zines, setZines] = useState<Zine[]>([]);

  useEffect(() => {
    const formData = get(FORM_STORAGE_KEY, defaultFormData);
    if (formData.zines && formData.zines.length > 0) {
      setZines(formData.zines);
    }
  }, []);

  const saveToStorage = (newZines: Zine[]) => {
    const formData = get(FORM_STORAGE_KEY, defaultFormData);
    formData.zines = newZines;
    set(FORM_STORAGE_KEY, formData);
  };

  const addZine = () => {
    const newZine: Zine = {
      id: Date.now().toString(),
      title: "",
      collectionTitle: "",
      year: "",
      description: "",
      pdfUrl: "",
      coverImageUrl: "",
      pdfFile: undefined,
      coverImageFile: undefined,
    };
    const newZines = [...zines, newZine];
    setZines(newZines);
    saveToStorage(newZines);
  };

  const removeZine = (id: string) => {
    const newZines = zines.filter((zine) => zine.id !== id);
    setZines(newZines);
    saveToStorage(newZines);
  };

  const updateZine = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | File,
    name?: keyof Zine
  ) => {
    const newZines = zines.map((zine) => {
      if (zine.id !== id) return zine;
      if (e instanceof File) {
        if (!name) {
          throw new Error("Campo 'name' obrigatório ao atualizar um campo do tipo File");
        }
        return { ...zine, [name]: e };
      }

      const field = e.target.dataset.title as keyof Zine;
      const value = e.target.value;
      return { ...zine, [field]: value };
    });

    setZines(newZines);
    saveToStorage(newZines);
  };

  const clearZines = useCallback(() => {
    const emptyZines: Zine[] = [];
    setZines(emptyZines);
    saveToStorage(emptyZines);
  }, []);

  return {
    zines,
    addZine,
    removeZine,
    updateZine,
    validateZines,
    clearZines,
  };
}

