import { APP_NAME, APP_URL, LOCALES } from "@/lib/constants";
import { getCountryName, getPortBySlug, portNameToSlug, ports } from "@/lib/ports";
import { ArrowRight, MapPin, Ship } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface RatePageParams {
  locale: string;
  "pol-to-pod": string;
}

// Generate all port combination pages at build time
export function generateStaticParams() {
  const params: { locale: string; "pol-to-pod": string }[] = [];

  for (const locale of LOCALES) {
    for (const origin of ports) {
      for (const destination of ports) {
        if (origin.code !== destination.code) {
          const polSlug = portNameToSlug(origin.name);
          const podSlug = portNameToSlug(destination.name);
          params.push({
            locale,
            "pol-to-pod": `${polSlug}-to-${podSlug}`,
          });
        }
      }
    }
  }

  return params;
}

// Generate dynamic metadata for each page
export async function generateMetadata({
  params,
}: {
  params: Promise<RatePageParams>;
}): Promise<Metadata> {
  const { locale, "pol-to-pod": route } = await params;
  const [polSlug, podSlug] = route.split("-to-");

  const origin = getPortBySlug(polSlug);
  const destination = getPortBySlug(podSlug);

  if (!origin || !destination) {
    return { title: "Not Found" };
  }

  const isKorean = locale === "ko";
  const originCountry = getCountryName(origin.country);
  const destCountry = getCountryName(destination.country);

  const title = isKorean
    ? `${origin.name}에서 ${destination.name} 해상 운임 | ${APP_NAME}`
    : `${origin.name} to ${destination.name} Freight Rate | ${APP_NAME}`;

  const description = isKorean
    ? `${origin.name}(${originCountry})에서 ${destination.name}(${destCountry})까지의 해상 운임 견적을 즉시 받아보세요. 포워더를 위한 전문 운임 견적 도구.`
    : `Get instant ocean freight quotes from ${origin.name}, ${originCountry} to ${destination.name}, ${destCountry}. Professional freight quotation tool for forwarders.`;

  const canonicalUrl = `${APP_URL}/${locale}/rates/${route}`;

  // Build alternate language links
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = `${APP_URL}/${loc}/rates/${route}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: isKorean ? "ko_KR" : "en_US",
      alternateLocale: isKorean ? ["en_US"] : ["ko_KR"],
      siteName: APP_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RatePage({
  params,
}: {
  params: Promise<RatePageParams>;
}) {
  const { locale, "pol-to-pod": route } = await params;
  setRequestLocale(locale);

  const [polSlug, podSlug] = route.split("-to-");

  const origin = getPortBySlug(polSlug);
  const destination = getPortBySlug(podSlug);

  if (!origin || !destination) {
    notFound();
  }

  const isKorean = locale === "ko";
  const originCountry = getCountryName(origin.country);
  const destCountry = getCountryName(destination.country);

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: isKorean
      ? `${origin.name}에서 ${destination.name} 해상 운임`
      : `Ocean Freight from ${origin.name} to ${destination.name}`,
    description: isKorean
      ? `${origin.name}에서 ${destination.name}까지의 해상 운임 견적 서비스`
      : `Ocean freight quotation service from ${origin.name} to ${destination.name}`,
    provider: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
    },
    areaServed: [
      {
        "@type": "Place",
        name: `${origin.name}, ${originCountry}`,
      },
      {
        "@type": "Place",
        name: `${destination.name}, ${destCountry}`,
      },
    ],
    serviceType: "Ocean Freight",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            {/* Route Icon */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex flex-col items-center">
                <span className="text-4xl mb-2">{origin.flag}</span>
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-0.5 bg-blue-300" />
                <Ship className="w-8 h-8 text-blue-600" />
                <div className="w-16 h-0.5 bg-blue-300" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl mb-2">{destination.flag}</span>
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {isKorean ? (
                <>
                  <span className="text-blue-600">{origin.name}</span>
                  {" → "}
                  <span className="text-green-600">{destination.name}</span>
                  <br />
                  해상 운임
                </>
              ) : (
                <>
                  Ocean Freight Rate from{" "}
                  <span className="text-blue-600">{origin.name}</span>
                  {" to "}
                  <span className="text-green-600">{destination.name}</span>
                </>
              )}
            </h1>

            <p className="text-lg text-slate-600 mb-4">
              {isKorean
                ? `${originCountry} ${origin.name}에서 ${destCountry} ${destination.name}까지`
                : `From ${origin.name}, ${originCountry} to ${destination.name}, ${destCountry}`}
            </p>

            <p className="text-md text-slate-500 mb-8 max-w-2xl mx-auto">
              {isKorean
                ? "FwdLink에서 즉시 견적을 확인하세요. 10초 만에 전문 운임 견적서를 생성할 수 있습니다."
                : "Check instant quotes via FwdLink. Create professional freight quotations in just 10 seconds."}
            </p>

            {/* CTA Button */}
            <Link
              href={`/${locale}/auth/signin`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-900 text-white font-semibold text-lg hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              {isKorean ? "무료 견적 생성하기" : "Get Free Quote Now"}
              <ArrowRight className="w-5 h-5" />
            </Link>

            <p className="text-sm text-slate-400 mt-4">
              {isKorean
                ? "가입 후 무료로 10개의 견적 제공"
                : "10 free quotes after sign up"}
            </p>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 px-4 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8 text-slate-900">
              {isKorean
                ? "이 항로에 대해"
                : "About This Route"}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                <h3 className="font-semibold text-lg mb-2 text-blue-900">
                  {isKorean ? "출발항" : "Port of Loading"}
                </h3>
                <p className="text-2xl font-bold text-blue-700 mb-1">
                  {origin.flag} {origin.name}
                </p>
                <p className="text-slate-600">{originCountry}</p>
                <p className="text-sm text-slate-500 mt-2">
                  UN/LOCODE: {origin.code}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-green-50 border border-green-100">
                <h3 className="font-semibold text-lg mb-2 text-green-900">
                  {isKorean ? "도착항" : "Port of Discharge"}
                </h3>
                <p className="text-2xl font-bold text-green-700 mb-1">
                  {destination.flag} {destination.name}
                </p>
                <p className="text-slate-600">{destCountry}</p>
                <p className="text-sm text-slate-500 mt-2">
                  UN/LOCODE: {destination.code}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-slate-200 bg-slate-50">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500">© 2025 {APP_NAME}. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}`}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                {isKorean ? "홈" : "Home"}
              </Link>
              <Link
                href={locale === "ko" ? `/en/rates/${route}` : `/ko/rates/${route}`}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                {locale === "ko" ? "English" : "한국어"}
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
