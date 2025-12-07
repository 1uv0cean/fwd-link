import { OrganizationJsonLd, WebApplicationJsonLd } from "@/components/json-ld";
import { routing } from "@/i18n/routing";
import { APP_URL, LOCALES } from "@/lib/constants";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Inter, Noto_Sans_KR } from "next/font/google";
import { notFound } from "next/navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface LocaleParams {
  locale: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> {
  const { locale } = await params;

  const isKorean = locale === "ko";

  const title = isKorean
    ? "FwdLink - 10초 만에 전문 운임 견적서"
    : "FwdLink - Professional Freight Quotes in 10 Seconds";

  const description = isKorean
    ? "엑셀은 이제 그만. WhatsApp 링크로 10초 만에 전문 운임 견적서를 보내세요."
    : "Stop using Excel. Send professional freight quotes via WhatsApp link in 10 seconds.";

  // Build alternate language links
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = `${APP_URL}/${loc}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/${locale}`,
      languages,
    },
    openGraph: {
      title,
      description,
      locale: isKorean ? "ko_KR" : "en_US",
      alternateLocale: isKorean ? ["en_US"] : ["ko_KR"],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  setRequestLocale(locale);

  // Load messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <OrganizationJsonLd />
        <WebApplicationJsonLd locale={locale} />
      </head>
      <body
        className={`${inter.variable} ${notoSansKR.variable} font-sans antialiased bg-slate-50 text-slate-800 min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
