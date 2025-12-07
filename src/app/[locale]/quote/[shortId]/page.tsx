import { getQuotation } from "@/actions/quotation";
import ShareButtons from "@/components/share-buttons";
import { APP_URL } from "@/lib/constants";
import { formatCurrency, formatDate, getFlagFromPort } from "@/lib/utils";
import { Anchor, Box, Calendar, Ship } from "lucide-react";
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
  
  // Use static OG image
  const ogImageUrl = `${APP_URL}/og-image.png`;

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
  
  const polFlag = getFlagFromPort(quotation.pol);
  const podFlag = getFlagFromPort(quotation.pod);

  // Generate localized share URL - always include locale prefix
  const shareUrl = `${APP_URL}/${locale}/quote/${shortId}`;

  const isKo = locale === "ko";

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-lg">
        {/* Quote Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ship className="w-5 h-5 text-blue-200" />
                <span className="text-white font-semibold tracking-tight">FwdLink</span>
              </div>
              <span className="text-blue-200 text-sm font-medium">
                {isKo ? "해상운임 견적서" : "Ocean Freight Quotation"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            
            {/* Route Section */}
            <div className="mb-6">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                {isKo ? "운송 구간" : "Route"}
              </div>
              
              <div className="flex items-stretch gap-3">
                {/* POL */}
                <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Anchor className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-slate-500">
                      {isKo ? "출발항" : "POL"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{polFlag}</span>
                    <span className="text-lg font-bold text-slate-900">{polName}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-700 font-bold">→</span>
                  </div>
                </div>

                {/* POD */}
                <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Anchor className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-slate-500">
                      {isKo ? "도착항" : "POD"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{podFlag}</span>
                    <span className="text-lg font-bold text-slate-900">{podName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-200 my-6" />

            {/* Price Section */}
            <div className="text-center mb-6">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                {isKo ? "운임" : "Freight Rate"}
              </div>
              <div className="text-4xl font-bold text-blue-900 tracking-tight">
                {formattedPrice}
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                  <Box className="w-4 h-4" />
                  {containerType}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-200 my-6" />

            {/* Details Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isKo ? "견적 유효기간" : "Validity"}
                  </span>
                </div>
                <span className="font-semibold text-slate-900">
                  {formatDate(new Date(quotation.validUntil), locale as "en" | "ko")}
                </span>
              </div>
            </div>

            {/* Remarks */}
            {quotation.remarks && quotation.remarks.length > 0 && (
              <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-100">
                <div className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-2">
                  {isKo ? "비고 / 조건" : "Terms & Remarks"}
                </div>
                <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                  {quotation.remarks}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-slate-200 my-6" />

            {/* Share Section */}
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 text-center">
                {isKo ? "견적서 공유" : "Share Quotation"}
              </div>
              <ShareButtons
                url={shareUrl}
                title={`${polName} → ${podName} - ${formattedPrice}`}
                locale={locale}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
            <p className="text-center text-xs text-slate-500">
              {isKo
                ? "본 견적서는 FwdLink를 통해 발행되었습니다"
                : "This quotation was generated via FwdLink"}
            </p>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 mb-2">
            {isKo
              ? "포워더를 위한 견적 공유 서비스"
              : "Quotation sharing for freight forwarders"}
          </p>
          <a 
            href={`/${locale}`}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            {isKo ? "나도 견적 보내기" : "Create your quote"}
            <span>→</span>
          </a>
        </div>
      </div>
    </main>
  );
}
