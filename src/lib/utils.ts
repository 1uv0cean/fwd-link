import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import portsData from "@/data/ports.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export function formatDate(date: Date, locale: "en" | "ko"): string {
  return date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getFlagFromPort(portRaw: string | { name: string } | null | undefined): string {
  if (!portRaw) return "🚢";
  
  const portName = typeof portRaw === 'object' ? portRaw.name : portRaw;
  const upperPort = portName.toUpperCase().trim();
  
  // Try exact match first
  const exactMatch = portsData.find(p => p.name === upperPort);
  if (exactMatch) return exactMatch.flag;

  // Try partial match
  const partialMatch = portsData.find(p => upperPort.includes(p.name));
  return partialMatch?.flag || "🚢";
}
