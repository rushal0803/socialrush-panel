"use client";

import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Clock3, Package, RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import PlatformIcon from "@/components/PlatformIcon";
import ServiceHealthBadge from "@/components/ServiceHealthBadge";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { activeSmmServices, platformMeta, type SmmPlatformId } from "@/lib/smm-service-catalog";
import { useServiceHealth } from "@/lib/use-service-health";

const platforms: SmmPlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];

const platformColors: Record<SmmPlatformId, string> = {
  instagram: "text-pink-300", youtube: "text-red-400", facebook: "text-blue-300", linkedin: "text-sky-300",
  telegram: "text-cyan-300", tiktok: "text-fuchsia-300", x: "text-white",
};

const servicePaths: Record<string, string> = {
  "instagram-followers": "/buy-instagram-followers-india", "instagram-likes": "/instagram-likes", "instagram-views": "/instagram-views",
  "youtube-subscribers": "/youtube-subscribers", "youtube-likes": "/youtube-likes", "youtube-views": "/youtube-views",
  "facebook-followers": "/facebook-followers", "facebook-likes": "/facebook-likes", "linkedin-followers": "/linkedin-followers",
  "linkedin-likes": "/linkedin-likes", "telegram-members": "/telegram-members", "tiktok-followers": "/tiktok-followers", "x-followers": "/twitter-followers",
};

const aliases: Record<string, SmmPlatformId> = { instagram: "instagram", youtube: "youtube", facebook: "facebook", linkedin: "linkedin", telegram: "telegram", tiktok: "tiktok", twitter: "x", x: "x", "twitter-x": "x" };

function typeFor(code: string) {
  if (code.includes("followers")) return "followers";
  if (code.includes("subscribers")) return "subscribers";
  if (code.includes("likes")) return "likes";
  if (code.includes("views")) return "views";
  if (code.includes("members")) return "members";
  if (code.includes("shares")) return "shares";
  return "all";
}

function labelFor(type: string) { return type === "all" ? "All" : type[0].toUpperCase() + type.slice(1); }
function platformFrom(value?: string): SmmPlatformId { return aliases[String(value ?? "").toLowerCase().trim()] ?? "instagram"; }

type Props = { initialPlatformParam?: string; initialTypeParam?: string; initialSearchParam?: string };

