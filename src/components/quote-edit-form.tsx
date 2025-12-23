"use client";

import { deleteQuotation, updateQuotation } from "@/actions/quotation";
import AirportCombobox, { type Airport } from "@/components/airport-combobox";
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
import type { Currency, Incoterms, IQuoteLineItem, Section, TransportMode } from "@/types/quotation";
import { AIR_PRESET_COST_ITEMS_BY_SECTION, calculateChargeableWeight, INCOTERMS_OPTIONS, PRESET_COST_ITEMS_BY_SECTION, SECTION_INFO, TRANSPORT_MODE_OPTIONS } from "@/types/quotation";
import {
    AlertTriangle,
    Anchor,
    Box,
    Calendar,
    ChevronDown,
    DollarSign,
    FileText,
    Loader2,
    MapPin,
    Plane,
    Plus,
    Save,
    Scale,
    Ship,
    Trash2,
    Warehouse
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface QuotationData {
  shortId: string;
  pol: { name: string; code: string | null; country: string } | string;
  pod: { name: string; code: string | null; country: string } | string;
  containerType: string;
  incoterms: string;
  transportMode: string;
  lineItems: (IQuoteLineItem | { name: string; amount: number; currency: Currency })[];
  price: number;
  remarks: string;
  validUntil: string;
  // AIR freight fields
  grossWeight?: number | null;
  cbm?: number | null;
  chargeableWeight?: number | null;
}

interface QuoteEditFormProps {
  locale: string;
  quotation: QuotationData;
}

// Helper to create empty line item for a section
const createEmptyLineItem = (section: Section): IQuoteLineItem => ({
  section,
  name: "",
  amount: 0,
  currency: "USD",
});

// Section component for line items
interface SectionPanelProps {
  section: Section;
  items: IQuoteLineItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof IQuoteLineItem, value: string | number) => void;
  isKo: boolean;
  isAirMode?: boolean;
}

