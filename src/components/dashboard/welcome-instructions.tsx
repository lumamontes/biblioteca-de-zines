import Link from "next/link";
import { Tables } from "../../../database.types";
import { siteExternalLinks } from "@/app/config/site";

export const WelcomeInstructions = ({
  uploads,
}: {
  uploads: Tables<"form_uploads">[];
}) => {
  const lastUpload = uploads.sort((a, b) => b.id - a.id)[0];

  return (
    <section className="mt-6" data-testId="welcome-section">
      <h1 className="text-2xl font-semibold">Zines Recebidas</h1>
      <p className="text-gray-500 mt-2">
        Visualize as zines enviadas pelo Google Forms e publique-as no site.
      </p>
      <p className="text-gray-500 mt-2">
        Última sincronização:{" "}
        {lastUpload
          ? new Date(lastUpload?.created_at ?? "").toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
              timeZone: "UTC",
            })
          : "Nenhuma sincronização disponível"}
      </p>
      <p className="mt-2">
        Caso queira visualizar as respostas diretamente no Google Forms, clique{" "}
        <Link
          target="_blank"
          href={siteExternalLinks.SUBMISSIONS_RESPONSES_SHEET}
          className="text-blue-600 hover:underline"
        >
          aqui
        </Link>
        .
      </p>
    </section>
  );
};
