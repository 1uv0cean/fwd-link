import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === "KRW") {
    return `₩${amount.toLocaleString("ko-KR")}`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

export function formatDate(date: Date, locale: "en" | "ko"): string {
  return date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
