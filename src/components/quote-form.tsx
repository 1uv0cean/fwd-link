"use client";

import { createQuotation } from "@/actions/quotation";
import ContainerTypeSelector, {
  type ContainerType,
} from "@/components/container-type-selector";
import PortCombobox, { type Port } from "@/components/port-combobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ERROR_CODES } from "@/lib/constants";
import { Calendar, DollarSign, FileText, Loader2, Ship } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface QuoteFormInitialData {
  pol?: Port | null;
  pod?: Port | null;
  containerType?: ContainerType;
  price?: number;
  remarks?: string;
}

interface QuoteFormProps {
  locale: string;
  initialData?: QuoteFormInitialData;
}

export default function QuoteForm({ locale, initialData }: QuoteFormProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [pol, setPol] = useState<Port | null>(initialData?.pol || null);
  const [pod, setPod] = useState<Port | null>(initialData?.pod || null);
  const [containerType, setContainerType] = useState<ContainerType>(initialData?.containerType || "40HQ");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [validUntil, setValidUntil] = useState("");
  const [remarks, setRemarks] = useState(initialData?.remarks || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!pol || !pod) {
      setError(locale === "ko" ? "항구를 선택해주세요" : "Please select ports");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createQuotation({
        pol: {
          name: pol.name,
          code: pol.code || null,
          country: pol.country || "",
        },
        pod: {
          name: pod.name,
          code: pod.code || null,
          country: pod.country || "",
        },
        containerType,
        price: Number(price),
        remarks,
        validUntil: new Date(validUntil || defaultDateStr),
      });

      if (!result.success) {
        if (result.errorCode === ERROR_CODES.LIMIT_REACHED) {
          setShowUpgradeModal(true);
        } else {
          setError(result.error || "Failed to create quote");
        }
        return;
      }

      // Open the created quote in a new tab
      window.open(`/${locale}/quote/${result.shortId}`, '_blank');
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
            <PortCombobox
              value={pol}
              onChange={setPol}
              placeholder={locale === "ko" ? "항구 검색..." : "Search port..."}
              locale={locale}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Ship className="w-4 h-4" />
              {locale === "ko" ? "도착항 (POD)" : "Port of Discharge"}
            </label>
            <PortCombobox
              value={pod}
              onChange={setPod}
              placeholder={locale === "ko" ? "항구 검색..." : "Search port..."}
              locale={locale}
            />
          </div>
        </div>

        {/* Container Type Section */}
        <ContainerTypeSelector
          value={containerType}
          onChange={setContainerType}
          locale={locale}
        />

        {/* Price Section (USD only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {locale === "ko" ? "가격 (USD)" : "Price (USD)"}
          </label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1500"
            required
            min="0"
            step="0.01"
            className="bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Valid Until */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {locale === "ko" ? "유효기간" : "Valid Until"}
          </label>
          <Input
            type="date"
            value={validUntil || defaultDateStr}
            onChange={(e) => setValidUntil(e.target.value)}
            required
            className="bg-white border-slate-300 text-slate-800"
          />
        </div>

        {/* Remarks */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {locale === "ko" ? "비고 (선택사항)" : "Remarks (Optional)"}
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={locale === "ko" ? "추가 정보를 입력하세요..." : "Enter additional notes..."}
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-slate-500 text-right">{remarks.length}/500</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
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
              {locale === "ko"
                ? "무료 견적서를 모두 사용하셨습니다"
                : "You've used all free quotes"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {locale === "ko"
                ? "Pro로 업그레이드하여 무제한 견적서를 작성하세요."
                : "Upgrade to Pro for unlimited quotes."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button asChild className="w-full bg-blue-900 hover:bg-blue-800">
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
