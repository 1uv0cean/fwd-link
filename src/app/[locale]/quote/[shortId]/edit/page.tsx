import { getQuotation } from "@/actions/quotation";
import QuoteEditForm from "@/components/quote-edit-form";
import { auth } from "@/lib/auth";
import { ArrowLeft, Pencil } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ locale: string; shortId: string }>;
}) {
  const { locale, shortId } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Fetch quotation data (without incrementing view)
  const result = await getQuotation(shortId, { incrementView: false });

  if (!result.success || !result.quotation) {
    notFound();
  }

  const quotation = result.quotation;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === "ko" ? "대시보드로 돌아가기" : "Back to Dashboard"}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Pencil className="w-6 h-6 text-blue-500" />
            {locale === "ko" ? "견적서 수정" : "Edit Quote"}
          </h1>
          <p className="text-slate-400 mt-2">
            {locale === "ko"
              ? "견적서 정보를 수정하고 저장하세요"
              : "Edit quote details and save"}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-200 border border-slate-700">
          <QuoteEditForm locale={locale} quotation={quotation} />
        </div>
      </div>
    </main>
  );
}
