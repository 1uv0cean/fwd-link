"use client";

import { deleteQuotation, updateQuotation } from "@/actions/quotation";
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
import type { Currency, Incoterms, IQuoteLineItem, TransportMode } from "@/types/quotation";
import { INCOTERMS_OPTIONS, PRESET_COST_ITEMS, TRANSPORT_MODE_OPTIONS } from "@/types/quotation";
import {
    AlertTriangle,
    Box,
    Calendar,
    ChevronDown,
    DollarSign,
    FileText,
    Loader2,
    Plus,
    Save,
    Ship,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface QuotationData {
  shortId: string;
  pol: { name: string; code: string | null; country: string } | string;
  pod: { name: string; code: string | null; country: string } | string;
  containerType: string;
  incoterms: string;
  transportMode: string;
  lineItems: IQuoteLineItem[];
  price: number;
  remarks: string;
  validUntil: string;
}

interface QuoteEditFormProps {
  locale: string;
  quotation: QuotationData;
}

export default function QuoteEditForm({ locale, quotation }: QuoteEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Parse pol/pod
  const polData = typeof quotation.pol === "object" ? quotation.pol : null;
  const podData = typeof quotation.pod === "object" ? quotation.pod : null;

  const initialPol: Port | null = polData
    ? { name: polData.name, code: polData.code || "", country: polData.country || "", flag: "🚢" }
    : null;
  const initialPod: Port | null = podData
    ? { name: podData.name, code: podData.code || "", country: podData.country || "", flag: "🚢" }
    : null;

  const [pol, setPol] = useState<Port | null>(initialPol);
  const [pod, setPod] = useState<Port | null>(initialPod);
  const [containerType, setContainerType] = useState<ContainerType>(
    (quotation.containerType || "40HQ") as ContainerType
  );
  const [incoterms, setIncoterms] = useState<Incoterms>(
    (quotation.incoterms || "FOB") as Incoterms
  );
  const [transportMode, setTransportMode] = useState<TransportMode>(
    (quotation.transportMode || "FCL") as TransportMode
  );
  const [validUntil, setValidUntil] = useState(quotation.validUntil.split("T")[0]);
  const [remarks, setRemarks] = useState(quotation.remarks || "");
  const [lineItems, setLineItems] = useState<IQuoteLineItem[]>(
    quotation.lineItems?.length > 0
      ? quotation.lineItems
      : [{ name: "OF", amount: quotation.price, currency: "USD" }]
  );

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

    const validLineItems = lineItems.filter((item) => item.name && item.amount > 0);
    if (validLineItems.length === 0) {
      setError(isKo ? "최소 하나의 비용 항목을 입력해주세요" : "Please add at least one cost item");
      setIsLoading(false);
      return;
    }

    try {
      const result = await updateQuotation({
        shortId: quotation.shortId,
        pol: { name: pol.name, code: pol.code || null, country: pol.country || "" },
        pod: { name: pod.name, code: pod.code || null, country: pod.country || "" },
        containerType,
        incoterms,
        transportMode,
        lineItems: validLineItems,
        price: totalUSD,
        remarks,
        validUntil: new Date(validUntil),
      });

      if (!result.success) {
        toast.error(isKo ? "저장 실패" : "Save Failed", {
          description: result.error || "Failed to update quote",
        });
        return;
      }

      toast.success(isKo ? "저장 완료!" : "Saved!", {
        description: isKo ? "견적서가 업데이트되었습니다" : "Quote has been updated",
      });

      // Navigate to the quote view page
      router.push(`/${locale}/quote/${quotation.shortId}`);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteQuotation(quotation.shortId);

      if (!result.success) {
        toast.error(isKo ? "삭제 실패" : "Delete Failed", {
          description: result.error || "Failed to delete quote",
        });
        setShowDeleteModal(false);
        setIsDeleting(false);
        return;
      }

      toast.success(isKo ? "삭제 완료!" : "Deleted!", {
        description: isKo ? "견적서가 삭제되었습니다" : "Quote has been deleted",
      });

      // Navigate to dashboard using window.location for reliable redirect
      setTimeout(() => {
        window.location.href = `/${locale}/dashboard`;
      }, 500);
    } catch {
      setError("An unexpected error occurred");
      setShowDeleteModal(false);
      setIsDeleting(false);
    }
  };

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

                <Input
                  type="number"
                  value={item.amount || ""}
                  onChange={(e) => updateLineItem(index, "amount", e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-28 bg-white border-slate-300 text-slate-800 text-sm"
                />

                <select
                  value={item.currency}
                  onChange={(e) => updateLineItem(index, "currency", e.target.value)}
                  className="w-20 px-2 py-2 rounded-md border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="KRW">KRW</option>
                </select>

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

          <Button
            type="button"
            variant="outline"
            onClick={addLineItem}
            className="w-full border-dashed border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isKo ? "항목 추가" : "Add Item"}
          </Button>

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
            value={validUntil}
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isKo ? "삭제" : "Delete"}
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-12 text-lg font-semibold bg-blue-900 hover:bg-blue-800 shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {isKo ? "저장 중..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {isKo ? "저장" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              {isKo ? "견적서 삭제" : "Delete Quote"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {isKo
                ? "이 견적서를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다."
                : "Are you sure you want to delete this quote? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              {isKo ? "취소" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isKo ? "삭제 중..." : "Deleting..."}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isKo ? "삭제" : "Delete"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
