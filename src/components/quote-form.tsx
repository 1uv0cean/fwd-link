"use client";

import { createQuotation } from "@/actions/quotation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

      router.push(`/${locale}/quote/${result.shortId}`);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  const defaultDateStr = defaultDate.toISOString().split("T")[0];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Route Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Ship className="w-4 h-4" />
              {locale === "ko" ? "선적항 (POL)" : "Port of Loading"}
            </label>
            <Input
              type="text"
              value={formData.pol}
              onChange={(e) => setFormData({ ...formData, pol: e.target.value.toUpperCase() })}
              placeholder={locale === "ko" ? "예: BUSAN" : "e.g., BUSAN"}
              required
              className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 uppercase"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Ship className="w-4 h-4" />
              {locale === "ko" ? "도착항 (POD)" : "Port of Discharge"}
            </label>
            <Input
              type="text"
              value={formData.pod}
              onChange={(e) => setFormData({ ...formData, pod: e.target.value.toUpperCase() })}
              placeholder={locale === "ko" ? "예: LA" : "e.g., LA"}
              required
              className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 uppercase"
            />
          </div>
        </div>

        {/* Price Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {locale === "ko" ? "가격" : "Price"}
            </label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="1500"
              required
              min="0"
              step="0.01"
              className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {locale === "ko" ? "통화" : "Currency"}
            </label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value as Currency })}
            >
              <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="USD" className="text-slate-800 hover:bg-slate-100">$ USD</SelectItem>
                <SelectItem value="KRW" className="text-slate-800 hover:bg-slate-100">₩ KRW</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Valid Until */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {locale === "ko" ? "유효기간" : "Valid Until"}
          </label>
          <Input
            type="date"
            value={formData.validUntil || defaultDateStr}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            required
            className="bg-white border-slate-300 text-slate-800"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 text-lg font-semibold bg-blue-900 hover:bg-blue-800 shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              {locale === "ko" ? "생성 중..." : "Creating..."}
            </>
          ) : (
            locale === "ko" ? "견적서 작성" : "Create Quote"
          )}
        </Button>
      </form>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle>
              {locale === "ko" ? "무료 견적서를 모두 사용하셨습니다" : "You've used all free quotes"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {locale === "ko"
                ? "Pro로 업그레이드하여 무제한 견적서를 작성하세요."
                : "Upgrade to Pro for unlimited quotes."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button
              asChild
              className="w-full bg-blue-900 hover:bg-blue-800"
            >
              <a href={`/${locale}/upgrade`}>
                {locale === "ko" ? "Pro로 업그레이드" : "Upgrade to Pro"}
              </a>
            </Button>
            <Button
              variant="outline"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => setShowUpgradeModal(false)}
            >
              {locale === "ko" ? "나중에" : "Maybe later"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
