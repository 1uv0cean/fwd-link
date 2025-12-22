// Quotation types and constants - can be imported in both client and server components

// Container types
export type ContainerType = "20GP" | "40GP" | "40HQ";

// Incoterms options
export type Incoterms = "EXW" | "FCA" | "FOB" | "CFR" | "CIF" | "DAP" | "DDP";

// Transport mode (Ocean freight only)
export type TransportMode = "FCL" | "LCL";

// Currency
export type Currency = "USD" | "KRW";

// Port structure for analytics
export interface IPort {
  name: string;
  code: string | null;
  country: string;
}

// Quote Line Item (dynamic cost breakdown)
export interface IQuoteLineItem {
  name: string;
  amount: number;
  currency: Currency;
}

// Preset cost item names
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

// Transport mode options (Ocean freight only)
export const TRANSPORT_MODE_OPTIONS: { value: TransportMode; label: string; labelKo: string }[] = [
  { value: "FCL", label: "FCL (Full Container)", labelKo: "FCL (컨테이너)" },
  { value: "LCL", label: "LCL (Less than Container)", labelKo: "LCL (혼적)" },
];
