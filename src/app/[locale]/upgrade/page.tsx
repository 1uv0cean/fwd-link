import { auth } from "@/lib/auth";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import UpgradeClient from "./upgrade-client";

export default async function UpgradePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/${locale}/auth/signin`);
  }

  return <UpgradeClient locale={locale} userEmail={session.user.email} />;
}
