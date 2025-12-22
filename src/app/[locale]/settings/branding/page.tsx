import BrandingForm from "@/components/branding-form";
import { auth } from "@/lib/auth";
import { SUBSCRIPTION_STATUS } from "@/lib/constants";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { ArrowLeft, Crown, Palette } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function BrandingSettingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/${locale}/auth/signin`);
  }

  // Fetch user data directly (avoid action serialization issues)
  await dbConnect();
  const user = await User.findOne({ email: session.user.email }).lean();
  const isPro = user?.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE;

  const isKo = locale === "ko";

  // If not Pro, show upgrade prompt
  if (!isPro) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {isKo ? "대시보드로 돌아가기" : "Back to Dashboard"}
          </Link>

          {/* Upgrade prompt */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 text-center">
            <Crown className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {isKo ? "Pro 전용 기능" : "Pro Feature"}
            </h1>
            <p className="text-slate-600 mb-6">
              {isKo
                ? "커스텀 브랜딩은 Pro 구독자만 사용할 수 있습니다."
                : "Custom branding is available for Pro subscribers only."}
            </p>
            <Link
              href={`/${locale}/upgrade`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors"
            >
              <Crown className="w-5 h-5" />
              {isKo ? "Pro로 업그레이드" : "Upgrade to Pro"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Extract branding as pure primitive strings (no MongoDB objects)
  const companyName = user?.branding?.companyName ? String(user.branding.companyName) : "";
  const logoBase64 = user?.branding?.logoBase64 ? String(user.branding.logoBase64) : "";
  const primaryColor = user?.branding?.primaryColor ? String(user.branding.primaryColor) : "";
  const contactEmail = user?.branding?.contactEmail ? String(user.branding.contactEmail) : "";
  const contactPhone = user?.branding?.contactPhone ? String(user.branding.contactPhone) : "";

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {isKo ? "대시보드로 돌아가기" : "Back to Dashboard"}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold">
              {isKo ? "브랜딩 설정" : "Branding Settings"}
            </h1>
          </div>
          <p className="text-slate-500">
            {isKo
              ? "견적서에 표시될 회사 브랜딩을 설정하세요"
              : "Customize how your quotations look to clients"}
          </p>
        </div>

        {/* Form */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <BrandingForm 
            initialCompanyName={companyName}
            initialLogoBase64={logoBase64}
            initialPrimaryColor={primaryColor}
            initialContactEmail={contactEmail}
            initialContactPhone={contactPhone}
            locale={locale} 
          />
        </div>
      </div>
    </main>
  );
}
