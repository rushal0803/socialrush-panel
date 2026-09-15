"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/events";

const PREFIX = "socialrush-upi-recovery:";
const MAX_AGE = 30 * 60 * 1000;

type Recovery = { intent?: { total?: number }; paymentStarted?: boolean; savedAt?: number };
type Candidate = { href: string; amount: number; paymentStarted: boolean; ageMinutes: number };

export default function AbandonedCheckoutRecovery() {
  const pathname = usePathname();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const hidden = pathname === "/dashboard/order-summary";

  useEffect(() => {
    if (hidden) return;
    let newest: Candidate | null = null;
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      try {
        const raw = sessionStorage.getItem(key);
        if (!raw) continue;
        const recovery = JSON.parse(raw) as Recovery;
        const savedAt = Number(recovery.savedAt || 0);
        const age = Date.now() - savedAt;
        if (!savedAt || age < 60_000 || age > MAX_AGE) continue;
        const fingerprint = key.slice(PREFIX.length);
        const first = fingerprint.indexOf(":");
        const second = fingerprint.indexOf(":", first + 1);
        if (first < 1 || second < 0) continue;
        const service = fingerprint.slice(0, first);
        const quantity = fingerprint.slice(first + 1, second);
        const link = fingerprint.slice(second + 1);
        if (!service || !quantity || !link) continue;
        const next = {
          href: `/dashboard/order-summary?service=${encodeURIComponent(service)}&quantity=${encodeURIComponent(quantity)}&link=${encodeURIComponent(link)}`,
          amount: Number(recovery.intent?.total || 0),
          paymentStarted: Boolean(recovery.paymentStarted),
          ageMinutes: Math.max(1, Math.floor(age / 60_000)),
        };
        if (!newest || next.ageMinutes < newest.ageMinutes) newest = next;
      } catch { /* ignore malformed recovery entries */ }
    }
    setCandidate(newest);
  }, [hidden, pathname]);

  const amount = useMemo(() => candidate?.amount ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(candidate.amount) : "your order", [candidate]);
  if (hidden || !candidate) return null;

  return <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8"><div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.14em] text-orange-700">Checkout saved</p><p className="mt-1 text-sm font-bold text-slate-950">{candidate.paymentStarted ? `Already paid ${amount}? Return and submit your UTR — do not pay again.` : `Continue your ${amount} checkout from where you left off.`}</p><p className="mt-1 text-xs text-slate-600">Saved {candidate.ageMinutes} min ago. Checkout recovery expires after 30 minutes.</p></div><Link href={candidate.href} onClick={() => track("checkout_recovery_click", { source: "dashboard_recovery", payment_started: candidate.paymentStarted })} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-4 text-xs font-black text-white">{candidate.paymentStarted ? "Return to UTR step" : "Continue checkout"}</Link></div></div>;
}
