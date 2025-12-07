import { APP_URL, LOCALES } from "@/lib/constants";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = APP_URL;

  // Static pages with locale variations
  const staticPages = ["", "/upgrade"];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each static page with all locales
  for (const page of staticPages) {
    for (const locale of LOCALES) {
      const url = `${baseUrl}/${locale}${page}`;

      // Create alternates for all locales
      const languages: Record<string, string> = {};
      for (const altLocale of LOCALES) {
        languages[altLocale] = `${baseUrl}/${altLocale}${page}`;
      }

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : 0.8,
        alternates: {
          languages,
        },
      });
    }
  }

  return sitemapEntries;
}
