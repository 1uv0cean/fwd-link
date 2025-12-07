import { ArrowRight, Globe, Send, Shield, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePageContent locale={locale} />;
}

function HomePageContent({ locale }: { locale: string }) {
  const t = useTranslations();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-sm mb-8">
            <Zap className="w-4 h-4" />
            <span>Built for Small Forwarders</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900">
            {t("common.appName")}
          </h1>

          <p className="text-lg md:text-2xl text-slate-600 mb-4">
            {t("common.tagline")}
          </p>

          <p className="text-md text-slate-500 mb-12 max-w-2xl mx-auto">
            {locale === "ko"
              ? "엑셀은 이제 그만. WhatsApp/카카오톡 링크로 10초 만에 전문 운임 견적서를 보내세요."
              : "Stop using Excel. Send professional freight quotes via WhatsApp/Kakao link in 10 seconds."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/auth/signin`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-900 text-white font-semibold text-lg hover:bg-blue-800 transition-colors shadow-md"
            >
              {t("auth.signIn")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            {locale === "ko" ? "왜 FwdLink인가요?" : "Why FwdLink?"}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-blue-800" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">
                {locale === "ko" ? "10초 견적서" : "10-Second Quotes"}
              </h3>
              <p className="text-slate-600">
                {locale === "ko"
                  ? "복잡한 엑셀 대신 모바일에서 바로 견적서를 작성하고 공유하세요."
                  : "Create and share quotes directly from your phone. No more Excel files."}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">
                {locale === "ko" ? "동적 링크 미리보기" : "Dynamic Link Previews"}
              </h3>
              <p className="text-slate-600">
                {locale === "ko"
                  ? "WhatsApp/카카오톡에서 가격이 바로 보이는 프리뷰를 제공합니다."
                  : "Recipients see the price directly in chat apps before clicking."}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">
                {locale === "ko" ? "읽음 확인" : "Read Receipts"}
              </h3>
              <p className="text-slate-600">
                {locale === "ko"
                  ? "고객이 견적서를 몇 번 열어봤는지 확인할 수 있습니다."
                  : "Track how many times your quote has been viewed."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500">
            © 2025 FwdLink. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={locale === "ko" ? "/en" : "/ko"}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              {locale === "ko" ? "English" : "한국어"}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
