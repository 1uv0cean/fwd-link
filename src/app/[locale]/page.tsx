import { auth } from "@/lib/auth";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Globe,
  MessageSquare,
  MousePointerClick,
  Send,
  Share2,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Redirect logged-in users to dashboard
  const session = await auth();
  if (session?.user) {
    redirect(`/${locale}/dashboard`);
  }

  return <HomePageContent locale={locale} />;
}

function HomePageContent({ locale }: { locale: string }) {
  const t = useTranslations();

  const stats = [
    {
      value: "10K+",
      label: locale === "ko" ? "견적서 발송" : "Quotes Sent",
    },
    {
      value: "500+",
      label: locale === "ko" ? "포워더 사용중" : "Forwarders",
    },
    {
      value: "98%",
      label: locale === "ko" ? "응답률" : "Response Rate",
    },
    {
      value: "< 10s",
      label: locale === "ko" ? "견적 생성" : "Quote Creation",
    },
  ];

  const steps = [
    {
      icon: MousePointerClick,
      title: locale === "ko" ? "견적 작성" : "Create Quote",
      description:
        locale === "ko"
          ? "모바일에서 30초 만에 전문 견적서 작성"
          : "Create professional quotes in 30 seconds on mobile",
    },
    {
      icon: Share2,
      title: locale === "ko" ? "링크 공유" : "Share Link",
      description:
        locale === "ko"
          ? "WhatsApp, 이메일로 바로 공유 가능"
          : "Share instantly via WhatsApp or Email",
    },
    {
      icon: BarChart3,
      title: locale === "ko" ? "성과 추적" : "Track Results",
      description:
        locale === "ko"
          ? "조회수와 고객 반응을 실시간으로 확인"
          : "Monitor views and customer engagement in real-time",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: locale === "ko" ? "10초 견적서" : "10-Second Quotes",
      description:
        locale === "ko"
          ? "복잡한 엑셀 대신 모바일에서 바로 견적서를 작성하고 공유하세요."
          : "Create and share quotes directly from your phone. No more Excel files.",
      color: "blue",
    },
    {
      icon: Globe,
      title: locale === "ko" ? "동적 링크 미리보기" : "Dynamic Link Previews",
      description:
        locale === "ko"
          ? "WhatsApp에서 가격이 바로 보이는 프리뷰를 제공합니다."
          : "Recipients see the price directly in chat apps before clicking.",
      color: "emerald",
    },
    {
      icon: Shield,
      title: locale === "ko" ? "읽음 확인" : "Read Receipts",
      description:
        locale === "ko"
          ? "고객이 견적서를 몇 번 열어봤는지 확인할 수 있습니다."
          : "Track how many times your quote has been viewed.",
      color: "violet",
    },
    {
      icon: MessageSquare,
      title: locale === "ko" ? "다국어 지원" : "Multi-Language",
      description:
        locale === "ko"
          ? "한국어, 영어 견적서를 자동으로 생성합니다."
          : "Automatically generate quotes in Korean and English.",
      color: "amber",
    },
    {
      icon: Users,
      title: locale === "ko" ? "팀 협업" : "Team Collaboration",
      description:
        locale === "ko"
          ? "팀원들과 견적 데이터를 실시간으로 공유하세요."
          : "Share quote data with your team in real-time.",
      color: "rose",
    },
    {
      icon: Clock,
      title: locale === "ko" ? "견적 히스토리" : "Quote History",
      description:
        locale === "ko"
          ? "모든 견적서를 저장하고 언제든 다시 확인하세요."
          : "Save all quotes and access them anytime you need.",
      color: "cyan",
    },
  ];

  const testimonials = [
    {
      quote:
        locale === "ko"
          ? "엑셀로 견적서 만들던 시간이 1/10로 줄었어요. 이제 고객에게 바로 WhatsApp으로 보내니까 응답도 빨라졌습니다."
          : "Quote creation time reduced to 1/10. Sending directly via WhatsApp means faster responses from customers.",
      author: "Marcus Chen",
      role: locale === "ko" ? "Chen Logistics 대표" : "CEO, Chen Logistics",
      avatar: "MC",
    },
    {
      quote:
        locale === "ko"
          ? "고객이 견적서를 열어봤는지 알 수 있어서 팔로업 타이밍을 정확히 잡을 수 있어요."
          : "Being able to see when customers view quotes helps me time my follow-ups perfectly.",
      author: "Sophie Andersen",
      role: locale === "ko" ? "Nordic Freight 영업팀장" : "Sales Manager, Nordic Freight",
      avatar: "SA",
    },
    {
      quote:
        locale === "ko"
          ? "링크 하나로 운임, 항구, 일정이 다 정리되어 있으니 고객 입장에서도 편하다고 하더라고요."
          : "Customers love having all the info—rates, ports, schedules—in one clean link.",
      author: "Raj Patel",
      role: locale === "ko" ? "IndoPacific Cargo 매니저" : "Logistics Manager, IndoPacific Cargo",
      avatar: "RP",
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-100",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      border: "border-emerald-100",
    },
    violet: {
      bg: "bg-violet-50",
      icon: "text-violet-600",
      border: "border-violet-100",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      border: "border-amber-100",
    },
    rose: {
      bg: "bg-rose-50",
      icon: "text-rose-600",
      border: "border-rose-100",
    },
    cyan: {
      bg: "bg-cyan-50",
      icon: "text-cyan-600",
      border: "border-cyan-100",
    },
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {locale === "ko"
                  ? "포워더를 위한 스마트 견적 솔루션"
                  : "Smart Quoting Solution for Forwarders"}
              </span>
            </div>

            {/* Logo */}
            <img
              src="/og-image.png"
              alt="FwdLink"
              className="h-20 md:h-28 w-auto mx-auto mb-8 drop-shadow-lg"
            />

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
              {locale === "ko" ? (
                <>
                  견적서를 <span className="text-blue-600">10초</span>만에
                  <br className="hidden sm:block" />
                  WhatsApp으로 전송하세요
                </>
              ) : (
                <>
                  Send Freight Quotes via
                  <br className="hidden sm:block" />
                  <span className="text-blue-600">WhatsApp</span> in 10 Seconds
                </>
              )}
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {locale === "ko"
                ? "엑셀은 이제 그만. 모바일에서 전문 운임 견적서를 작성하고, 링크 하나로 고객에게 바로 공유하세요."
                : "Stop using Excel. Create professional freight quotes on mobile and share instantly with one link."}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href={`/${locale}/auth/signin`}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                {locale === "ko" ? "무료로 시작하기" : "Get Started Free"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={`/${locale}/rates/busan-to-long-beach`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 shadow-sm"
              >
                {locale === "ko" ? "데모 보기" : "View Demo"}
                <Send className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{locale === "ko" ? "신용카드 불필요" : "No credit card required"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{locale === "ko" ? "1분 안에 시작" : "Start in under 1 minute"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {locale === "ko" ? "어떻게 작동하나요?" : "How It Works"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {locale === "ko"
                ? "3단계로 간단하게 견적서를 작성하고 공유하세요"
                : "Create and share quotes in 3 simple steps"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line (desktop only) */}
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  {/* Step number with icon */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {locale === "ko" ? "왜 FwdLink인가요?" : "Why FwdLink?"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {locale === "ko"
                ? "포워더의 업무 효율을 극대화하는 모든 기능"
                : "All the features you need to maximize forwarder productivity"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const colors = colorClasses[feature.color];
              return (
                <div
                  key={index}
                  className={`p-6 rounded-2xl bg-white border ${colors.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {locale === "ko" ? "사용자 후기" : "What Our Users Say"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {locale === "ko"
                ? "전 세계 포워더들이 FwdLink를 사용하고 있습니다"
                : "Forwarders worldwide trust FwdLink for their quoting needs"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-700/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {locale === "ko"
              ? "지금 바로 시작하세요"
              : "Ready to Get Started?"}
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {locale === "ko"
              ? "무료로 시작하고, 견적서 작성 시간을 1/10로 줄이세요."
              : "Start for free and reduce your quote creation time by 90%."}
          </p>
          <Link
            href={`/${locale}/auth/signin`}
            className="group inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:-translate-y-0.5"
          >
            {locale === "ko" ? "무료로 시작하기" : "Get Started Free"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              <img
                src="/og-image.png"
                alt="FwdLink"
                className="h-8 w-auto brightness-200"
              />
            </div>
            <div className="flex items-center gap-6">
              <Link
                href={locale === "ko" ? "/en" : "/ko"}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4" />
                {locale === "ko" ? "English" : "한국어"}
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 FwdLink. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="#" className="hover:text-white transition-colors">
                {locale === "ko" ? "개인정보처리방침" : "Privacy Policy"}
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                {locale === "ko" ? "이용약관" : "Terms of Service"}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
