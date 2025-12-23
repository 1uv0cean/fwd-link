import { getQuotation } from "@/actions/quotation";
import BookingRequestModal from "@/components/booking-request-modal";
import ShareButtons from "@/components/share-buttons";
import { APP_URL } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Currency, IQuoteLineItem, Section } from "@/types/quotation";
import { SECTION_INFO } from "@/types/quotation";
import { AlertCircle, Anchor, Box, Calendar, FileText, MapPin, Package, Ship, Warehouse } from "lucide-react";
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

// Helper to normalize line item (add section if missing for backward compatibility)
function normalizeLineItem(item: IQuoteLineItem | { name: string; amount: number; currency: Currency }): IQuoteLineItem {
  return {
    section: ('section' in item && item.section) ? item.section : 'FREIGHT',
    name: item.name,
    amount: item.amount,
    currency: item.currency,
  };
}

// Helper to group line items by section
function groupBySection(lineItems: IQuoteLineItem[]): Record<Section, IQuoteLineItem[]> {
  const result: Record<Section, IQuoteLineItem[]> = {
    ORIGIN: [],
    FREIGHT: [],
    DESTINATION: [],
  };
  
  for (const item of lineItems) {
    const normalizedItem = normalizeLineItem(item);
    result[normalizedItem.section].push(normalizedItem);
  }
  
  return result;
}

// Helper to calculate totals by currency
function calculateTotals(lineItems: IQuoteLineItem[]) {
  const totalUSD = lineItems
    .filter((item) => item.currency === "USD")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalKRW = lineItems
    .filter((item) => item.currency === "KRW")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalEUR = lineItems
    .filter((item) => item.currency === "EUR")
    .reduce((sum, item) => sum + item.amount, 0);
  return { totalUSD, totalKRW, totalEUR };
}

