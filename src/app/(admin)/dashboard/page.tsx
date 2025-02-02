import Button from "@/components/button";
import { FilteredUploads } from "@/components/dashboard/filtered-uploads";
import { WelcomeInstructions } from "@/components/dashboard/welcome-instructions";
import { getFormUploads } from "@/services/form-uploads-service";
import { getPublishedZines } from "@/services/zine-service";
import Link from "next/link";
import React from "react";

export default async function HomePage() {

  const uploads = await getFormUploads();
  const publishedZines = await getPublishedZines();

  return (
    <div className="flex flex-col min-h-screen max-w-8xl mx-auto px-6">
      <header className="flex items-center justify-between py-4 border-b">
        <Link href="/" className="text-lg font-semibold">
          Biblioteca de Zines
        </Link>
        <Button asChild className="bg-red-500 text-white px-4 py-2">
          <Link href="/logout">Sair</Link>
        </Button>
      </header>

      <WelcomeInstructions
        uploads={uploads}
      />

      <FilteredUploads 
        uploads={uploads}
        publishedZines={publishedZines}
      />
    </div>
  );
}
