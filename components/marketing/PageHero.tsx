import Link from "next/link";
import PortalCTA from "./PortalCTA";

export default function PageHero({ eyebrow, title, description, action = "Start Growing", actionHref }: { eyebrow: string; title: string; description: string; action?: string; actionHref?: string }) {
  const className = "mt-8 inline-flex min-h-12 items-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-cyan-400/20";
  return <section className="relative overflow-hidden bg-[linear-gradient(180deg,#07152f_0%,#0f1b3a_60%,#111f4c_100%)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-28"><div className="hero-grid absolute inset-0 opacity-40" /><div className="relative mx-auto max-w-4xl text-center"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-300 sm:text-xs sm:tracking-[.2em]">{eyebrow}</p><h1 className="mt-5 break-words text-3xl font-bold leading-[1.08] tracking-[-.045em] text-white sm:text-5xl lg:text-6xl">{title}</h1><p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">{description}</p>{actionHref ? <Link href={actionHref} className={className}>{action} →</Link> : <PortalCTA className={className}>{action} →</PortalCTA>}</div></section>;
}
