"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

const BalanceContext = createContext<number | null>(null);

/** One customer-filtered subscription for the persistent workspace shell. */
export default function DashboardBalanceProvider({ userId, initialBalance, children }: { userId: string; initialBalance: number; children: ReactNode }) {
  const [balance, setBalance] = useState(Number(initialBalance));
  useEffect(() => setBalance(Number(initialBalance)), [initialBalance, userId]);
  useEffect(() => {
    const supabase = createClient();
    const update = (value: unknown) => { const next = Number(value); if (Number.isFinite(next)) setBalance(next); };
    const onBalance = (event: Event) => update((event as CustomEvent<number>).detail);
    window.addEventListener("wallet-balance-updated", onBalance);
    const channel = supabase.channel(`dashboard-balance:${userId}`).on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
      payload => { const row = payload.new as { id?: string; balance?: unknown }; if (row.id === userId) update(row.balance); },
    ).subscribe();
    return () => { window.removeEventListener("wallet-balance-updated", onBalance); void supabase.removeChannel(channel); };
  }, [userId]);
  return <BalanceContext.Provider value={balance}>{children}</BalanceContext.Provider>;
}

export function useDashboardBalance(fallback: number) { return useContext(BalanceContext) ?? fallback; }
