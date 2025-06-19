"use client";

import { useState, useEffect, useCallback } from "react";
import { composable } from 'composable-functions';
import { z } from 'zod';
import { Zine, ZineSchema, defaultFormData, FORM_STORAGE_KEY } from "@/schemas/apply-zine";
import { get, set } from "@/utils/local-storage";

const validateZines = composable((zines: Zine[]) => {
  const schema = z.array(ZineSchema).min(1, 'Pelo menos uma zine é obrigatória');
  const result = schema.safeParse(zines);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.errors[0]?.message || 'Erro de validação');
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
      pdfUrl: "",
      description: "",
      coverImageUrl: "",
    };
    const newZines = [...zines, newZine];
    setZines(newZines);
    saveToStorage(newZines);
  };

  const removeZine = (id: string) => {
    const newZines = zines.filter(zine => zine.id !== id);
    setZines(newZines);
    saveToStorage(newZines);
  };

  const updateZine = (id: string, field: keyof Omit<Zine, 'id'>, value: string) => {
    const newZines = zines.map(zine => 
      zine.id === id ? { ...zine, [field]: value } : zine
    );
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