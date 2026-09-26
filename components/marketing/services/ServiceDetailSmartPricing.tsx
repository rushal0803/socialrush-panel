"use client";

import Link from "next/link";
import { ArrowRight, Calculator, Check, Clock3, RefreshCw, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PlatformIcon from "@/components/PlatformIcon";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { buildQuantityMerchandising } from "@/lib/cro/quantity-merchandising";
import { platformMeta, type SmmService } from "@/lib/smm-service-catalog";

function compactQuantity(value: number) {
  if (value >= 1000000) return `${value / 1000000}M`;
  if (value >= 1000) return `${value / 1000}K`;
  return value.toLocaleString("en-IN");
}

function cleanQuantity(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

export default function ServiceDetailSmartPricing({ service }: { service: SmmService }) {
  const { currency } = usePreferredCurrency("INR");
  const [open, setOpen] = useState(false);
  const requiresLiveFacts = Boolean(service.requiresLiveCatalogFacts);
  const quantityOptions = useMemo(
    () => (requiresLiveFacts ? [] : buildQuantityMerchandising(service)),
    [requiresLiveFacts, service],
  );
  const defaultQuantity =
    quantityOptions.find((option) => option.label === "Balanced")?.value ??
    quantityOptions[0]?.value ??
    service.minQuantity;
  const [quantityInput, setQuantityInput] = useState(
    requiresLiveFacts ? "" : String(defaultQuantity),
  );

  useEffect(() => {
    setQuantityInput(requiresLiveFacts ? "" : String(defaultQuantity));
  }, [defaultQuantity, requiresLiveFacts, service.code]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const quantity = Number(quantityInput || 0);
  const step = service.quantityStep ?? 1;
  const quantityValid =
    !requiresLiveFacts &&
    Number.isFinite(quantity) &&
    quantity >= service.minQuantity &&
    quantity <= service.maxQuantity &&
    (quantity - service.minQuantity) % step === 0;
  const estimatedTotal = quantityValid
    ? Math.round((quantity * service.pricePer1000 * 100) / 1000) / 100
    : 0;
  const orderHref = requiresLiveFacts
    ? `/dashboard/new-order?platform=${encodeURIComponent(service.platform)}&service=${encodeURIComponent(service.code)}`
    : quantityValid
      ? `/dashboard/new-order?platform=${encodeURIComponent(service.platform)}&service=${encodeURIComponent(service.code)}&prefill=1&quantity=${quantity}`
      : `/dashboard/new-order?platform=${encodeURIComponent(service.platform)}&service=${encodeURIComponent(service.code)}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-1/2 z-[75] inline-flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-2xl border border-orange-300/30 bg-[#101014]/95 px-4 text-sm font-black text-white shadow-[0_18px_50px_-24px_rgba(255,122,0,.9)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-orange-300/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 motion-reduce:transition-none sm:bottom-6"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Calculator className="h-4 w-4 text-orange-300" aria-hidden="true" />
        {requiresLiveFacts ? "Check live pricing" : "Plan quantity & price"}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-end bg-black/70 p-2 backdrop-blur-sm sm:place-items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="smart-pricing-title"
            className="w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d0d11] text-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Smart pricing</p>
                <h2 id="smart-pricing-title" className="mt-1 text-xl font-black sm:text-2xl">
                  {service.name}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-[#9EA5B1]">
                  <PlatformIcon platform={platformMeta[service.platform].icon} className="h-4 w-4" />
                  {platformMeta[service.platform].label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close smart pricing"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-[#AAB1BC] transition hover:border-orange-300/35 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.05fr_.95fr]">
              <div>
                {requiresLiveFacts ? (
                  <div className="rounded-3xl border border-orange-300/20 bg-orange-500/[.07] p-5">
                    <RefreshCw className="h-5 w-5 text-orange-300" />
                    <h3 className="mt-3 text-lg font-black">Live catalog pricing</h3>
                    <p className="mt-2 text-sm leading-6 text-[#B4BAC4]">
                      This service uses protected live catalog facts. SocialRUSH will load the current rate, limits and availability in the existing order builder before checkout.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-3xl border border-white/10 bg-[#121217] p-4 sm:p-5">
                      <label htmlFor="smart-pricing-quantity" className="text-xs font-black text-[#D9DDE4]">
                        Choose quantity
                      </label>
                      <input
                        id="smart-pricing-quantity"
                        value={quantityInput}
                        onChange={(event) => setQuantityInput(cleanQuantity(event.target.value))}
                        inputMode="numeric"
                        className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#08080b] px-4 text-base font-black outline-none transition focus:border-orange-400/60 focus:ring-2 focus:ring-orange-500/15"
                        aria-describedby="smart-pricing-range"
                      />
                      <p id="smart-pricing-range" className="mt-2 text-[11px] font-semibold text-[#858D99]">
                        Allowed: {service.minQuantity.toLocaleString("en-IN")}–{service.maxQuantity.toLocaleString("en-IN")}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {quantityOptions.map((option) => {
                          const active = quantity === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setQuantityInput(String(option.value))}
                              className={`relative min-h-14 rounded-xl border px-3 text-left transition ${
                                active
                                  ? "border-orange-400/55 bg-orange-500/[.12] text-white"
                                  : "border-white/10 bg-white/[.025] text-[#C3C8D0] hover:border-white/20"
                              }`}
                            >
                              <span className="block text-sm font-black">{compactQuantity(option.value)}</span>
                              <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[.12em] text-[#7F8794]">
                                {option.label ?? "Option"}
                              </span>
                              {active ? <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-orange-300" /> : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {!quantityValid ? (
                      <p className="mt-2 text-xs font-bold text-amber-300">
                        Enter a quantity inside the supported range to calculate an estimate.
                      </p>
                    ) : null}
                  </>
                )}
              </div>

              <aside className="rounded-3xl border border-white/10 bg-[#121217] p-5">
                <p className="text-[10px] font-black uppercase tracking-[.15em] text-orange-300">Order snapshot</p>
                {!requiresLiveFacts ? (
                  <div className="mt-3 rounded-2xl border border-orange-300/20 bg-orange-500/[.07] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#9EA5B1]">Estimated total</p>
                    <strong className="mt-1 block text-3xl font-black">
                      {quantityValid ? formatCurrency(estimatedTotal, currency) : "—"}
                    </strong>
                    <p className="mt-1 text-[11px] font-semibold text-[#9EA5B1]">
                      Based on {formatCurrency(service.pricePer1000, currency)} / 1K.
                    </p>
                  </div>
                ) : null}

                <dl className="mt-4 grid gap-2 text-xs">
                  <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3">
                    <dt className="flex items-center gap-2 font-bold text-[#8A929E]"><Clock3 className="h-3.5 w-3.5 text-orange-300" />Delivery</dt>
                    <dd className="mt-1 font-black text-white">{service.deliveryTime}</dd>
                  </div>
                  <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3">
                    <dt className="flex items-center gap-2 font-bold text-[#8A929E]"><RefreshCw className="h-3.5 w-3.5 text-orange-300" />Refill / support</dt>
                    <dd className="mt-1 font-black text-white">{service.refillPolicy}</dd>
                  </div>
                  <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3">
                    <dt className="flex items-center gap-2 font-bold text-[#8A929E]"><ShieldCheck className="h-3.5 w-3.5 text-orange-300" />Before ordering</dt>
                    <dd className="mt-1 leading-5 text-[#D4D8DE]">{service.importantInstruction}</dd>
                  </div>
                </dl>

                <Link
                  href={orderHref}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-sm font-black text-white shadow-[0_14px_30px_-20px_rgba(255,122,0,.9)] transition hover:brightness-110"
                >
                  {requiresLiveFacts ? "Open live order builder" : "Continue with this quantity"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-[10px] leading-4 text-[#767E8B]">
                  {requiresLiveFacts
                    ? "Availability and current live facts are verified again in the order flow."
                    : "This is a planning estimate. The existing order flow validates the service, quantity and current price again before checkout."}
                </p>
              </aside>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