export default function ServicesPageContent({ initialPlatformParam, initialTypeParam, initialSearchParam }: Props) {
  const { currency } = usePreferredCurrency("INR");
  const healthByService = useServiceHealth();
  const [platform, setPlatform] = useState<SmmPlatformId>(() => platformFrom(initialPlatformParam || initialTypeParam?.split("-")[0]));
  const [type, setType] = useState("all");
  const [query, setQuery] = useState(initialSearchParam?.trim() ?? "");

  useEffect(() => {
    setPlatform(platformFrom(initialPlatformParam || initialTypeParam?.split("-")[0]));
    setQuery(initialSearchParam?.trim() ?? "");
    setType("all");
  }, [initialPlatformParam, initialSearchParam, initialTypeParam]);

  const types = useMemo(() => ["all", ...Array.from(new Set(activeSmmServices.filter((item) => item.platform === platform).map((item) => typeFor(item.code))))], [platform]);
  const services = useMemo(() => {
    const term = query.trim().toLowerCase();
    return activeSmmServices.filter((item) => item.platform === platform && (type === "all" || typeFor(item.code) === type) && (!term || `${item.name} ${item.description} ${item.code} ${platformMeta[item.platform].label}`.toLowerCase().includes(term)));
  }, [platform, query, type]);

  const clearFilters = () => { setQuery(""); setType("all"); };

  return <BlogShell><main className="relative overflow-x-clip pb-16 text-white sm:pb-20">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_12%_8%,rgba(255,122,0,.15),transparent_27rem),radial-gradient(circle_at_90%_20%,rgba(255,190,80,.08),transparent_24rem)]" />

    <section className="relative px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-8 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[1.6rem] border border-white/10 bg-[#111113]/95 p-5 shadow-[0_24px_70px_-42px_rgba(255,122,0,.8)] sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-[10px] font-black tracking-[.16em] text-orange-200">SERVICES</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-black leading-[1.08] tracking-[-.035em] sm:text-5xl">Find the right service for your growth.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#C7CBD3] sm:text-base sm:leading-7">Explore SocialRUSH services by platform, compare pricing and delivery details, and start your order with confidence.</p>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold text-[#D7DAE0]">
          {["Public link only", "No password required", "Transparent pricing", "Order tracking"].map((item) => <span key={item} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[.045] px-2.5"><Check className="h-3.5 w-3.5 text-emerald-300" />{item}</span>)}
        </div>
      </div>
    </section>

    <section aria-labelledby="discovery-heading" className="relative px-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
      <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black tracking-[.16em] text-orange-300">DISCOVER</p><h2 id="discovery-heading" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Choose a platform</h2></div><p className="hidden text-sm text-[#9DA4B0] sm:block">Select a network to see its live catalog.</p></div>
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {platforms.map((id) => { const active = platform === id; const meta = platformMeta[id]; return <button key={id} type="button" aria-pressed={active} onClick={() => { setPlatform(id); setType("all"); }} className={`group relative flex min-h-[76px] items-center gap-3 rounded-2xl border p-3 text-left transition duration-200 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${active ? "border-orange-400/70 bg-orange-500/[.11] shadow-[0_14px_32px_-24px_rgba(255,122,0,.95)]" : "border-white/10 bg-[#111113] hover:-translate-y-0.5 hover:border-white/25"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/25 ${platformColors[id]}`}><PlatformIcon platform={meta.icon} className="h-5 w-5" /></span><span className="min-w-0 text-xs font-black leading-4">{meta.label}</span>{active && <CheckCircle2 className="absolute right-2 top-2 h-3.5 w-3.5 text-orange-300" />}</button>; })}
      </div>
    </div></section>

    <section className="relative px-4 pt-5 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl rounded-[1.4rem] border border-white/10 bg-[#111113] p-3 sm:p-4"><div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <label className="relative block"><span className="sr-only">Search services</span><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-300" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search followers, likes, views..." className="min-h-12 w-full rounded-xl border border-white/10 bg-[#08080a] py-3 pl-11 pr-11 text-sm font-semibold outline-none placeholder:text-[#77808E] focus:border-orange-400/70 focus:ring-2 focus:ring-orange-500/15" />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#9DA4B0] hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>}</label>
      <div aria-label="Service type filters" className="flex gap-2 overflow-x-auto pb-1 lg:justify-end">{types.map((item) => <button key={item} type="button" onClick={() => setType(item)} aria-pressed={type === item} className={`min-h-10 shrink-0 rounded-xl px-3.5 text-xs font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 ${type === item ? "bg-gradient-to-r from-[#FF7A00] to-[#FFB000] text-white" : "border border-white/10 bg-white/[.04] text-[#C7CBD3] hover:border-orange-400/45"}`}>{labelFor(item)}</button>)}</div>
    </div></div></section>

    <section aria-labelledby="catalog-heading" className="relative px-4 pb-4 pt-7 sm:px-6 sm:pt-10 lg:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black tracking-[.16em] text-orange-300">{platformMeta[platform].label.toUpperCase()}</p><h2 id="catalog-heading" className="mt-2 text-2xl font-black tracking-tight">Available services</h2></div><p className="text-xs font-semibold text-[#9DA4B0]">{services.length} {services.length === 1 ? "service" : "services"} found</p></div>
      {services.length ? <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{services.map((service) => { const health = healthByService[service.code]; const unavailable = Boolean(health && (!health.acceptsNewOrders || health.status === "paused")); const orderHref = `/dashboard/new-order?platform=${encodeURIComponent(service.platform)}&service=${encodeURIComponent(service.code)}`; const detailHref = servicePaths[service.code] ?? `/services/${service.code}`; return <article key={service.code} className="group flex min-w-0 flex-col rounded-3xl border border-white/10 bg-[#111113] p-4 shadow-[0_18px_42px_-34px_rgba(0,0,0,.95)] transition duration-200 hover:-translate-y-1 hover:border-orange-400/40 focus-within:border-orange-400/55 motion-reduce:transition-none sm:p-5"><div className="flex items-start justify-between gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#17171b] ${platformColors[service.platform]}`}><PlatformIcon platform={platformMeta[service.platform].icon} className="h-5 w-5" /></span><ServiceHealthBadge health={health} /></div><h3 className="mt-4 text-lg font-black tracking-tight"><Link href={detailHref} className="transition hover:text-orange-200">{service.name}</Link></h3><p className="mt-1 line-clamp-2 text-sm leading-5 text-[#AEB5C0]">{service.description}</p><div className="mt-4 rounded-2xl bg-[#09090b] p-3"><p className="text-[10px] font-black uppercase tracking-[.13em] text-[#8B93A1]">Starting at</p><p className="mt-1 text-xl font-black text-white">{formatCurrency(service.pricePer1000, currency)} <span className="text-xs font-bold text-[#9DA4B0]">/ 1K</span></p></div><dl className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl border border-white/[.07] bg-white/[.03] p-3"><dt className="flex items-center gap-1.5 font-bold text-[#969EAA]"><Clock3 className="h-3.5 w-3.5 text-orange-300" />Delivery</dt><dd className="mt-1.5 font-black text-white">{service.deliveryTime}</dd></div><div className="rounded-xl border border-white/[.07] bg-white/[.03] p-3"><dt className="flex items-center gap-1.5 font-bold text-[#969EAA]"><RefreshCw className="h-3.5 w-3.5 text-orange-300" />Refill / support</dt><dd className="mt-1.5 font-black text-white">{service.refillPolicy}</dd></div></dl><div className="mt-4 grid gap-2 min-[390px]:grid-cols-2">{unavailable ? <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white/[.07] px-3 text-xs font-black text-[#9DA4B0]">Currently unavailable</span> : <Link href={orderHref} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-3 text-xs font-black shadow-[0_12px_25px_-16px_rgba(255,122,0,.9)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300">Start Order <ArrowRight className="h-3.5 w-3.5" /></Link>}<details className="group/details relative"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-xl border border-white/10 bg-white/[.035] px-3 text-xs font-black text-[#D7DAE0] transition hover:border-orange-400/45 [&::-webkit-details-marker]:hidden">View Details</summary><div className="absolute bottom-[calc(100%+0.5rem)] right-0 z-10 w-full rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 text-left text-xs leading-5 text-[#C7CBD3] shadow-2xl"><p>{service.importantInstruction}</p><Link href={detailHref} className="mt-2 inline-flex font-black text-orange-200 hover:text-orange-100">Full service details <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></div></details></div></article>; })}</div> : <div className="mt-5 rounded-3xl border border-white/10 bg-[#111113] p-7 text-center sm:p-10"><Search className="mx-auto h-6 w-6 text-orange-300" /><h3 className="mt-3 text-lg font-black">No services found</h3><p className="mt-2 text-sm text-[#AEB5C0]">Try another search or clear your filters.</p><button type="button" onClick={clearFilters} className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-orange-400/35 bg-orange-500/10 px-4 text-xs font-black text-orange-100">Clear Filters</button></div>}</div></section>

    <section className="relative px-4 pt-5 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-4 rounded-[1.5rem] border border-orange-400/20 bg-[linear-gradient(120deg,#191108,#111113_55%,#111113)] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"><div><p className="text-[10px] font-black tracking-[.16em] text-orange-300">NEED MULTIPLE SERVICES?</p><h2 className="mt-2 text-xl font-black">Explore SocialRUSH Packages</h2><p className="mt-2 text-sm leading-6 text-[#C7CBD3]">Compare bundled options without interrupting a single-service order.</p></div><Link href={`/packages?platform=${platform === "x" ? "twitter" : platform}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.06] px-4 text-xs font-black hover:border-orange-400/50">Explore Packages <ArrowRight className="h-4 w-4" /></Link></div></section>

    <section aria-labelledby="confidence-heading" className="relative px-4 pt-9 sm:px-6 sm:pt-12 lg:px-8"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-[10px] font-black tracking-[.16em] text-orange-300">ORDER WITH CONFIDENCE</p><h2 id="confidence-heading" className="mt-2 text-2xl font-black">Clear information before you order.</h2></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[[ShieldCheck,"Public link only","Provide the relevant public profile, post, video, page or channel link."],[CheckCircle2,"Transparent pricing","Current rates are visible before confirmation."],[Package,"Order tracking","Follow submitted orders from your customer dashboard."],[RefreshCw,"Refill information","Applicable refill or support terms are shown on each service."]].map(([Icon,title,text]) => { const ItemIcon = Icon as typeof ShieldCheck; return <article key={title as string} className="rounded-2xl border border-white/10 bg-[#111113] p-4"><ItemIcon className="h-5 w-5 text-orange-300" /><h3 className="mt-4 text-sm font-black">{title as string}</h3><p className="mt-2 text-xs leading-5 text-[#AEB5C0]">{text as string}</p></article>; })}</div></div></section>

    <section aria-labelledby="how-heading" className="relative px-4 pt-9 sm:px-6 sm:pt-12 lg:px-8"><div className="mx-auto max-w-7xl rounded-[1.6rem] border border-white/10 bg-[#111113] p-5 sm:p-7"><p className="text-[10px] font-black tracking-[.16em] text-orange-300">SIMPLE ORDERING</p><h2 id="how-heading" className="mt-2 text-2xl font-black">From service to order in four steps.</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["01","Choose Service"],["02","Add Public Link & Quantity"],["03","Review & Pay"],["04","Track Order"]].map(([number,title]) => <div key={number} className="rounded-2xl border border-white/[.08] bg-black/20 p-4"><p className="text-xs font-black text-orange-300">{number}</p><h3 className="mt-4 text-sm font-black">{title}</h3></div>)}</div><Link href="/dashboard/new-order" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black">Start Your Order <ArrowRight className="h-4 w-4" /></Link></div></section>
  </main></BlogShell>;
}
