import { Mail } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";

export default async function VerifyRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>

          <h1 className="text-2xl font-bold mb-4">
            {locale === "ko" ? "이메일을 확인해주세요" : "Check your email"}
          </h1>

          <p className="text-slate-400 mb-6">
            {locale === "ko"
              ? "로그인 링크가 이메일로 전송되었습니다. 이메일을 확인하고 링크를 클릭해주세요."
              : "A sign in link has been sent to your email address. Please check your inbox and click the link."}
          </p>

          <div className="p-4 rounded-xl bg-slate-900/50 text-sm text-slate-400 mb-6">
            {locale === "ko"
              ? "스팸 폴더도 확인해주세요"
              : "Don't forget to check your spam folder"}
          </div>

          <Link
            href={`/${locale}/auth/signin`}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {locale === "ko" ? "← 로그인으로 돌아가기" : "← Back to sign in"}
          </Link>
        </div>
      </div>
    </main>
  );
}
