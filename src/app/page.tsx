import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";
  
  // Check if Korean is the preferred language
  const isKorean = acceptLanguage.toLowerCase().includes("ko");
  
  redirect(isKorean ? "/ko" : "/en");
}
