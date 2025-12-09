"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1 border-2 border-neutral-200 shadow-sm">
      <Globe className="hidden" aria-hidden />
      <button
        onClick={() => setLanguage("sq")}
        className={`relative px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
          language === "sq"
            ? "bg-gradient-to-r from-[#7CC4E8] to-[#F7B6C7] text-white shadow-md"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
        aria-label="Switch to Albanian"
      >
        SQ
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`relative px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
          language === "en"
            ? "bg-gradient-to-r from-[#7CC4E8] to-[#F7B6C7] text-white shadow-md"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
