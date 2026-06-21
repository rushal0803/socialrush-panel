import Link from "next/link";
import Logo from "@/components/Logo";

export default function MarketingHeader() {
  return <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8"><Logo/><nav aria-label="Public navigation" className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex"><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/about">About</Link><Link href="/case-studies">Case Studies</Link><Link href="/contact">Contact</Link><Link href="/faq">FAQ</Link></nav><div className="flex items-center gap-2"><Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 sm:block">Sign In</Link><Link href="/contact" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">Start a Project</Link></div></div></header>;
}
