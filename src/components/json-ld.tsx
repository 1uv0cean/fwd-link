import { APP_NAME, APP_URL } from "@/lib/constants";

interface JsonLdProps {
  locale?: string;
}

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: APP_URL,
    logo: `${APP_URL}/favicon.ico`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Korean"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebApplicationJsonLd({ locale = "en" }: JsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    url: APP_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description:
        locale === "ko"
          ? "5개 무료 견적서 제공"
          : "5 free quotes included",
    },
    description:
      locale === "ko"
        ? "엑셀은 이제 그만. WhatsApp 링크로 10초 만에 전문 운임 견적서를 보내세요."
        : "Stop using Excel. Send professional freight quotes via WhatsApp link in 10 seconds.",
    inLanguage: locale === "ko" ? "ko-KR" : "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
