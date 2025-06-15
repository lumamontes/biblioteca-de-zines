"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useFormSubmission() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'true') {
      setSubmitMessage("Zines enviadas com sucesso! Obrigado pela sua contribuição. 🎉");
    } else if (error === 'true') {
      setSubmitMessage("Erro ao enviar as zines. Tente novamente.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (submitMessage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [submitMessage]);

  return {
    isSubmitting,
    submitMessage,
    setIsSubmitting,
    setSubmitMessage,
  };
} 