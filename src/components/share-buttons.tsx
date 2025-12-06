"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  locale: string;
}

export default function ShareButtons({ url, title, locale }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const isKorean = locale === "ko";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleKakaoShare = () => {
    handleCopyLink();
  };

  return (
    <div className="space-y-3">
      {/* Primary Share Button - Based on locale */}
      {isKorean ? (
        <Button
          onClick={handleKakaoShare}
          className="w-full h-14 text-base font-semibold bg-[#FEE500] text-[#3A1D1D] hover:bg-[#FEE500]/90"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          카카오톡으로 공유
        </Button>
      ) : (
        <Button
          onClick={handleWhatsAppShare}
          className="w-full h-14 text-base font-semibold bg-[#25D366] hover:bg-[#25D366]/90"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Share on WhatsApp
        </Button>
      )}

      {/* Secondary Share Button */}
      {isKorean ? (
        <Button
          variant="secondary"
          onClick={handleWhatsAppShare}
          className="w-full h-14 text-base font-semibold bg-slate-700 text-white hover:bg-slate-600"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          WhatsApp으로 공유
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={handleKakaoShare}
          className="w-full h-14 text-base font-semibold bg-slate-700 text-white hover:bg-slate-600"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Share on KakaoTalk
        </Button>
      )}

      {/* Copy Link */}
      <Button
        variant="outline"
        onClick={handleCopyLink}
        className="w-full h-14 text-base font-semibold border-slate-600 text-slate-300 hover:bg-slate-800"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5 mr-2 text-green-400" />
            {isKorean ? "링크가 복사되었습니다!" : "Link copied!"}
          </>
        ) : (
          <>
            <Copy className="w-5 h-5 mr-2" />
            {isKorean ? "링크 복사" : "Copy Link"}
          </>
        )}
      </Button>
    </div>
  );
}
