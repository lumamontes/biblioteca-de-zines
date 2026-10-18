import Button from "@/components/button";
import { FilteredUploads } from "@/components/dashboard/filtered-uploads";
import { WelcomeInstructions } from "@/components/dashboard/welcome-instructions";
import { getFormUploads } from "@/services/form-uploads-service";
import { getDashboardZines } from "@/services/zine-service";
import Link from "next/link";
import React from "react";
import { logout } from "../login/actions";

export default async function HomePage() {
  const [uploads, zines] = await Promise.all([
    getFormUploads(),
    getDashboardZines(),
  ]);

  return (
    <div className="flex min-h-screen min-w-0 max-w-full flex-col overflow-x-hidden mx-auto px-6">
      <header className="flex items-center justify-between py-4 border-b">
        <Link href="/" className="text-lg font-semibold">
          Biblioteca de Zines
        </Link>
        <Button className="bg-red-500 text-white px-4 py-2" onClick={logout}>
          Sair
        </Button>
      </header>

      <WelcomeInstructions uploads={uploads} />

      <FilteredUploads uploads={uploads} zines={zines} />
    </div>
  );
}
