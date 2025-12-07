"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import portsData from "@/data/ports.json";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { useState } from "react";

export interface Port {
  name: string;
  code: string;
  country: string;
  flag: string;
}

interface PortComboboxProps {
  value: Port | null;
  onChange: (port: Port | null) => void;
  placeholder?: string;
  label?: string;
  locale?: string;
}

export default function PortCombobox({
  value,
  onChange,
  placeholder = "Select port...",
  label,
  locale = "en",
}: PortComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const ports: Port[] = portsData;

  const filteredPorts = ports.filter(
    (port) =>
      port.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      port.code.toLowerCase().includes(inputValue.toLowerCase()) ||
      port.country.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (port: Port) => {
    onChange(port);
    setOpen(false);
    setInputValue("");
  };

  const handleCustomInput = () => {
    if (inputValue.trim()) {
      const customPort: Port = {
        name: inputValue.toUpperCase().trim(),
        code: "",
        country: "",
        flag: "📍",
      };
      onChange(customPort);
      setOpen(false);
      setInputValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <span>{value.flag}</span>
              <span className="font-medium">{value.name}</span>
              {value.code && (
                <span className="text-slate-500 text-sm">({value.code})</span>
              )}
            </span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="bg-white">
          <CommandInput
            placeholder={locale === "ko" ? "항구 검색..." : "Search port..."}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty className="p-2">
              {inputValue.trim() && (
                <button
                  onClick={handleCustomInput}
                  className="w-full p-2 text-left hover:bg-slate-100 rounded flex items-center gap-2 text-slate-700"
                >
                  <MapPin className="w-4 h-4" />
                  <span>
                    {locale === "ko"
                      ? `"${inputValue.toUpperCase()}" 직접 입력`
                      : `Use "${inputValue.toUpperCase()}" as custom`}
                  </span>
                </button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredPorts.map((port) => (
                <CommandItem
                  key={port.code}
                  value={`${port.name} ${port.code}`}
                  onSelect={() => handleSelect(port)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.code === port.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2">{port.flag}</span>
                  <span className="font-medium">{port.name}</span>
                  <span className="ml-2 text-slate-500 text-sm">
                    ({port.code})
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
