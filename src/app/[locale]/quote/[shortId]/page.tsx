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
  const result = await getQuotation(shortId, { incrementView: false });

  if (!result.success || !result.quotation) {
    return {
      title: "Quote Not Found",
    };
  }

  const { quotation } = result;
  const formattedPrice = formatCurrency(quotation.price);
  
  // Build OG image URL with query params for edge runtime
  const ogParams = new URLSearchParams({
    pol: typeof quotation.pol === 'object' ? quotation.pol.name : quotation.pol,
    pod: typeof quotation.pod === 'object' ? quotation.pod.name : quotation.pod,
    price: quotation.price.toString(),
    validUntil: quotation.validUntil,
  });
  const ogImageUrl = `${APP_URL}/api/og/${shortId}?${ogParams.toString()}`;

  const polName = typeof quotation.pol === 'object' ? quotation.pol.name : quotation.pol;
  const podName = typeof quotation.pod === 'object' ? quotation.pod.name : quotation.pod;

  return {
    title: `${polName} ➤ ${podName} - ${formattedPrice}`,
    description: `Freight quote from ${polName} to ${podName} for ${formattedPrice}`,
    openGraph: {
      title: `${polName} ➤ ${podName} - ${formattedPrice}`,
      description: `Freight quote valid until ${formatDate(new Date(quotation.validUntil), "en")}`,
      images: [ogImageUrl],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${polName} ➤ ${podName} - ${formattedPrice}`,
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
  const formattedPrice = formatCurrency(quotation.price);
  const polName = typeof quotation.pol === 'object' ? quotation.pol.name : quotation.pol;
  const podName = typeof quotation.pod === 'object' ? quotation.pod.name : quotation.pod;
  const containerType = quotation.containerType || '40HQ';
  
  // Generate localized share URL
  const pathPrefix = locale === "en" ? "" : `/${locale}`;
  const shareUrl = `${APP_URL}${pathPrefix}/q/${shortId}`;

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Quote Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
          {/* Brand */}
          <div className="text-center mb-6">
            <span className="text-blue-900 font-semibold">FwdLink</span>
          </div>

          {/* Route */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <Ship className="w-6 h-6 text-slate-500 mx-auto mb-1" />
              <span className="text-2xl font-bold text-slate-900">{polName}</span>
            </div>
            <span className="text-3xl text-blue-800">➤</span>
            <div className="text-center">
              <Ship className="w-6 h-6 text-slate-500 mx-auto mb-1" />
              <span className="text-2xl font-bold text-slate-900">{podName}</span>
            </div>
          </div>

          {/* Container Type Badge */}
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
              {containerType}
            </span>
          </div>

          {/* Price - The Star */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-blue-900">
              {formattedPrice}
            </div>
          </div>

          {/* Details */}
          <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {locale === "ko" ? "유효기간" : "Valid until"}
              </span>
            </div>
            <span className="font-medium text-slate-800">
              {formatDate(new Date(quotation.validUntil), locale as "en" | "ko")}
            </span>
          </div>

          {/* Views */}
          <div className="flex items-center justify-center gap-2 text-slate-500 mb-6">
            <Eye className="w-4 h-4" />
            <span className="text-sm">
              {quotation.views} {locale === "ko" ? "회 조회됨" : "views"}
            </span>
          </div>

          {/* Share Buttons */}
          <ShareButtons
            url={shareUrl}
            title={`${polName} ➤ ${podName} - ${formattedPrice}`}
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
