"use client";

import { useState, useEffect, useCallback } from "react";
import { composable } from 'composable-functions';
import { AdditionalInfo, AdditionalInfoSchema, FORM_STORAGE_KEY, defaultFormData } from "@/schemas/apply-zine";
import { get, set } from "@/utils/local-storage";

const validateAdditionalInfo = composable((additionalInfo: AdditionalInfo) => {
  const result = AdditionalInfoSchema.safeParse(additionalInfo);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.errors[0]?.message || 'Erro de validação');
});

export function useAdditionalInfoForm() {
  const [contactEmail, setContactEmail] = useState<string>("");

  useEffect(() => {
    const formData = get(FORM_STORAGE_KEY, defaultFormData);
    if (formData.additionalInfo.contactEmail) {
      setContactEmail(formData.additionalInfo.contactEmail);
    }
  }, []);

  const handleContactEmailChange = (value: string) => {
    setContactEmail(value);
    
    const formData = get(FORM_STORAGE_KEY, defaultFormData);
    formData.additionalInfo = {
      contactEmail: value,
    };
    set(FORM_STORAGE_KEY, formData);
  };


  const clearAdditionalInfo = useCallback(() => {
    setContactEmail("");
    const formData = get(FORM_STORAGE_KEY, defaultFormData);
    formData.additionalInfo = {
      contactEmail: ''
    };
    set(FORM_STORAGE_KEY, formData);
  }, []);

  return {
    contactEmail,
    setContactEmail: handleContactEmailChange,
    validateAdditionalInfo,
    clearAdditionalInfo,
  };
} 