'use client';
import { useTransition } from "react";
import Button from "../button";
import { updateZinesWithFormUploads } from "@/app/(admin)/dashboard/actions";

export const Helpers = () => {
  const [isPending, startTransition] = useTransition();

  return (
    <section className="mt-6" data-testid="welcome-section">
      <Button
        className={
          isPending
            ? "bg-gray-500 text-white px-4 py-2 cursor-not-allowed"
            : "bg-blue-500 text-white px-4 py-2"
        }
        onClick={() => startTransition(() => updateZinesWithFormUploads())}
        disabled={isPending}
      >
        {isPending ? "Sincronizando..." : "Sincronizar zines"}
      </Button>
    </section>
  );
};

export default Helpers;
