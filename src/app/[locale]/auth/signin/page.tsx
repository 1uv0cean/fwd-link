import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Redirect to NextAuth's built-in signin page
  // This automatically shows only the configured providers
  redirect(`/api/auth/signin?callbackUrl=/${locale}/dashboard`);
}
