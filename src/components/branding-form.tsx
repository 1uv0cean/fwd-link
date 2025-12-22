"use client";

import { removeLogo, updateBranding } from "@/actions/branding";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import LogoUpload from "./logo-upload";

interface BrandingFormProps {
  initialCompanyName?: string;
  initialLogoBase64?: string;
  initialPrimaryColor?: string;
  initialContactEmail?: string;
  initialContactPhone?: string;
  locale: string;
}

// Predefined brand colors
const COLOR_PRESETS = [
  "#1e3a8a", // Blue (default)
  "#0f766e", // Teal
  "#15803d", // Green
  "#b91c1c", // Red
  "#7c2d12", // Brown
  "#6b21a8", // Purple
  "#0369a1", // Sky
  "#1e293b", // Slate
];

export default function BrandingForm({ 
  initialCompanyName,
  initialLogoBase64,
  initialPrimaryColor,
  initialContactEmail,
  initialContactPhone,
  locale 
}: BrandingFormProps) {
  const [companyName, setCompanyName] = useState(initialCompanyName || "");
  const [logoBase64, setLogoBase64] = useState<string | undefined>(initialLogoBase64);
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor || "#1e3a8a");
  const [contactEmail, setContactEmail] = useState(initialContactEmail || "");
  const [contactPhone, setContactPhone] = useState(initialContactPhone || "");
  const [isSaving, setIsSaving] = useState(false);

  const isKo = locale === "ko";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const result = await updateBranding({
        companyName: companyName.trim() || undefined,
        logoBase64,
        primaryColor,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      });

      if (result.success) {
        toast.success(isKo ? "브랜딩이 저장되었습니다" : "Branding saved");
      } else {
        toast.error(result.error || (isKo ? "저장 실패" : "Failed to save"));
      }
    } catch {
      toast.error(isKo ? "오류가 발생했습니다" : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoBase64(undefined);
    const result = await removeLogo();
    if (!result.success) {
      toast.error(isKo ? "로고 삭제 실패" : "Failed to remove logo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {isKo ? "회사명" : "Company Name"}
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder={isKo ? "예: ABC Logistics" : "e.g., ABC Logistics"}
          maxLength={100}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <p className="mt-1 text-xs text-slate-500">
          {isKo ? "견적서 헤더에 표시됩니다" : "Displayed in quotation header"}
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {isKo ? "회사 로고" : "Company Logo"}
        </label>
        <LogoUpload
          value={logoBase64}
          onChange={(val) => {
            if (val) {
              setLogoBase64(val);
            } else {
              handleRemoveLogo();
            }
          }}
        />
      </div>

      {/* Primary Color */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {isKo ? "브랜드 컬러" : "Brand Color"}
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setPrimaryColor(color)}
              className={`w-10 h-10 rounded-lg transition-all ${
                primaryColor === color
                  ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              pattern="^#[0-9A-Fa-f]{6}$"
              className="w-24 px-2 py-1 text-sm rounded border border-slate-300 font-mono"
              placeholder="#1e3a8a"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {isKo ? "견적서 헤더 배경색입니다" : "Used for quotation header background"}
        </p>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {isKo ? "연락처 이메일" : "Contact Email"}
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contact@company.com"
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {isKo ? "연락처 전화번호" : "Contact Phone"}
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+82 10-1234-5678"
            maxLength={30}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {isKo ? "미리보기" : "Preview"}
        </label>
        <div
          className="rounded-xl px-6 py-4 text-white"
          style={{ background: `linear-gradient(to right, ${primaryColor}, ${adjustColor(primaryColor, 20)})` }}
        >
          <div className="flex items-center gap-3">
            {logoBase64 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoBase64} alt="Logo" className="h-8 w-8 object-contain bg-white rounded p-0.5" />
            )}
            <span className="font-semibold">
              {companyName || "FwdLink"}
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-4 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isKo ? "저장 중..." : "Saving..."}
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {isKo ? "브랜딩 저장" : "Save Branding"}
          </>
        )}
      </button>
    </form>
  );
}

// Helper to lighten/darken color
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}
