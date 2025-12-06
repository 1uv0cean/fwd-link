import { getUserQuotations } from "@/actions/quotation";
import { auth } from "@/lib/auth";
import { FREE_QUOTA_LIMIT } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExternalLink, Eye, Plus } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const result = await getUserQuotations();

  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Failed to load dashboard</p>
      </div>
    );
  }

  const { quotations = [], usageCount = 0 } = result;
  const usagePercentage = Math.min((usageCount / FREE_QUOTA_LIMIT) * 100, 100);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {locale === "ko" ? "대시보드" : "Dashboard"}
            </h1>
            <p className="text-slate-400 mt-1">
              {locale === "ko" ? "다시 오신 것을 환영합니다" : "Welcome back"}, {session.user.name}
            </p>
          </div>

          <Link
            href={`/${locale}/quote/new`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            {locale === "ko" ? "견적서 작성" : "Create Quote"}
          </Link>
        </div>

        {/* Usage Progress */}
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-300 font-medium">
              {locale === "ko" ? "무료 견적서" : "Free Quotes"}
            </span>
            <span className="text-sm text-slate-400">
              {usageCount}/{FREE_QUOTA_LIMIT} {locale === "ko" ? "사용됨" : "used"}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePercentage >= 100
                  ? "bg-red-500"
                  : usagePercentage >= 80
                  ? "bg-yellow-500"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500"
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          {usageCount >= FREE_QUOTA_LIMIT && (
            <Link
              href={`/${locale}/upgrade`}
              className="inline-block mt-4 text-blue-400 hover:text-blue-300 text-sm"
            >
              {locale === "ko" ? "Pro로 업그레이드하기 →" : "Upgrade to Pro →"}
            </Link>
          )}
        </div>

        {/* Recent Quotes */}
        <h2 className="text-xl font-semibold mb-4">
          {locale === "ko" ? "최근 견적서" : "Recent Quotes"}
        </h2>

        {quotations.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-800/30 border border-slate-700 text-center">
            <p className="text-slate-400">
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
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">
                      {quote.pol} ➔ {quote.pod}
                    </div>
                    <div className="text-2xl font-bold text-blue-400 mt-1">
                      {formatCurrency(quote.price, quote.currency)}
                    </div>
                    <div className="text-sm text-slate-400 mt-2">
                      {locale === "ko" ? "유효기간" : "Valid until"}: {formatDate(new Date(quote.validUntil), locale as "en" | "ko")}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <Eye className="w-4 h-4" />
                      {quote.views} {locale === "ko" ? "회 조회" : "views"}
                    </div>
                    <Link
                      href={`/${locale}/quote/${quote.shortId}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                    >
                      {locale === "ko" ? "보기" : "View"}
                      <ExternalLink className="w-4 h-4" />
                    </Link>
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
