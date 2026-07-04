"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export function LocalePicker({ className }: { className?: string }) {
  const { locale, setLocale, locales } = useI18n();

  return (
    <label className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <Globe className="h-4 w-4 text-gray-400" aria-hidden />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className="rounded-lg border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/10"
        aria-label="Language"
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
