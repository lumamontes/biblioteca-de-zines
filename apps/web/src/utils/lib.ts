import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes conditionally.
 * Uses clsx for conditionals and tailwind-merge to prevent class conflicts.
 */
export function cn(...classes: (string | boolean | undefined)[]) {
  return twMerge(clsx(classes));
}
