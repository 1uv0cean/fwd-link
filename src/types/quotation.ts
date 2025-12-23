// Quotation types and constants - can be imported in both client and server components

// Container types
export type ContainerType = "20GP" | "40GP" | "40HQ";

// Incoterms options
export type Incoterms = "EXW" | "FCA" | "FOB" | "CFR" | "CIF" | "DAP" | "DDP";

// Transport mode (Ocean + Air freight)
export type TransportMode = "FCL" | "LCL" | "AIR";

// Currency
export type Currency = "USD" | "KRW" | "EUR";

// Cost categorization sections
export type Section = "ORIGIN" | "FREIGHT" | "DESTINATION";

// Port structure for analytics
export interface IPort {
  name: string;
  code: string | null;
  country: string;
}

// Quote Line Item (dynamic cost breakdown with section)
export interface IQuoteLineItem {
  section: Section;
  name: string;
  amount: number;
  currency: Currency;
}

// Preset cost item names by section
export const PRESET_COST_ITEMS_BY_SECTION: Record<Section, string[]> = {
  ORIGIN: [
    "Trucking (Origin)",
    "THC (Origin)",
    "Wharfage (Origin)",
    "Doc Fee (Origin)",
    "Customs (Origin)",
    "Handling (Origin)",
  ],
  FREIGHT: [
    "Ocean Freight",
    "BAF",
    "CAF",
    "PSS",
    "GRI",
    "EBS",
    "LSS",
    "Seal Fee",
  ],
  DESTINATION: [
    "THC (Destination)",
    "Wharfage (Destination)",
    "Doc Fee (Destination)",
    "D/O Fee",
    "Customs (Destination)",
    "Trucking (Destination)",
    "Storage",
  ],
};

// Legacy: Flat list of preset cost items (for backward compatibility)
export const PRESET_COST_ITEMS = [
  "OF",           // Ocean Freight
  "THC",          // Terminal Handling Charge
  "Doc Fee",      // Document Fee
  "Wharfage",     // 부두사용료
  "Seal Fee",     // 봉인료
  "Trucking",     // Drayage/내륙운송비
  "Clearance",    // 통관비
  "Storage",      // 창고비
] as const;

// Incoterms options list
export const INCOTERMS_OPTIONS: Incoterms[] = ["EXW", "FCA", "FOB", "CFR", "CIF", "DAP", "DDP"];

// Transport mode options (Ocean + Air freight)
export const TRANSPORT_MODE_OPTIONS: { value: TransportMode; label: string; labelKo: string }[] = [
  { value: "FCL", label: "FCL (Full Container)", labelKo: "FCL (컨테이너)" },
  { value: "LCL", label: "LCL (Less than Container)", labelKo: "LCL (혼적)" },
  { value: "AIR", label: "AIR (Air Freight)", labelKo: "AIR (항공)" },
];

// Section display info
export const SECTION_INFO: Record<Section, { label: string; labelKo: string; color: string }> = {
  ORIGIN: { label: "Origin Charges", labelKo: "출발지 비용", color: "blue" },
  FREIGHT: { label: "Main Freight", labelKo: "운임", color: "emerald" },
  DESTINATION: { label: "Destination Charges", labelKo: "도착지 비용", color: "orange" },
};
