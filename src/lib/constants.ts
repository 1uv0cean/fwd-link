// Application Constants
export const APP_NAME = "FwdLink";
export const APP_DOMAIN = "fwdlink.io";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://fwdlink.io";

// Paywall Constants
export const FREE_QUOTA_LIMIT = 5;

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  FREE: "free",
  ACTIVE: "active",
  PAST_DUE: "past_due",
} as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

// Currency
export const CURRENCIES = {
  USD: "USD",
  KRW: "KRW",
} as const;

export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES];

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

// Default currency by locale
export const LOCALE_DEFAULTS: Record<Locale, { currency: Currency }> = {
  en: { currency: "USD" },
  ko: { currency: "KRW" },
};
