import { signIn } from "@/lib/auth";
import { Mail } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

// Official Google "G" Logo Component
const GoogleLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

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
          <h1 className="text-3xl font-bold mb-2 text-slate-900">
            {locale === "ko" ? "FwdLink에 로그인" : "Sign in to FwdLink"}
          </h1>
          <p className="text-slate-500">
            {locale === "ko"
              ? "전문 운임 견적서를 10초 만에 작성하세요"
              : "Create professional freight quotes in 10 seconds"}
          </p>
        </div>

        <div className="space-y-4">
          {/* Google Sign In - Official Google Button Style */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: `/${locale}/dashboard` });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors border border-slate-300 shadow-sm"
            >
              <GoogleLogo className="w-5 h-5" />
              {locale === "ko" ? "Google로 계속하기" : "Continue with Google"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-50 text-slate-500">
                {locale === "ko" ? "또는" : "or"}
              </span>
            </div>
          </div>

          {/* Email Magic Link */}
          <form
            action={async (formData: FormData) => {
              "use server";
              const email = formData.get("email") as string;
              await signIn("nodemailer", { email, redirectTo: `/${locale}/dashboard` });
            }}
            className="space-y-3"
          >
            <input
              type="email"
              name="email"
              placeholder={locale === "ko" ? "이메일을 입력하세요" : "Enter your email"}
              required
              className="w-full px-6 py-4 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors shadow-sm"
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
