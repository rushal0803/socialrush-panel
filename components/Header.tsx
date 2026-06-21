import Link from "next/link";
import Logo from "./Logo";
import { NavLinks } from "./Sidebar";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
      <div className="lg:hidden"><Logo /></div>
      <div className="hidden lg:block"><p className="text-xs font-medium uppercase tracking-widest text-slate-400">SocialRUSH workspace</p><p className="mt-1 text-sm font-semibold text-slate-700">Welcome back, Alex</p></div>
      <div className="flex items-center gap-3">
        <Link href="/dashboard/new-order" className="hidden rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 sm:block">+ New campaign</Link>
        <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></svg><i className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" /></button>
        <div className="hidden text-right sm:block"><p className="text-sm font-semibold">Alex Morgan</p><p className="text-xs text-slate-400">Administrator</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b1e42] text-sm font-bold text-white">AM</span>
        <details className="group relative lg:hidden"><summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 text-slate-600"><span className="text-lg">☰</span></summary><div className="absolute right-0 top-12 w-64 rounded-2xl bg-[#08152f] p-3 shadow-2xl"><NavLinks mobile /></div></details>
      </div>
    </header>
  );
}
