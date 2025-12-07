import portsData from "@/data/ports.json";

export const ports = portsData;
export type Port = (typeof portsData)[number];

/**
 * Get port by UN/LOCODE (e.g., "KRPUS" for Busan)
 */
export function getPortByCode(code: string): Port | undefined {
  return ports.find((p) => p.code === code.toUpperCase());
}

/**
 * Convert port name to URL-friendly slug
 * "LOS ANGELES" -> "los-angeles"
 */
export function portNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Get port by URL slug
 * "los-angeles" -> Port with name "LOS ANGELES"
 */
export function getPortBySlug(slug: string): Port | undefined {
  const searchName = slug.replace(/-/g, " ").toUpperCase();
  return ports.find((p) => p.name === searchName);
}

/**
 * Get country name from country code
 */
export function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    AE: "United Arab Emirates",
    AU: "Australia",
    BE: "Belgium",
    BR: "Brazil",
    CA: "Canada",
    CN: "China",
    DE: "Germany",
    ES: "Spain",
    FR: "France",
    GB: "United Kingdom",
    GR: "Greece",
    HK: "Hong Kong",
    ID: "Indonesia",
    IN: "India",
    IT: "Italy",
    JP: "Japan",
    KR: "South Korea",
    MX: "Mexico",
    MY: "Malaysia",
    NL: "Netherlands",
    PH: "Philippines",
    SA: "Saudi Arabia",
    SG: "Singapore",
    TH: "Thailand",
    TW: "Taiwan",
    US: "United States",
    VN: "Vietnam",
    ZA: "South Africa",
  };
  return countryNames[countryCode] || countryCode;
}

/**
 * Generate all port pair combinations for static params
 * Returns pairs where origin !== destination
 */
export function generatePortPairs(): { pol: string; pod: string }[] {
  const pairs: { pol: string; pod: string }[] = [];

  for (const origin of ports) {
    for (const destination of ports) {
      if (origin.code !== destination.code) {
        pairs.push({
          pol: portNameToSlug(origin.name),
          pod: portNameToSlug(destination.name),
        });
      }
    }
  }

  return pairs;
}
