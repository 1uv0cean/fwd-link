"use client";

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
    // Kakao SDK would be initialized in layout
    // For now, use Kakao Talk link share
    const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=YOUR_KAKAO_KEY&request_url=${encodeURIComponent(url)}`;
    // Fallback to copy if Kakao SDK not available
    handleCopyLink();
  };

  return (
    <div className="space-y-3">
      {/* Primary Share Button - Based on locale */}
      {isKorean ? (
        <button
          onClick={handleKakaoShare}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#FEE500] text-[#3A1D1D] font-semibold hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-5 h-5" />
          카카오톡으로 공유
        </button>
      ) : (
        <button
          onClick={handleWhatsAppShare}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#25D366] text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-5 h-5" />
          Share on WhatsApp
        </button>
      )}

      {/* Secondary Share Button */}
      {isKorean ? (
        <button
          onClick={handleWhatsAppShare}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp으로 공유
        </button>
      ) : (
        <button
          onClick={handleKakaoShare}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Share on KakaoTalk
        </button>
      )}

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5 text-green-400" />
            {isKorean ? "링크가 복사되었습니다!" : "Link copied!"}
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            {isKorean ? "링크 복사" : "Copy Link"}
          </>
        )}
      </button>
    </div>
  );
}
