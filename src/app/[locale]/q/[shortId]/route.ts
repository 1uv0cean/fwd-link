import { DEFAULT_LOCALE } from "@/lib/constants";
import { redirect } from "next/navigation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string; shortId: string }> }
) {
  const { locale, shortId } = await params;
  
  if (locale === DEFAULT_LOCALE) {
    redirect(`/quote/${shortId}`);
  } else {
    redirect(`/${locale}/quote/${shortId}`);
  }
}
