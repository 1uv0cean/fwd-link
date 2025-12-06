import QuoteForm from "@/components/quote-form";
import { auth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewQuotePage({
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

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === "ko" ? "대시보드로 돌아가기" : "Back to Dashboard"}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">
            {locale === "ko" ? "새 견적서 작성" : "Create New Quote"}
          </h1>
          <p className="text-slate-400 mt-2">
            {locale === "ko"
              ? "견적서 정보를 입력하고 즉시 공유하세요"
              : "Enter quote details and share instantly"}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
          <QuoteForm locale={locale} />
        </div>
      </div>
    </main>
  );
}
