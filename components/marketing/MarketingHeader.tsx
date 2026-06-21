"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

const nav = [["Home","/"],["Services","/services"],["Pricing","/pricing"],["About","/about"],["Case Studies","/case-studies"],["Blog","/blog"],["Contact","/contact"]];

export default function MarketingHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => setAuthenticated(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);
  async function signOut() { await createClient().auth.signOut(); setOpen(false); router.replace("/"); router.refresh(); }
  return <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8"><Logo/><nav aria-label="Public navigation" className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex">{nav.map(([label,href]) => <Link key={href} href={href} className="transition hover:text-blue-600">{label}</Link>)}</nav><div className="hidden items-center gap-2 sm:flex">{authenticated ? <Link href="/dashboard" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">Dashboard</Link> : <><Link href="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600">Sign In</Link><Link href="/register" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20">Start a Project</Link></>}</div><button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 sm:hidden"><span className="text-xl">{open ? "×" : "☰"}</span></button></div>{open && <div className="border-t border-slate-100 bg-white px-5 py-5 shadow-xl sm:hidden"><nav className="grid gap-1">{nav.map(([label,href]) => <Link key={href} onClick={() => setOpen(false)} href={href} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50">{label}</Link>)}</nav><div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">{authenticated ? <><Link onClick={() => setOpen(false)} href="/dashboard" className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white">Dashboard</Link><button onClick={signOut} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">Logout</button></> : <><Link onClick={() => setOpen(false)} href="/login" className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700">Login</Link><Link onClick={() => setOpen(false)} href="/register" className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white">Register</Link></>}</div></div>}</header>;
}
