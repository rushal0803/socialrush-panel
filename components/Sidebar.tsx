"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

export const dashboardLinks = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "New Campaign", href: "/dashboard/new-order", icon: "plus" },
  { label: "Add Funds", href: "/dashboard/add-funds", icon: "wallet" },
  { label: "Campaign History", href: "/dashboard/order-history", icon: "orders" },
  { label: "API Docs", href: "/dashboard/api-docs", icon: "code" },
  { label: "Support", href: "/dashboard/support", icon: "support" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
] as const;

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    plus: <><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></>,
    wallet: <><path d="M4 7.5h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h12"/><path d="M16 13h5M17 13h.01"/></>,
    orders: <><path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
    code: <><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14"/></>,
    support: <><path d="M4 13a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-2v-7h4M4 13v7h4v-7H4Z"/><path d="M16 20c0 1-1.8 2-4 2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z"/></>,
  };
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return <nav className={mobile ? "grid gap-1" : "space-y-1"} aria-label="Dashboard navigation">{dashboardLinks.map((item) => {
    const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
    return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><NavIcon name={item.icon} />{item.label}</Link>;
  })}</nav>;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    const supabase = createClient(); let userId = "";
    const load = async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) { setBalance(0); return; } userId = user.id; const { data } = await supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle(); setBalance(Number(data?.balance ?? 0)); };
    void load();
    const handleBalance = (event: Event) => setBalance(Number((event as CustomEvent<number>).detail ?? 0));
    window.addEventListener("wallet-balance-updated", handleBalance);
    const channel = supabase.channel("sidebar-balance").on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (payload) => { const row = payload.new as { id?: string; balance?: number | string }; if (row.id === userId) setBalance(Number(row.balance ?? 0)); }).subscribe();
    return () => { window.removeEventListener("wallet-balance-updated", handleBalance); void supabase.removeChannel(channel); };
  }, [pathname]);
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col bg-[#08152f] px-4 py-6 lg:sticky lg:top-0 lg:flex">
      <div className="px-2"><Logo light /></div>
      <p className="mb-3 mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Main menu</p>
      <NavLinks />
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-white"><div className="flex items-center justify-between"><p className="text-xs text-slate-400">Available balance</p><span className="h-2 w-2 rounded-full bg-emerald-400" /></div>{balance === null ? <div className="mt-3 h-7 w-32 animate-pulse rounded-lg bg-white/10"/> : <p className="mt-2 text-2xl font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(balance)}</p>}<Link href="/dashboard/add-funds" className="mt-4 block w-full rounded-lg bg-blue-600 py-2.5 text-center text-xs font-bold transition hover:bg-blue-500">Add funds</Link></div>
      <form action={logout} className="mt-4"><button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-white/5 hover:text-white"><span>↪</span> Log out</button></form>
    </aside>
  );
}
