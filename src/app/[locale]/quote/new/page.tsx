import { getQuotation } from "@/actions/quotation";
import type { ContainerType } from "@/components/container-type-selector";
import type { Port } from "@/components/port-combobox";
import QuoteForm, { type QuoteFormInitialData } from "@/components/quote-form";
import { auth } from "@/lib/auth";
import { ArrowLeft, Copy } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ duplicate?: string }>;
}) {
  const { locale } = await params;
  const { duplicate } = await searchParams;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Prepare initial data for duplication
  let initialData: QuoteFormInitialData | undefined;
  let isDuplicate = false;

  if (duplicate) {
    const result = await getQuotation(duplicate, { incrementView: false });
    if (result.success && result.quotation) {
      isDuplicate = true;
      const quotation = result.quotation;

      // Convert pol/pod to Port type
      const polData = typeof quotation.pol === 'object' ? quotation.pol : null;
      const podData = typeof quotation.pod === 'object' ? quotation.pod : null;

      const pol: Port | null = polData ? {
        name: polData.name,
        code: polData.code || "",
        country: polData.country || "",
        flag: "🚢", // Will be looked up by combobox
      } : null;

      const pod: Port | null = podData ? {
        name: podData.name,
        code: podData.code || "",
        country: podData.country || "",
        flag: "🚢",
      } : null;

      initialData = {
        pol,
        pod,
        containerType: (quotation.containerType || "40HQ") as ContainerType,
        price: quotation.price,
        remarks: quotation.remarks || "",
      };
    }
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
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            {isDuplicate ? (
              <>
                <Copy className="w-6 h-6 text-blue-500" />
                {locale === "ko" ? "견적서 복제" : "Duplicate Quote"}
              </>
            ) : (
              locale === "ko" ? "새 견적서 작성" : "Create New Quote"
            )}
          </h1>
          <p className="text-slate-400 mt-2">
            {isDuplicate
              ? locale === "ko"
                ? "기존 견적 정보가 복사되었습니다. 가격을 입력하세요."
                : "Previous quote data copied. Enter the new price."
              : locale === "ko"
                ? "견적서 정보를 입력하고 즉시 공유하세요"
                : "Enter quote details and share instantly"}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-200 border border-slate-700">
          <QuoteForm locale={locale} initialData={initialData} />
        </div>
      </div>
    </main>
  );
}
