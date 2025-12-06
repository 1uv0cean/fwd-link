import { ArrowLeft, BarChart3, Check, Headphones, Palette, Zap } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isKorean = locale === "ko";

  const features = [
    {
      icon: Zap,
      title: isKorean ? "무제한 견적서" : "Unlimited Quotes",
      description: isKorean
        ? "제한 없이 견적서를 작성하고 공유하세요"
        : "Create and share as many quotes as you need",
    },
    {
      icon: BarChart3,
      title: isKorean ? "고급 분석" : "Advanced Analytics",
      description: isKorean
        ? "상세한 조회 통계와 인사이트를 확인하세요"
        : "Detailed view statistics and insights",
    },
    {
      icon: Palette,
      title: isKorean ? "커스텀 브랜딩" : "Custom Branding",
      description: isKorean
        ? "회사 로고와 색상으로 견적서를 커스터마이즈하세요"
        : "Customize quotes with your company logo and colors",
    },
    {
      icon: Headphones,
      title: isKorean ? "우선 지원" : "Priority Support",
      description: isKorean
        ? "24시간 이내에 우선적으로 지원을 받으세요"
        : "Get priority support within 24 hours",
    },
  ];

  // Replace with your Lemon Squeezy checkout URL
  const checkoutUrl = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL || "#";

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {isKorean ? "대시보드로 돌아가기" : "Back to Dashboard"}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {isKorean ? "Pro로 업그레이드" : "Upgrade to Pro"}
          </h1>
          <p className="text-xl text-slate-400">
            {isKorean
              ? "무제한 견적서와 프리미엄 기능을 이용하세요"
              : "Unlock unlimited quotes and premium features"}
          </p>
        </div>

        {/* Pricing Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-8">
          <div className="text-center mb-8">
            <div className="text-5xl font-bold mb-2">
              {isKorean ? "₩12,000" : "$9"}
              <span className="text-xl font-normal text-slate-400">
                /{isKorean ? "월" : "month"}
              </span>
            </div>
            <p className="text-slate-400">
              {isKorean ? "언제든지 취소 가능" : "Cancel anytime"}
            </p>
          </div>

          {/* Features List */}
          <ul className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium">{feature.title}</div>
                  <div className="text-sm text-slate-400">{feature.description}</div>
                </div>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <a
            href={checkoutUrl}
            className="block w-full text-center px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            {isKorean ? "지금 업그레이드" : "Upgrade Now"}
          </a>
        </div>

        {/* FAQ or Trust elements */}
        <div className="text-center text-sm text-slate-500">
          <p>
            {isKorean
              ? "💳 안전한 결제 · 📧 영수증 자동 발급 · 🔒 SSL 암호화"
              : "💳 Secure payment · 📧 Automatic receipts · 🔒 SSL encrypted"}
          </p>
        </div>
      </div>
    </main>
  );
}
