import { permanentRedirect } from "next/navigation";

export default function UpdatesRedirect() {
  permanentRedirect("/publicacoes");
}
