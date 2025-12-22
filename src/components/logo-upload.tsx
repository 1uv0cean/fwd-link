"use client";

import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface LogoUploadProps {
  value?: string; // Base64 string
  onChange: (base64: string | undefined) => void;
  disabled?: boolean;
}

const MAX_SIZE_KB = 500;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export default function LogoUpload({ value, onChange, disabled }: LogoUploadProps) {
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError("");

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("PNG, JPG, WebP, SVG 파일만 가능합니다");
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_KB * 1024) {
      setError(`파일 크기는 ${MAX_SIZE_KB}KB 이하여야 합니다`);
      return;
    }

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onChange(base64);
    };
    reader.onerror = () => {
      setError("파일 읽기 실패");
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {value ? (
        // Preview
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-xl border-2 border-slate-200 bg-white p-2 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Logo preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        // Upload zone
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`
            w-full h-32 rounded-xl border-2 border-dashed 
            flex flex-col items-center justify-center gap-2
            transition-colors cursor-pointer
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${isDragging 
              ? "border-blue-500 bg-blue-50" 
              : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
            }
          `}
        >
          <Upload className={`w-8 h-8 ${isDragging ? "text-blue-500" : "text-slate-400"}`} />
          <p className="text-sm text-slate-500">
            클릭 또는 드래그하여 업로드
          </p>
          <p className="text-xs text-slate-400">
            PNG, JPG, WebP, SVG (최대 {MAX_SIZE_KB}KB)
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
