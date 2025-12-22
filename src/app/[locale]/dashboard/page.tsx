import { getUserQuotations } from "@/actions/quotation";
import { auth, signOut } from "@/lib/auth";
import { FREE_QUOTA_LIMIT } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Copy, ExternalLink, Eye, Pencil, Plus } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import QuoteFilters from "@/components/dashboard/quote-filters";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
  const type = typeof resolvedSearchParams.type === 'string' ? resolvedSearchParams.type : undefined;

  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const result = await getUserQuotations({ search, type });

  // ... (error handling remains same)

  const { quotations = [], usageCount = 0, subscriptionStatus, subscriptionEndDate } = result;
  
  const isPro = subscriptionStatus === "active";
  const usagePercentage = Math.min((usageCount / FREE_QUOTA_LIMIT) * 100, 100);

  // Calculate remaining days if Pro
  let remainingDays = 0;
  if (subscriptionEndDate) {
    const end = new Date(subscriptionEndDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header (remains same) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* ... */}
        </div>
        
        {/* Header content ... */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">
                {locale === "ko" ? "대시보드" : "Dashboard"}
              </h1>
              {isPro && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm">
                  PRO
                </span>
              )}
            </div>
            <p className="text-slate-500 mt-1">
              {locale === "ko" ? "다시 오신 것을 환영합니다" : "Welcome back"}, {session.user.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: `/${locale}` });
              }}
            >
              <button
                type="submit"
                className="px-4 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition-colors"
              >
                {locale === "ko" ? "로그아웃" : "Sign Out"}
              </button>
            </form>
            <Link
              href={`/${locale}/quote/new`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              {locale === "ko" ? "견적서 작성" : "Create Quote"}
            </Link>
          </div>
        </div>

        {/* Usage Progress (remains same) */}
        {!isPro && (
           <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm mb-8">
             {/* ... */}
             <div className="flex justify-between items-center mb-3">
               <span className="text-slate-700 font-medium">
                 {locale === "ko" ? "무료 견적서" : "Free Quotes"}
               </span>
               <span className="text-sm text-slate-500">
                 {usageCount}/{FREE_QUOTA_LIMIT} {locale === "ko" ? "사용됨" : "used"}
               </span>
             </div>
             <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
               <div
                 className={`h-full rounded-full transition-all ${
                   usagePercentage >= 100
                     ? "bg-red-500"
                     : usagePercentage >= 80
                     ? "bg-yellow-500"
                     : "bg-blue-600"
                 }`}
                 style={{ width: `${usagePercentage}%` }}
               />
             </div>
             {usageCount >= FREE_QUOTA_LIMIT && (
               <Link
                 href={`/${locale}/upgrade`}
                 className="inline-block mt-4 text-blue-700 hover:text-blue-900 text-sm font-medium"
               >
                 {locale === "ko" ? "Pro로 업그레이드하기 →" : "Upgrade to Pro →"}
               </Link>
             )}
           </div>
        )}

        {/* Recent Quotes Header & Filter */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {locale === "ko" ? "최근 견적서" : "Recent Quotes"}
          </h2>
          <QuoteFilters 
            placeholder={locale === "ko" ? "목록 검색..." : "Search quotes..."} 
            locale={locale} 
          />
        </div>

        {quotations.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center">
            <p className="text-slate-500">
              {locale === "ko"
                ? "견적서가 없습니다. 첫 번째 견적서를 작성해보세요!"
                : "No quotes yet. Create your first one!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotations.map((quote) => (
              <div
                key={quote.shortId}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {typeof quote.pol === 'object' ? quote.pol.name : quote.pol} ➔ {typeof quote.pod === 'object' ? quote.pod.name : quote.pod}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {quote.containerType || '40HQ'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-800 mt-1">
                      {formatCurrency(quote.price)}
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                      {locale === "ko" ? "유효기간" : "Valid until"}: {formatDate(new Date(quote.validUntil), locale as "en" | "ko")}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Eye className="w-4 h-4" />
                      {quote.views} {locale === "ko" ? "회 조회" : "views"}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/${locale}/quote/${quote.shortId}/edit`}
                        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-blue-700 font-medium transition-colors"
                        title={locale === "ko" ? "수정하기" : "Edit"}
                      >
                        <Pencil className="w-4 h-4" />
                        {locale === "ko" ? "수정" : "Edit"}
                      </Link>
                      <Link
                        href={`/${locale}/quote/new?duplicate=${quote.shortId}`}
                        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-blue-700 font-medium transition-colors"
                        title={locale === "ko" ? "복제하기" : "Duplicate"}
                      >
                        <Copy className="w-4 h-4" />
                        {locale === "ko" ? "복제" : "Duplicate"}
                      </Link>
                      <Link
                        href={`/${locale}/quote/${quote.shortId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-900 font-medium"
                      >
                        {locale === "ko" ? "보기" : "View"}
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
