"use client";

import { PRICING } from "@/lib/constants";
import {
    ArrowLeft,
    BarChart3,
    Check,
    Headphones,
    Palette,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface UpgradeClientProps {
  locale: string;
  userEmail: string;
}

export default function UpgradeClient({ locale, userEmail }: UpgradeClientProps) {
  const isKorean = locale === "ko";

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "annual"
  );

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

  // Get pricing based on locale
  const pricing = isKorean ? PRICING.KRW : PRICING.USD;
  const currencySymbol = isKorean ? "₩" : "$";
  const periodLabel = isKorean
    ? billingCycle === "monthly"
      ? "/월"
      : "/년"
    : billingCycle === "monthly"
    ? "/month"
    : "/year";

  const displayPrice =
    billingCycle === "monthly" ? pricing.MONTHLY : pricing.ANNUAL;
  const monthlyEquivalent = pricing.MONTHLY_EQUIVALENT;

  // Build checkout URL with user email in custom_data
  const monthlyBaseUrl =
    process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL || "#";
  const annualBaseUrl =
    process.env.NEXT_PUBLIC_LEMON_SQUEEZY_ANNUAL_CHECKOUT_URL || monthlyBaseUrl;
  
  const baseUrl = billingCycle === "monthly" ? monthlyBaseUrl : annualBaseUrl;
  
  // Append custom_data with user_email for webhook processing
  // Lemon Squeezy accepts checkout[custom][key]=value format
  const checkoutUrl = baseUrl !== "#" 
    ? `${baseUrl}?checkout[custom][user_email]=${encodeURIComponent(userEmail)}`
    : "#";

  const formatPrice = (price: number) => {
    if (isKorean) {
      return `₩${price.toLocaleString("ko-KR")}`;
    }
    return `$${price}`;
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {isKorean ? "대시보드로 돌아가기" : "Back to Dashboard"}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {isKorean ? "Pro로 업그레이드" : "Upgrade to Pro"}
          </h1>
          <p className="text-xl text-slate-500">
            {isKorean
              ? "무제한 견적서와 프리미엄 기능을 이용하세요"
              : "Unlock unlimited quotes and premium features"}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {isKorean ? "월간" : "Monthly"}
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                billingCycle === "annual"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {isKorean ? "연간" : "Annual"}
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                {isKorean ? "10% 할인" : "Save 17%"}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-8">
          <div className="text-center mb-8">
            <div className="text-5xl font-bold mb-2">
              {formatPrice(displayPrice)}
              <span className="text-xl font-normal text-slate-400">
                {periodLabel}
              </span>
            </div>
            {billingCycle === "annual" && (
              <p className="text-slate-500">
                {isKorean
                  ? `월 ${formatPrice(Math.round(monthlyEquivalent))} 상당`
                  : `That's just ${currencySymbol}${monthlyEquivalent}/month`}
              </p>
            )}
            <p className="text-slate-400 mt-2">
              {isKorean ? "언제든지 취소 가능" : "Cancel anytime"}
            </p>
          </div>

          {/* Features List */}
          <ul className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium text-slate-800">
                    {feature.title}
                  </div>
                  <div className="text-sm text-slate-500">
                    {feature.description}
                  </div>
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
