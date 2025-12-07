import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fwdlink.io"),
  title: {
    default: "FwdLink - Professional Freight Quotes in 10 Seconds",
    template: "%s | FwdLink",
  },
  description:
    "Stop using Excel. Send professional freight quotes via WhatsApp/Kakao link in 10 seconds. The fastest way to share shipping rates.",
  keywords: [
    "freight quote",
    "shipping",
    "logistics",
    "forwarder",
    "quotation",
    "freight forwarding",
    "ocean freight",
    "sea freight",
    "container shipping",
    "운임 견적",
    "해상 운송",
    "포워딩",
  ],
  authors: [{ name: "FwdLink" }],
  creator: "FwdLink",
  publisher: "FwdLink",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ko_KR"],
    url: "https://fwdlink.io",
    siteName: "FwdLink",
    title: "FwdLink - Professional Freight Quotes in 10 Seconds",
    description:
      "Stop using Excel. Send professional freight quotes via WhatsApp/Kakao link in 10 seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FwdLink - Professional Freight Quotes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FwdLink - Professional Freight Quotes",
    description:
      "Stop using Excel. Send professional freight quotes via WhatsApp/Kakao link in 10 seconds.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://fwdlink.io",
    languages: {
      en: "https://fwdlink.io/en",
      ko: "https://fwdlink.io/ko",
    },
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
