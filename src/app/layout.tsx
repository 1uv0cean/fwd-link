import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FwdLink - Professional Freight Quotes in 10 Seconds",
    template: "%s | FwdLink",
  },
  description: "Stop using Excel. Send professional freight quotes via WhatsApp/Kakao link in 10 seconds.",
  keywords: ["freight quote", "shipping", "logistics", "forwarder", "quotation", "BUSAN", "freight forwarding"],
  authors: [{ name: "FwdLink" }],
  creator: "FwdLink",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ko_KR",
    url: "https://fwdlink.io",
    siteName: "FwdLink",
    title: "FwdLink - Professional Freight Quotes in 10 Seconds",
    description: "Stop using Excel. Send professional freight quotes via WhatsApp/Kakao link in 10 seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FwdLink",
    description: "Professional freight quotes in 10 seconds",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
