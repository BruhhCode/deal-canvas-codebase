import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Rounds a count down to a friendly, non-exact headline figure — e.g. 1358 -> "1.3k+", 62 -> "60+". */
export function approxCount(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 100) / 10}k+`;
  if (n >= 10) return `${Math.floor(n / 10) * 10}+`;
  return `${n}+`;
}
