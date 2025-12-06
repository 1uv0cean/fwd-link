import { getQuotation } from "@/actions/quotation";
import ShareButtons from "@/components/share-buttons";
import { APP_URL } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, Eye, Ship } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; shortId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shortId } = await params;
  const result = await getQuotation(shortId);

  if (!result.success || !result.quotation) {
    return {
      title: "Quote Not Found",
    };
  }

  const { quotation } = result;
  const formattedPrice = formatCurrency(quotation.price, quotation.currency);
  
  // Build OG image URL with query params for edge runtime
  const ogParams = new URLSearchParams({
    pol: quotation.pol,
    pod: quotation.pod,
    price: quotation.price.toString(),
    currency: quotation.currency,
    validUntil: quotation.validUntil,
  });
  const ogImageUrl = `${APP_URL}/api/og/${shortId}?${ogParams.toString()}`;

  return {
    title: `${quotation.pol} ➔ ${quotation.pod} - ${formattedPrice}`,
    description: `Freight quote from ${quotation.pol} to ${quotation.pod} for ${formattedPrice}`,
    openGraph: {
      title: `${quotation.pol} ➔ ${quotation.pod} - ${formattedPrice}`,
      description: `Freight quote valid until ${formatDate(new Date(quotation.validUntil), "en")}`,
      images: [ogImageUrl],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${quotation.pol} ➔ ${quotation.pod} - ${formattedPrice}`,
      images: [ogImageUrl],
    },
  };
}

export default async function QuoteViewPage({ params }: PageProps) {
  const { locale, shortId } = await params;
  setRequestLocale(locale);

  const result = await getQuotation(shortId);

  if (!result.success || !result.quotation) {
    notFound();
  }

  const { quotation } = result;
  const formattedPrice = formatCurrency(quotation.price, quotation.currency);
  
  // Generate localized share URL
  const pathPrefix = locale === "en" ? "" : `/${locale}`;
  const shareUrl = `${APP_URL}${pathPrefix}/q/${shortId}`;

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Quote Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl">
          {/* Brand */}
          <div className="text-center mb-6">
            <span className="text-blue-400 font-semibold">FwdLink</span>
          </div>

          {/* Route */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <Ship className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <span className="text-2xl font-bold">{quotation.pol}</span>
            </div>
            <span className="text-3xl text-blue-400">➔</span>
            <div className="text-center">
              <Ship className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <span className="text-2xl font-bold">{quotation.pod}</span>
            </div>
          </div>

          {/* Price - The Star */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {formattedPrice}
            </div>
          </div>

          {/* Details */}
          <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50 mb-6">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {locale === "ko" ? "유효기간" : "Valid until"}
              </span>
            </div>
            <span className="font-medium">
              {formatDate(new Date(quotation.validUntil), locale as "en" | "ko")}
            </span>
          </div>

          {/* Views */}
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-6">
            <Eye className="w-4 h-4" />
            <span className="text-sm">
              {quotation.views} {locale === "ko" ? "회 조회됨" : "views"}
            </span>
          </div>

          {/* Share Buttons */}
          <ShareButtons
            url={shareUrl}
            title={`${quotation.pol} ➔ ${quotation.pod} - ${formattedPrice}`}
            locale={locale}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          {locale === "ko"
            ? "FwdLink로 10초 만에 견적서를 보내세요"
            : "Send quotes in 10 seconds with FwdLink"}
        </p>
      </div>
    </main>
  );
}
