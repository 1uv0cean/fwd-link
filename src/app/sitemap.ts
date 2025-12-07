import { APP_URL, LOCALES } from "@/lib/constants";
import { portNameToSlug, ports } from "@/lib/ports";
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

  // Generate entries for all rate pages (port combinations)
  for (const origin of ports) {
    for (const destination of ports) {
      if (origin.code !== destination.code) {
        const polSlug = portNameToSlug(origin.name);
        const podSlug = portNameToSlug(destination.name);
        const route = `${polSlug}-to-${podSlug}`;

        for (const locale of LOCALES) {
          const url = `${baseUrl}/${locale}/rates/${route}`;

          const languages: Record<string, string> = {};
          for (const altLocale of LOCALES) {
            languages[altLocale] = `${baseUrl}/${altLocale}/rates/${route}`;
          }

          sitemapEntries.push({
            url,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
            alternates: {
              languages,
            },
          });
        }
      }
    }
  }

  return sitemapEntries;
}
