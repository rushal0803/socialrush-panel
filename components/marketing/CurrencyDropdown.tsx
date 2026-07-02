"use client";

import { useEffect, useRef, useState } from "react";
import { currencies, type Currency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

export default function CurrencyDropdown({
  compact = false,
  tone = "default",
}: {
  compact?: boolean;
  tone?: "default" | "light3d";
}) {
  const { currency, setCurrency } = usePreferredCurrency("INR");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
          tone === "light3d"
            ? "border border-[#FFF3E0] bg-white/85 text-[#0B0B0F] shadow-[0_10px_20px_-14px_rgba(255, 159, 0, .45)] hover:border-[#FF9F00]"
            : "border border-amber-300/35 bg-white/5 text-slate-100 hover:border-amber-300/50"
        } ${compact ? "min-h-10" : "min-h-11"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{currency}</span>
        <span className="text-[10px]">▾</span>
      </button>

      {open && (
        <div
          className={`absolute right-0 top-[calc(100%+8px)] z-50 min-w-[180px] overflow-hidden rounded-xl shadow-2xl ${
            tone === "light3d"
              ? "border border-[#FFF3E0] bg-white/95"
              : "border border-amber-300/30 bg-[#0B0B0F]"
          }`}
        >
          <ul role="listbox" className="py-1">
            {currencies.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency(item.code as Currency);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition ${
                    tone === "light3d"
                      ? `hover:bg-[#FFF8F1] ${currency === item.code ? "text-[#0B0B0F]" : "text-[#111827]"}`
                      : `hover:bg-white/10 ${currency === item.code ? "text-amber-200" : "text-slate-200"}`
                  }`}
                >
                  <span>{item.code}</span>
                  <span className={`text-[11px] ${tone === "light3d" ? "text-[#FF9F00]" : "text-slate-400"}`}>{item.symbol}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
