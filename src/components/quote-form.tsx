"use client";

import { createQuotation } from "@/actions/quotation";
import type { Currency } from "@/lib/constants";
import { ERROR_CODES, LOCALE_DEFAULTS } from "@/lib/constants";
import { Calendar, DollarSign, Loader2, Ship } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface QuoteFormProps {
  locale: string;
}

export default function QuoteForm({ locale }: QuoteFormProps) {
  const router = useRouter();
  const defaultCurrency = LOCALE_DEFAULTS[locale as keyof typeof LOCALE_DEFAULTS]?.currency || "USD";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [formData, setFormData] = useState({
    pol: "",
    pod: "",
    price: "",
    currency: defaultCurrency as Currency,
    validUntil: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await createQuotation({
        pol: formData.pol,
        pod: formData.pod,
        price: Number(formData.price),
        currency: formData.currency,
        validUntil: new Date(formData.validUntil),
      });

      if (!result.success) {
        if (result.errorCode === ERROR_CODES.LIMIT_REACHED) {
          setShowUpgradeModal(true);
        } else {
          setError(result.error || "Failed to create quote");
        }
        return;
      }

      // Redirect to quote page
      router.push(`/${locale}/quote/${result.shortId}`);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Get default date (7 days from now)
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  const defaultDateStr = defaultDate.toISOString().split("T")[0];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Route Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Ship className="w-4 h-4 inline mr-2" />
              {locale === "ko" ? "선적항 (POL)" : "Port of Loading"}
            </label>
            <input
              type="text"
              value={formData.pol}
              onChange={(e) => setFormData({ ...formData, pol: e.target.value.toUpperCase() })}
              placeholder={locale === "ko" ? "예: BUSAN" : "e.g., BUSAN"}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Ship className="w-4 h-4 inline mr-2" />
              {locale === "ko" ? "도착항 (POD)" : "Port of Discharge"}
            </label>
            <input
              type="text"
              value={formData.pod}
              onChange={(e) => setFormData({ ...formData, pod: e.target.value.toUpperCase() })}
              placeholder={locale === "ko" ? "예: LA" : "e.g., LA"}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            />
          </div>
        </div>

        {/* Price Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              {locale === "ko" ? "가격" : "Price"}
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="1500"
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {locale === "ko" ? "통화" : "Currency"}
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">$ USD</option>
              <option value="KRW">₩ KRW</option>
            </select>
          </div>
        </div>

        {/* Valid Until */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            {locale === "ko" ? "유효기간" : "Valid Until"}
          </label>
          <input
            type="date"
            value={formData.validUntil || defaultDateStr}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {locale === "ko" ? "생성 중..." : "Creating..."}
            </>
          ) : (
            locale === "ko" ? "견적서 작성" : "Create Quote"
          )}
        </button>
      </form>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">
              {locale === "ko" ? "무료 견적서를 모두 사용하셨습니다" : "You've used all free quotes"}
            </h2>
            <p className="text-slate-400 mb-6">
              {locale === "ko"
                ? "Pro로 업그레이드하여 무제한 견적서를 작성하세요."
                : "Upgrade to Pro for unlimited quotes."}
            </p>
            <div className="space-y-3">
              <a
                href={`/${locale}/upgrade`}
                className="block w-full text-center px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold"
              >
                {locale === "ko" ? "Pro로 업그레이드" : "Upgrade to Pro"}
              </a>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="block w-full text-center px-6 py-4 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
              >
                {locale === "ko" ? "나중에" : "Maybe later"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
