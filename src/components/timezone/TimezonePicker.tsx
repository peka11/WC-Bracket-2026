"use client";

import { Globe } from "lucide-react";
import { useTimezone } from "@/components/timezone/TimezoneProvider";

export function TimezonePicker({ className }: { className?: string }) {
  const { timezone, setTimezone, options } = useTimezone();

  return (
    <label className={className}>
      <span className="sr-only">Timezone</span>
      <div className="relative flex items-center">
        <Globe className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-gray-400" />
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="appearance-none rounded-lg border border-black/10 bg-transparent py-1.5 pl-7 pr-6 text-xs font-medium text-gray-600 hover:bg-black/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          aria-label="Select timezone"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}