function SectionPanel({ section, items, onAdd, onRemove, onUpdate, isKo, isAirMode = false }: SectionPanelProps) {
  const info = SECTION_INFO[section];
  const presets = isAirMode ? AIR_PRESET_COST_ITEMS_BY_SECTION[section] : PRESET_COST_ITEMS_BY_SECTION[section];
  
  const colorClasses = {
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50/50",
      header: "bg-blue-100 text-blue-800",
      icon: "text-blue-600",
      button: "border-blue-300 text-blue-600 hover:bg-blue-50",
    },
    emerald: {
      border: "border-emerald-200",
      bg: "bg-emerald-50/50",
      header: "bg-emerald-100 text-emerald-800",
      icon: "text-emerald-600",
      button: "border-emerald-300 text-emerald-600 hover:bg-emerald-50",
    },
    orange: {
      border: "border-orange-200",
      bg: "bg-orange-50/50",
      header: "bg-orange-100 text-orange-800",
      icon: "text-orange-600",
      button: "border-orange-300 text-orange-600 hover:bg-orange-50",
    },
  };
  
  const colors = colorClasses[info.color as keyof typeof colorClasses];
  
  const IconComponent = section === "ORIGIN" ? Warehouse : section === "FREIGHT" ? Anchor : MapPin;

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} overflow-hidden`}>
      {/* Section Header */}
      <div className={`px-4 py-2.5 ${colors.header} flex items-center gap-2`}>
        <IconComponent className={`w-4 h-4 ${colors.icon}`} />
        <span className="font-medium text-sm">
          {isKo ? info.labelKo : info.label}
        </span>
      </div>
      
      {/* Items */}
      <div className="p-4 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            {/* Item Name */}
            <div className="relative flex-1">
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdate(index, "name", e.target.value)}
                list={`preset-items-${section}-${index}`}
                placeholder={isKo ? "항목명" : "Item name"}
                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <datalist id={`preset-items-${section}-${index}`}>
                {presets.map((preset) => (
                  <option key={preset} value={preset} />
                ))}
              </datalist>
            </div>

            {/* Amount */}
            <Input
              type="number"
              value={item.amount || ""}
              onChange={(e) => onUpdate(index, "amount", e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-28 bg-white border-slate-300 text-slate-800 text-sm"
            />

            {/* Currency */}
            <select
              value={item.currency}
              onChange={(e) => onUpdate(index, "currency", e.target.value)}
              className="w-20 px-2 py-2 rounded-md border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="KRW">KRW</option>
              <option value="EUR">EUR</option>
            </select>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {/* Add Item Button */}
        <Button
          type="button"
          variant="outline"
          onClick={onAdd}
          className={`w-full border-dashed ${colors.button}`}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isKo ? "항목 추가" : "Add Item"}
        </Button>
      </div>
    </div>
  );
}

// Helper to parse existing line items into sectioned arrays
function parseLineItemsBySection(items: (IQuoteLineItem | { name: string; amount: number; currency: Currency })[]): {
  origin: IQuoteLineItem[];
  freight: IQuoteLineItem[];
  destination: IQuoteLineItem[];
} {
  const origin: IQuoteLineItem[] = [];
  const freight: IQuoteLineItem[] = [];
  const destination: IQuoteLineItem[] = [];

  for (const item of items) {
    // Normalize item to have section (default to FREIGHT for backward compatibility)
    const section = ('section' in item && item.section) ? item.section : 'FREIGHT';
    const normalizedItem: IQuoteLineItem = {
      section,
      name: item.name,
      amount: item.amount,
      currency: item.currency,
    };

    if (section === 'ORIGIN') {
      origin.push(normalizedItem);
    } else if (section === 'DESTINATION') {
      destination.push(normalizedItem);
    } else {
      freight.push(normalizedItem);
    }
  }

  return { origin, freight, destination };
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

  // AIR freight fields
  const [grossWeight, setGrossWeight] = useState<number>(quotation.grossWeight || 0);
  const [cbm, setCbm] = useState<number>(quotation.cbm || 0);
  const [chargeableWeight, setChargeableWeight] = useState<number>(quotation.chargeableWeight || 0);

  // Parse existing line items into sections
  const initialSections = parseLineItemsBySection(
    quotation.lineItems?.length > 0
      ? quotation.lineItems
      : [{ name: transportMode === "AIR" ? "Air Freight" : "Ocean Freight", amount: quotation.price, currency: "USD" as Currency }]
  );

  // Sectioned line items
  const [originItems, setOriginItems] = useState<IQuoteLineItem[]>(initialSections.origin);
  const [freightItems, setFreightItems] = useState<IQuoteLineItem[]>(
    initialSections.freight.length > 0 
      ? initialSections.freight 
      : [{ section: "FREIGHT" as Section, name: transportMode === "AIR" ? "Air Freight" : "Ocean Freight", amount: 0, currency: "USD" as Currency }]
  );
  const [destinationItems, setDestinationItems] = useState<IQuoteLineItem[]>(initialSections.destination);

  const isAirMode = transportMode === "AIR";
  const isKo = locale === "ko";

  // Calculate C.W when gross weight or CBM changes
  useEffect(() => {
    if (isAirMode && (grossWeight > 0 || cbm > 0)) {
      setChargeableWeight(calculateChargeableWeight(grossWeight, cbm));
    }
  }, [grossWeight, cbm, isAirMode]);

  // Reset pol/pod when switching between ocean (FCL/LCL) and AIR modes
  const [prevIsAirMode, setPrevIsAirMode] = useState(isAirMode);
  useEffect(() => {
    if (prevIsAirMode !== isAirMode) {
      setPol(null);
      setPod(null);
      setPrevIsAirMode(isAirMode);
    }
  }, [isAirMode, prevIsAirMode]);

  // Helper functions for each section
  const addItem = (section: Section) => {
    const item = createEmptyLineItem(section);
    if (section === "ORIGIN") setOriginItems([...originItems, item]);
    else if (section === "FREIGHT") setFreightItems([...freightItems, item]);
    else setDestinationItems([...destinationItems, item]);
  };

  const removeItem = (section: Section, index: number) => {
    if (section === "ORIGIN") {
      setOriginItems(originItems.filter((_, i) => i !== index));
    } else if (section === "FREIGHT") {
      if (freightItems.length > 1) {
        setFreightItems(freightItems.filter((_, i) => i !== index));
      }
    } else {
      setDestinationItems(destinationItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (section: Section, index: number, field: keyof IQuoteLineItem, value: string | number) => {
    const update = (items: IQuoteLineItem[]) => {
      const updated = [...items];
      if (field === "amount") {
        updated[index][field] = Number(value);
      } else if (field === "section") {
        updated[index][field] = value as Section;
      } else if (field === "currency") {
        updated[index][field] = value as Currency;
      } else {
        updated[index][field] = value as string;
      }
      return updated;
    };

    if (section === "ORIGIN") setOriginItems(update(originItems));
    else if (section === "FREIGHT") setFreightItems(update(freightItems));
    else setDestinationItems(update(destinationItems));
  };

  // Combine all items
  const allItems = [...originItems, ...freightItems, ...destinationItems];

  // Calculate totals by currency
  const totalUSD = allItems
    .filter((item) => item.currency === "USD")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalKRW = allItems
    .filter((item) => item.currency === "KRW")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalEUR = allItems
    .filter((item) => item.currency === "EUR")
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

    const validLineItems = allItems.filter((item) => item.name && item.amount > 0);
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
        // AIR freight fields
        ...(isAirMode && {
          grossWeight: grossWeight || undefined,
          cbm: cbm || undefined,
          chargeableWeight: chargeableWeight || undefined,
        }),
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
              {isAirMode ? <Plane className="w-4 h-4" /> : <Ship className="w-4 h-4" />}
              {isAirMode
                ? (isKo ? "출발 공항 (AOL)" : "Airport of Loading")
                : (isKo ? "선적항 (POL)" : "Port of Loading")}
            </label>
            {isAirMode ? (
              <AirportCombobox
                value={pol as Airport | null}
                onChange={(airport) => setPol(airport as Port | null)}
                placeholder={isKo ? "공항 검색..." : "Search airport..."}
                locale={locale}
              />
            ) : (
              <PortCombobox
                value={pol}
                onChange={setPol}
                placeholder={isKo ? "항구 검색..." : "Search port..."}
                locale={locale}
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              {isAirMode ? <Plane className="w-4 h-4" /> : <Ship className="w-4 h-4" />}
              {isAirMode
                ? (isKo ? "도착 공항 (AOD)" : "Airport of Discharge")
                : (isKo ? "도착항 (POD)" : "Port of Discharge")}
            </label>
            {isAirMode ? (
              <AirportCombobox
                value={pod as Airport | null}
                onChange={(airport) => setPod(airport as Port | null)}
                placeholder={isKo ? "공항 검색..." : "Search airport..."}
                locale={locale}
              />
            ) : (
              <PortCombobox
                value={pod}
                onChange={setPod}
                placeholder={isKo ? "항구 검색..." : "Search port..."}
                locale={locale}
              />
            )}
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

        {/* Container Type Section - Hidden for AIR mode */}
        {!isAirMode && (
          <ContainerTypeSelector
            value={containerType}
            onChange={setContainerType}
            locale={locale}
          />
        )}

        {/* AIR Freight C.W Calculator */}
        {isAirMode && (
          <div className="p-4 rounded-lg bg-sky-50 border border-sky-200 space-y-4">
            <div className="flex items-center gap-2 text-sky-800 font-medium">
              <Scale className="w-4 h-4" />
              {isKo ? "Chargeable Weight 계산" : "Chargeable Weight Calculator"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-600">
                  {isKo ? "실중량 (Gross Weight)" : "Gross Weight"}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={grossWeight || ""}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className="bg-white border-slate-300 text-slate-800 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">kg</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">
                  {isKo ? "체적 (CBM)" : "Volume (CBM)"}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={cbm || ""}
                    onChange={(e) => setCbm(Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="bg-white border-slate-300 text-slate-800 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">m³</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">
                  {isKo ? "C.W (청구중량)" : "Chargeable Weight"}
                </label>
                <div className="h-10 px-3 flex items-center rounded-md bg-sky-100 border border-sky-300 text-sky-900 font-bold">
                  {chargeableWeight > 0 ? `${chargeableWeight.toLocaleString()} kg` : "-"}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {isKo
                ? "※ C.W = max(실중량, CBM × 167) - IATA 기준"
                : "※ C.W = max(Gross Weight, CBM × 167) - IATA standard"}
            </p>
          </div>
        )}

        {/* Cost Sections */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {isKo ? "비용 항목" : "Cost Items"}
          </label>
          
          {/* Origin Section */}
          <SectionPanel
            section="ORIGIN"
            items={originItems}
            onAdd={() => addItem("ORIGIN")}
            onRemove={(index) => removeItem("ORIGIN", index)}
            onUpdate={(index, field, value) => updateItem("ORIGIN", index, field, value)}
            isKo={isKo}
            isAirMode={isAirMode}
          />
          
          {/* Freight Section */}
          <SectionPanel
            section="FREIGHT"
            items={freightItems}
            onAdd={() => addItem("FREIGHT")}
            onRemove={(index) => removeItem("FREIGHT", index)}
            onUpdate={(index, field, value) => updateItem("FREIGHT", index, field, value)}
            isKo={isKo}
            isAirMode={isAirMode}
          />
          
          {/* Destination Section */}
          <SectionPanel
            section="DESTINATION"
            items={destinationItems}
            onAdd={() => addItem("DESTINATION")}
            onRemove={(index) => removeItem("DESTINATION", index)}
            onUpdate={(index, field, value) => updateItem("DESTINATION", index, field, value)}
            isKo={isKo}
            isAirMode={isAirMode}
          />

          {/* Totals Summary */}
          <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              {isKo ? "합계" : "Estimated Total"}
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
              {totalEUR > 0 && (
                <div className="text-lg font-bold text-blue-900">
                  €{totalEUR.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                  <span className="text-sm font-normal text-slate-500 ml-1">EUR</span>
                </div>
              )}
              {totalUSD === 0 && totalKRW === 0 && totalEUR === 0 && (
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
