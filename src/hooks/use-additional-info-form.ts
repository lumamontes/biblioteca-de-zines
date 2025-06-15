"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "apply-zine-additional-info";

export function useAdditionalInfoForm() {
  const [telegramInterest, setTelegramInterest] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        if (parsedData.telegramInterest) {
          setTelegramInterest(parsedData.telegramInterest);
        }
        if (parsedData.contactEmail) {
          setContactEmail(parsedData.contactEmail);
        }
      } catch (error) {
        console.warn("Failed to parse saved additional info data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      telegramInterest,
      contactEmail,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [telegramInterest, contactEmail]);

  const validateAdditionalInfo = (): string | null => {
    if (contactEmail && !isValidEmail(contactEmail)) {
      return "Por favor, insira um email válido.";
    }
    return null;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const clearAdditionalInfo = useCallback(() => {
    setTelegramInterest("");
    setContactEmail("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    telegramInterest,
    contactEmail,
    setTelegramInterest,
    setContactEmail,
    validateAdditionalInfo,
    clearAdditionalInfo,
  };
} 