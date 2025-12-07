import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/constants";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});

export type { Locale };
