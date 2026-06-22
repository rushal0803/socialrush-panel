"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

const nav = [["Home", "/"], ["Services", "/services"], ["Pricing", "/pricing"], ["About", "/about"], ["Case Studies", "/case-studies"], ["Blog", "/blog"], ["Contact", "/contact"]];

export default function MarketingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => setAuthenticated(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  async function signOut() {
    await createClient().auth.signOut();
    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  return <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:h-[76px] sm:px-6 lg:px-8"><Logo /><nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex">{nav.map(([label, href]) => <Link key={href} href={href} className={`transition hover:text-blue-600 ${pathname === href ? "text-blue-600" : ""}`}>{label}</Link>)}</nav><div className="hidden items-center gap-2 lg:flex">{authenticated ? <Link href="/dashboard" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">Dashboard</Link> : <><Link href="/login" className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600">Sign In</Link><Link href="/register" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">Start Growing</Link></>}</div><button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-xl text-[#07152f] lg:hidden">{open ? "×" : "☰"}</button></div>{open && <div className="border-t border-slate-100 bg-white px-5 py-5 shadow-xl lg:hidden"><nav className="mx-auto grid max-w-7xl gap-1">{nav.map(([label, href]) => <Link key={href} href={href} className={`rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-blue-50 ${pathname === href ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}>{label}</Link>)}</nav><div className="mx-auto mt-4 grid max-w-7xl grid-cols-2 gap-2 border-t border-slate-100 pt-4">{authenticated ? <><Link href="/dashboard" className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white">Dashboard</Link><button onClick={signOut} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">Logout</button></> : <><Link href="/login" className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold">Login</Link><Link href="/register" className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white">Register</Link></>}</div></div>}</header>;
}
