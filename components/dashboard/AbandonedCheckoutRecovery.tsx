"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/events";

const LEGACY_PREFIX = "socialrush-upi-recovery:";
const DIRECT_PREFIX = "socialrush-direct-payment:";
const MAX_AGE = 30 * 60 * 1000;

type Recovery = { intent?: { total?: number }; paymentStarted?: boolean; started?: boolean; savedAt?: number; total?: number; serviceCode?: string };
type Candidate = { href: string; amount: number; paymentStarted: boolean; ageMinutes: number; source: "legacy" | "direct" };

export default function AbandonedCheckoutRecovery() {
  const pathname = usePathname();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const hidden = pathname === "/dashboard/order-summary";

  useEffect(() => {
    if (hidden) return;
    let newest: Candidate | null = null;
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      try {
        const raw = sessionStorage.getItem(key);
        if (!raw) continue;
        const recovery = JSON.parse(raw) as Recovery;
        const savedAt = Number(recovery.savedAt || 0);
        const age = Date.now() - savedAt;
        if (!savedAt || age > MAX_AGE) {
          if (savedAt && age > MAX_AGE && (key.startsWith(LEGACY_PREFIX) || key.startsWith(DIRECT_PREFIX))) sessionStorage.removeItem(key);
          continue;
        }
        if (age < 60_000) continue;

        let next: Candidate | null = null;
        if (key.startsWith(DIRECT_PREFIX)) {
          const intentId = key.slice(DIRECT_PREFIX.length);
          if (/^[0-9a-f-]{36}$/i.test(intentId)) {
            next = {
              href: `/dashboard/direct-upi?intent=${encodeURIComponent(intentId)}`,
              amount: Number(recovery.total || 0),
              paymentStarted: Boolean(recovery.started),
              ageMinutes: Math.max(1, Math.floor(age / 60_000)),
              source: "direct",
            };
          }
        } else if (key.startsWith(LEGACY_PREFIX)) {
          const fingerprint = key.slice(LEGACY_PREFIX.length);
          const first = fingerprint.indexOf(":");
          const second = fingerprint.indexOf(":", first + 1);
          if (first >= 1 && second >= 0) {
            const service = fingerprint.slice(0, first);
            const quantity = fingerprint.slice(first + 1, second);
            const link = fingerprint.slice(second + 1);
            if (service && quantity && link) {
              next = {
                href: `/dashboard/order-summary?service=${encodeURIComponent(service)}&quantity=${encodeURIComponent(quantity)}&link=${encodeURIComponent(link)}`,
                amount: Number(recovery.intent?.total || 0),
                paymentStarted: Boolean(recovery.paymentStarted),
                ageMinutes: Math.max(1, Math.floor(age / 60_000)),
                source: "legacy",
              };
            }
          }
        }
        if (next && (!newest || next.ageMinutes < newest.ageMinutes)) newest = next;
      } catch { /* ignore malformed recovery entries */ }
    }
    setCandidate(newest);
  }, [hidden, pathname]);

  useEffect(() => {
    if (!candidate) return;
    track("checkout_recovery_view", {
      source: candidate.source === "direct" ? "direct_payment_recovery" : "dashboard_recovery",
      payment_started: candidate.paymentStarted,
    });
  }, [candidate]);

  const amount = useMemo(() => candidate?.amount ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(candidate.amount) : "your order", [candidate]);
  if (hidden || !candidate) return null;

  return <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8"><div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.14em] text-orange-700">Checkout saved</p><p className="mt-1 text-sm font-bold text-slate-950">{candidate.paymentStarted ? `Already paid ${amount}? Return and submit your UTR — do not pay again.` : `Continue your ${amount} checkout from where you left off.`}</p><p className="mt-1 text-xs text-slate-600">Saved {candidate.ageMinutes} min ago. Checkout recovery expires after 30 minutes.</p></div><Link href={candidate.href} onClick={() => track("checkout_recovery_click", { source: candidate.source === "direct" ? "direct_payment_recovery" : "dashboard_recovery", payment_started: candidate.paymentStarted })} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-4 text-xs font-black text-white">{candidate.paymentStarted ? "Return to payment / UTR" : "Continue payment"}</Link></div></div>;
}
