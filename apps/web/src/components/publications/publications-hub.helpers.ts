import type { PublicationView } from "./publications-hub.types";

/** `#novidades` or `#novidade-<slug>` open the Novidades tab; anything else keeps the default. */
export function initialViewFromHash(hash: string): PublicationView | null {
  return hash === "#novidades" || hash.startsWith("#novidade-") ? "updates" : null;
}
