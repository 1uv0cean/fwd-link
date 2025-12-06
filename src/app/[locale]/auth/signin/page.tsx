import { signIn } from "@/lib/auth";
import { Chrome, Mail } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {locale === "ko" ? "FwdLink에 로그인" : "Sign in to FwdLink"}
          </h1>
          <p className="text-slate-400">
            {locale === "ko"
              ? "전문 운임 견적서를 10초 만에 작성하세요"
              : "Create professional freight quotes in 10 seconds"}
          </p>
        </div>

        <div className="space-y-4">
          {/* Google Sign In */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: `/${locale}/dashboard` });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
            >
              <Chrome className="w-5 h-5" />
              {locale === "ko" ? "Google로 계속하기" : "Continue with Google"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-950 text-slate-400">
                {locale === "ko" ? "또는" : "or"}
              </span>
            </div>
          </div>

          {/* Email Magic Link */}
          <form
            action={async (formData: FormData) => {
              "use server";
              const email = formData.get("email") as string;
              await signIn("resend", { email, redirectTo: `/${locale}/dashboard` });
            }}
            className="space-y-3"
          >
            <input
              type="email"
              name="email"
              placeholder={locale === "ko" ? "이메일을 입력하세요" : "Enter your email"}
              required
              className="w-full px-6 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold hover:bg-slate-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              {locale === "ko" ? "이메일로 계속하기" : "Continue with Email"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          {locale === "ko"
            ? "계속하면 서비스 약관 및 개인정보 보호정책에 동의하게 됩니다."
            : "By continuing, you agree to our Terms of Service and Privacy Policy."}
        </p>
      </div>
    </main>
  );
}