// Helper to format amount by currency
function formatAmount(amount: number, currency: Currency) {
  if (currency === "KRW") {
    return `₩${amount.toLocaleString("ko-KR")}`;
  }
  if (currency === "EUR") {
    return `€${amount.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`;
  }
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

// Helper to adjust color brightness for gradient
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

// Section table component
interface SectionTableProps {
  section: Section;
  items: IQuoteLineItem[];
  isKo: boolean;
}

function SectionTable({ section, items, isKo }: SectionTableProps) {
  if (items.length === 0) return null;
  
  const info = SECTION_INFO[section];
  
  const colorClasses = {
    blue: {
      border: "border-blue-200",
      header: "bg-blue-50 text-blue-800",
      icon: "text-blue-600",
    },
    emerald: {
      border: "border-emerald-200",
      header: "bg-emerald-50 text-emerald-800",
      icon: "text-emerald-600",
    },
    orange: {
      border: "border-orange-200",
      header: "bg-orange-50 text-orange-800",
      icon: "text-orange-600",
    },
  };
  
  const colors = colorClasses[info.color as keyof typeof colorClasses];
  const IconComponent = section === "ORIGIN" ? Warehouse : section === "FREIGHT" ? Anchor : MapPin;

  // Calculate section subtotal
  const { totalUSD, totalKRW, totalEUR } = calculateTotals(items);
  const hasMultipleTotals = [totalUSD > 0, totalKRW > 0, totalEUR > 0].filter(Boolean).length > 1;

  return (
    <div className={`rounded-lg border ${colors.border} overflow-hidden`}>
      <div className={`px-4 py-2 ${colors.header} flex items-center gap-2`}>
        <IconComponent className={`w-4 h-4 ${colors.icon}`} />
        <span className="font-medium text-sm">
          {isKo ? info.labelKo : info.label}
        </span>
      </div>
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left text-xs font-medium text-slate-600 px-4 py-2">
              {isKo ? "항목" : "Item"}
            </th>
            <th className="text-right text-xs font-medium text-slate-600 px-4 py-2">
              {isKo ? "금액" : "Amount"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm text-slate-700">{item.name}</td>
              <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                {formatAmount(item.amount, item.currency)}
              </td>
            </tr>
          ))}
        </tbody>
        {hasMultipleTotals && (
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td className="px-4 py-2 text-xs font-medium text-slate-500">
                {isKo ? "소계" : "Subtotal"}
              </td>
              <td className="px-4 py-2 text-sm text-right font-semibold text-slate-700">
                {totalUSD > 0 && <span className="mr-2">${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>}
                {totalKRW > 0 && <span className="mr-2">₩{totalKRW.toLocaleString("ko-KR")}</span>}
                {totalEUR > 0 && <span>€{totalEUR.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span>}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export default async function QuoteViewPage({ params }: PageProps) {
  const { locale, shortId } = await params;
  setRequestLocale(locale);

  const result = await getQuotation(shortId);

  if (!result.success || !result.quotation) {
    notFound();
  }

  const { quotation, ownerBranding } = result;
  const polName = typeof quotation.pol === 'object' ? quotation.pol.name : quotation.pol;
  const podName = typeof quotation.pod === 'object' ? quotation.pod.name : quotation.pod;
  const polCode = typeof quotation.pol === 'object' ? quotation.pol.code : null;
  const podCode = typeof quotation.pod === 'object' ? quotation.pod.code : null;
  const polCountry = typeof quotation.pol === 'object' ? quotation.pol.country : '';
  const podCountry = typeof quotation.pod === 'object' ? quotation.pod.country : '';
  const containerType = quotation.containerType || '40HQ';
  const incoterms = quotation.incoterms || 'FOB';
  const transportMode = quotation.transportMode || 'FCL';
  const lineItems = (quotation.lineItems || []).map(normalizeLineItem);

  // Group line items by section
  const groupedItems = groupBySection(lineItems);

  // Calculate totals from all line items
  const { totalUSD, totalKRW, totalEUR } = calculateTotals(lineItems);

  // Check if quote is expired
  const validUntilDate = new Date(quotation.validUntil);
  const isExpired = validUntilDate < new Date();

  // Generate localized share URL - always include locale prefix
  const shareUrl = `${APP_URL}/${locale}/quote/${shortId}`;

  const isKo = locale === "ko";

  // Branding colors
  const brandColor = ownerBranding?.primaryColor || "#1e3a8a";
  const brandColorLight = adjustColor(brandColor, 15);
  const displayName = ownerBranding?.companyName || "FwdLink";

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-lg">
        {/* Quote Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          
          {/* Header - Custom Branding */}
          <div
            className="px-6 py-5"
            style={{ background: `linear-gradient(to right, ${brandColor}, ${brandColorLight})` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {ownerBranding?.logoBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ownerBranding.logoBase64}
                    alt={displayName}
                    className="w-7 h-7 object-contain bg-white rounded p-0.5"
                  />
                ) : (
                  <Ship className="w-5 h-5 text-white/80" />
                )}
                <span className="text-white font-semibold tracking-tight">{displayName}</span>
              </div>
              <span className="text-white/80 text-sm font-medium">
                {isKo ? "운임 견적서" : "Freight Quotation"}
              </span>
            </div>
          </div>

          {/* Expired Warning Banner */}
          {isExpired && (
            <div className="bg-red-50 border-b border-red-100 px-6 py-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium text-sm">
                  {isKo ? "🚫 만료된 견적서입니다" : "🚫 This quote has expired"}
                </span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            
            {/* Badges Row - Transport Mode & Incoterms */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                <Package className="w-4 h-4" />
                {transportMode}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
                <FileText className="w-4 h-4" />
                {incoterms}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                <Box className="w-4 h-4" />
                {containerType}
              </span>
            </div>

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
                    {polCountry && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold">
                        {polCountry}
                      </span>
                    )}
                    <span className="text-lg font-bold text-slate-900">{polName}</span>
                  </div>
                  {polCode && (
                    <span className="mt-1 inline-block px-2 py-0.5 rounded text-xs font-mono text-slate-500 bg-slate-100">
                      {polCode}
                    </span>
                  )}
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
                    {podCountry && (
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold">
                        {podCountry}
                      </span>
                    )}
                    <span className="text-lg font-bold text-slate-900">{podName}</span>
                  </div>
                  {podCode && (
                    <span className="mt-1 inline-block px-2 py-0.5 rounded text-xs font-mono text-slate-500 bg-slate-100">
                      {podCode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-200 my-6" />

            {/* Cost Breakdown - 3 Sections */}
            {lineItems.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                  {isKo ? "비용 내역" : "Cost Breakdown"}
                </div>
                
                {/* Origin Section */}
                <SectionTable section="ORIGIN" items={groupedItems.ORIGIN} isKo={isKo} />
                
                {/* Freight Section */}
                <SectionTable section="FREIGHT" items={groupedItems.FREIGHT} isKo={isKo} />
                
                {/* Destination Section */}
                <SectionTable section="DESTINATION" items={groupedItems.DESTINATION} isKo={isKo} />
              </div>
            )}

            {/* Total Section */}
            <div className="text-center mb-6 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                {isKo ? "합계" : "Total"}
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {totalUSD > 0 && (
                  <div className="text-3xl font-bold text-blue-900">
                    ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    <span className="text-sm font-normal text-slate-500 ml-1">USD</span>
                  </div>
                )}
                {totalKRW > 0 && (
                  <div className="text-3xl font-bold text-blue-900">
                    ₩{totalKRW.toLocaleString("ko-KR")}
                    <span className="text-sm font-normal text-slate-500 ml-1">KRW</span>
                  </div>
                )}
                {totalEUR > 0 && (
                  <div className="text-3xl font-bold text-blue-900">
                    €{totalEUR.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                    <span className="text-sm font-normal text-slate-500 ml-1">EUR</span>
                  </div>
                )}
                {totalUSD === 0 && totalKRW === 0 && totalEUR === 0 && (
                  <div className="text-3xl font-bold text-blue-900">
                    {formatCurrency(quotation.price)}
                  </div>
                )}
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
                <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>
                  {formatDate(validUntilDate, locale as "en" | "ko")}
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

            {/* Booking Request Section */}
            <div className="mb-6">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 text-center">
                {isKo ? "부킹 요청" : "Request Booking"}
              </div>
              <BookingRequestModal
                quoteId={shortId}
                route={`${polName} → ${podName}`}
                locale={locale}
              />
            </div>

            {/* Share Section */}
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 text-center">
                {isKo ? "견적서 공유" : "Share Quotation"}
              </div>
              <ShareButtons
                url={shareUrl}
                title={`${polName} → ${podName} - ${formatCurrency(quotation.price)}`}
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
