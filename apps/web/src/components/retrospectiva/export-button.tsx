"use client";

import { RetrospectiveStatistics } from "@/services/statistics-service";

interface ExportButtonProps {
  data: RetrospectiveStatistics;
}

export function ExportButton({ data }: ExportButtonProps) {
  const handleExport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retrospectiva-${new Date().getFullYear()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const jsonString = JSON.stringify(data, null, 2);
    try {
      await navigator.clipboard.writeText(jsonString);
      alert("Dados copiados para a área de transferência!");
    } catch (err) {
      console.error("Erro ao copiar:", err);
      alert("Erro ao copiar dados. Tente exportar como JSON.");
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleExport}
        className="bg-black text-white px-6 py-3 border-2 border-black font-bold hover:bg-gray-800 transition-colors"
      >
        Exportar JSON
      </button>
      <button
        onClick={handleCopy}
        className="bg-zine-yellow text-black px-6 py-3 border-2 border-black font-bold hover:bg-yellow-400 transition-colors"
      >
        Copiar Dados
      </button>
    </div>
  );
}


