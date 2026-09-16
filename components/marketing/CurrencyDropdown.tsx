"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { currencies, type Currency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

export default function CurrencyDropdown({
  compact = false,
  tone = "default",
}: {
  compact?: boolean;
  tone?: "default" | "light3d";
}) {
  const { currency, setCurrency } = usePreferredCurrency();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  void tone;

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onHeaderDetailsToggle = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLDetailsElement)) return;
      if (!target.open || !target.closest("header")) return;
      setOpen(false);
    };

    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("toggle", onHeaderDetailsToggle, true);

    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("toggle", onHeaderDetailsToggle, true);
    };
  }, []);

  const toggleCurrencyMenu = () => {
    setOpen((value) => {
      const next = !value;

      if (next) {
        document.querySelectorAll<HTMLDetailsElement>("header details[open]").forEach((details) => {
          details.removeAttribute("open");
        });
      }

      return next;
    });
  };

  return (
    <div ref={rootRef} className="relative z-[100] isolate">
      <span className="sr-only" id={labelId}>Display currency</span>
      <button
        type="button"
        onClick={toggleCurrencyMenu}
        className={`inline-flex items-center gap-2 rounded-sr-control border border-sr-border bg-surface-secondary px-3 py-2 text-xs font-bold text-content-primary outline-none transition duration-fast ease-sr-out hover:border-sr-border-strong hover:bg-white/[.05] focus-visible:shadow-sr-focus ${compact ? "min-h-10" : "min-h-11"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
      >
        <Globe2 className="h-3.5 w-3.5 text-orange-300" aria-hidden="true" />
        <span>{currency}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-content-muted transition-transform duration-fast ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[140] max-h-[min(25rem,calc(100vh-6rem))] min-w-[176px] overflow-y-auto rounded-2xl border border-sr-border-strong bg-[#0B0D12] p-1 shadow-[0_30px_90px_rgba(0,0,0,.78)] ring-1 ring-black/40">
          <ul role="listbox" className="grid gap-0.5">
            {currencies.map((item) => {
              const selected = currency === item.code;
              return (
                <li key={item.code} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency(item.code as Currency);
                      setOpen(false);
                    }}
                    className={`flex min-h-9 w-full items-center justify-between gap-4 rounded-xl px-3 py-2 text-left text-xs outline-none transition hover:bg-white/[.05] focus-visible:shadow-sr-focus ${selected ? "bg-action/10 text-orange-100" : "text-content-secondary"}`}
                  >
                    <span className="font-bold">{item.code} <span className="font-medium text-content-muted">{item.symbol}</span><span className="sr-only"> {item.name}</span></span>
                    {selected ? <Check className="h-3.5 w-3.5 text-orange-300" aria-hidden="true" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <style jsx global>{`
        header details[open] {
          z-index: 120 !important;
          isolation: isolate;
        }

        header details > div {
          background: #0b0d12 !important;
          -webkit-backdrop-filter: none !important;
          backdrop-filter: none !important;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.78) !important;
          isolation: isolate;
        }
      `}</style>
    </div>
  );
}
