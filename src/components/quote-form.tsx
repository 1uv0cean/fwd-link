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
import type { Currency, Incoterms, IQuoteLineItem, TransportMode } from "@/types/quotation";
import { INCOTERMS_OPTIONS, PRESET_COST_ITEMS, TRANSPORT_MODE_OPTIONS } from "@/types/quotation";
import {
    Box,
    Calendar,
    ChevronDown,
    DollarSign,
    FileText,
    Loader2,
    Plus,
    Ship,
    Trash2,
} from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [pol, setPol] = useState<Port | null>(initialData?.pol || null);
  const [pod, setPod] = useState<Port | null>(initialData?.pod || null);
  const [containerType, setContainerType] = useState<ContainerType>(initialData?.containerType || "40HQ");
  const [incoterms, setIncoterms] = useState<Incoterms>("FOB");
  const [transportMode, setTransportMode] = useState<TransportMode>("FCL");
  const [validUntil, setValidUntil] = useState("");
  const [remarks, setRemarks] = useState(initialData?.remarks || "");

  // Dynamic line items
  const [lineItems, setLineItems] = useState<IQuoteLineItem[]>([
    { name: "OF", amount: 0, currency: "USD" },
  ]);

  const isKo = locale === "ko";

  const addLineItem = () => {
    setLineItems([...lineItems, { name: "", amount: 0, currency: "USD" }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof IQuoteLineItem, value: string | number) => {
    const updated = [...lineItems];
    if (field === "amount") {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value as Currency & string;
    }
    setLineItems(updated);
  };

  // Calculate totals by currency
  const totalUSD = lineItems
    .filter((item) => item.currency === "USD")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalKRW = lineItems
    .filter((item) => item.currency === "KRW")
    .reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!pol || !pod) {
      setError(isKo ? "항구를 선택해주세요" : "Please select ports");
      setIsLoading(false);
      return;
    }

    // Validate line items
    const validLineItems = lineItems.filter((item) => item.name && item.amount > 0);
    if (validLineItems.length === 0) {
      setError(isKo ? "최소 하나의 비용 항목을 입력해주세요" : "Please add at least one cost item");
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
        incoterms,
        transportMode,
        lineItems: validLineItems,
        price: totalUSD, // Use USD total as main price
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
              {isKo ? "선적항 (POL)" : "Port of Loading"}
            </label>
            <PortCombobox
              value={pol}
              onChange={setPol}
              placeholder={isKo ? "항구 검색..." : "Search port..."}
              locale={locale}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Ship className="w-4 h-4" />
              {isKo ? "도착항 (POD)" : "Port of Discharge"}
            </label>
            <PortCombobox
              value={pod}
              onChange={setPod}
              placeholder={isKo ? "항구 검색..." : "Search port..."}
              locale={locale}
            />
          </div>
        </div>

        {/* Transport Mode & Incoterms Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transport Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Box className="w-4 h-4" />
              {isKo ? "운송 유형" : "Transport Mode"}
            </label>
            <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-white">
              {TRANSPORT_MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTransportMode(option.value)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    transportMode === option.value
                      ? "bg-blue-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option.value}
                </button>
              ))}
            </div>
          </div>

          {/* Incoterms */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Incoterms
            </label>
            <div className="relative">
              <select
                value={incoterms}
                onChange={(e) => setIncoterms(e.target.value as Incoterms)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {INCOTERMS_OPTIONS.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Container Type Section */}
        <ContainerTypeSelector
          value={containerType}
          onChange={setContainerType}
          locale={locale}
        />

        {/* Dynamic Cost Items Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {isKo ? "비용 항목" : "Cost Items"}
          </label>
          
          <div className="space-y-2">
            {lineItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                {/* Item Name - Combobox with presets */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateLineItem(index, "name", e.target.value)}
                    list={`preset-items-${index}`}
                    placeholder={isKo ? "항목명" : "Item name"}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <datalist id={`preset-items-${index}`}>
                    {PRESET_COST_ITEMS.map((preset) => (
                      <option key={preset} value={preset} />
                    ))}
                  </datalist>
                </div>

                {/* Amount */}
                <Input
                  type="number"
                  value={item.amount || ""}
                  onChange={(e) => updateLineItem(index, "amount", e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-28 bg-white border-slate-300 text-slate-800 text-sm"
                />

                {/* Currency */}
                <select
                  value={item.currency}
                  onChange={(e) => updateLineItem(index, "currency", e.target.value)}
                  className="w-20 px-2 py-2 rounded-md border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="KRW">KRW</option>
                </select>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  disabled={lineItems.length === 1}
                  className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Item Button */}
          <Button
            type="button"
            variant="outline"
            onClick={addLineItem}
            className="w-full border-dashed border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isKo ? "항목 추가" : "Add Item"}
          </Button>

          {/* Totals Summary */}
          <div className="mt-4 p-4 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              {isKo ? "합계" : "Total"}
            </div>
            <div className="flex flex-wrap gap-4">
              {totalUSD > 0 && (
                <div className="text-lg font-bold text-blue-900">
                  ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  <span className="text-sm font-normal text-slate-500 ml-1">USD</span>
                </div>
              )}
              {totalKRW > 0 && (
                <div className="text-lg font-bold text-blue-900">
                  ₩{totalKRW.toLocaleString("ko-KR")}
                  <span className="text-sm font-normal text-slate-500 ml-1">KRW</span>
                </div>
              )}
              {totalUSD === 0 && totalKRW === 0 && (
                <div className="text-slate-400 text-sm">
                  {isKo ? "금액을 입력해주세요" : "Enter amounts"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Valid Until */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {isKo ? "유효기간" : "Valid Until"}
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
            {isKo ? "비고 (선택사항)" : "Remarks (Optional)"}
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={isKo ? "추가 정보를 입력하세요..." : "Enter additional notes..."}
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
              {isKo ? "생성 중..." : "Creating..."}
            </>
          ) : (
            isKo ? "견적서 작성" : "Create Quote"
          )}
        </Button>
      </form>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle>
              {isKo
                ? "무료 견적서를 모두 사용하셨습니다"
                : "You've used all free quotes"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {isKo
                ? "Pro로 업그레이드하여 무제한 견적서를 작성하세요."
                : "Upgrade to Pro for unlimited quotes."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button asChild className="w-full bg-blue-900 hover:bg-blue-800">
              <a href={`/${locale}/upgrade`}>
                {isKo ? "Pro로 업그레이드" : "Upgrade to Pro"}
              </a>
            </Button>
            <Button
              variant="outline"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => setShowUpgradeModal(false)}
            >
              {isKo ? "나중에" : "Maybe later"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
