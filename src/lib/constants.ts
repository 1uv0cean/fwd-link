// Application Constants
export const APP_NAME = "FwdLink";
export const APP_DOMAIN = "fwdlink.io";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://fwdlink.io";

// Paywall Constants
export const FREE_QUOTA_LIMIT = 10;

// Pricing Constants
export const PRICING = {
  USD: {
    MONTHLY: 19,
    ANNUAL: 190, // ~17% discount ($228 → $190)
    MONTHLY_EQUIVALENT: 15.83,
  },
  KRW: {
    MONTHLY: 25000,
    ANNUAL: 270000, // ~10% discount (₩300,000 → ₩270,000)
    MONTHLY_EQUIVALENT: 22500,
  },
} as const;

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  FREE: "free",
  ACTIVE: "active",
  PAST_DUE: "past_due",
} as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

// Error Codes
export const ERROR_CODES = {
  LIMIT_REACHED: "LIMIT_REACHED",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
} as const;

// Locales
export const LOCALES = ["en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];



export const DEFAULT_LOCALE: Locale = "en";
