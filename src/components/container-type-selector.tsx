"use client";

import { cn } from "@/lib/utils";

export type ContainerType = "20GP" | "40GP" | "40HQ";

interface ContainerTypeSelectorProps {
  value: ContainerType;
  onChange: (type: ContainerType) => void;
  locale?: string;
}

const CONTAINER_TYPES: { value: ContainerType; label: string }[] = [
  { value: "20GP", label: "20GP" },
  { value: "40GP", label: "40GP" },
  { value: "40HQ", label: "40HQ" },
];

export default function ContainerTypeSelector({
  value,
  onChange,
  locale = "en",
}: ContainerTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">
        {locale === "ko" ? "컨테이너 타입" : "Container Type"}
      </label>
      <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-white">
        {CONTAINER_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-semibold transition-colors",
              value === type.value
                ? "bg-blue-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
