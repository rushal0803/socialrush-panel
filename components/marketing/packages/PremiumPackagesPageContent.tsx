"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, LoaderCircle, Search, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import InteractiveHomepageShell from "@/components/marketing/InteractiveHomepageShell";
import { createClient } from "@/lib/supabase/client";
import { linkRules, validateCampaignLink } from "@/lib/order-service-experience";
import {
  getPackagePurchaseFacts,
  getPackageUiGroups,
  getPackageUiServiceLabel,
  getPackageUiUrl,
  getWalletPackageState,
  resolvePackageUiSelection,
  type PackageUiPlatform,
  type PackageUiSelection,
} from "@/lib/package-ui-adapter";

const PENDING_KEY = "socialrush.packages.pending-order.v2";
const platformOrder: PackageUiPlatform[] = ["Instagram", "YouTube", "Facebook", "LinkedIn", "X", "TikTok", "Telegram"];
const platformLabels: Record<PackageUiPlatform, string> = { Instagram: "Instagram", YouTube: "YouTube", Facebook: "Facebook", LinkedIn: "LinkedIn", X: "X / Twitter", TikTok: "TikTok", Telegram: "Telegram" };

function money(paise: number | null) {
  if (paise === null) return "Live price";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: paise % 100 ? 2 : 0 }).format(paise / 100);
}

function quantity(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function track(event: string, data: Record<string, string | number | boolean | null> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Array<Record<string, unknown>>; gtag?: (kind: string, event: string, data: Record<string, unknown>) => void };
  w.dataLayer?.push({ event, ...data });
  w.gtag?.("event", event, data);
}

type Props = { initialPlatformParam?: string; initialServiceParam?: string; initialPackageIdParam?: string };

type ApiOrderData = { id: string; balance: number };

export default function PremiumPackagesPageContent({ initialPlatformParam, initialServiceParam, initialPackageIdParam }: Props) {
  const router = useRouter();
  const groups = useMemo(() => getPackageUiGroups(), []);
  const initialSelection = useMemo(() => resolvePackageUiSelection({ platform: initialPlatformParam, service: initialServiceParam, packageId: initialPackageIdParam }), [initialPackageIdParam, initialPlatformParam, initialServiceParam]);
  const initialPlatform = initialSelection?.platform ?? (platformOrder.find((p) => p.toLowerCase() === String(initialPlatformParam ?? "").toLowerCase()) ?? "Instagram");
  const [platform, setPlatform] = useState<PackageUiPlatform>(initialPlatform);
  const platformGroups = useMemo(() => groups.filter((g) => g.uiPlatform === platform), [groups, platform]);
  const initialGroup = initialSelection ? groups.find((g) => g.service.code === initialSelection.serviceCode) : platformGroups[0];
  const [service, setService] = useState(initialGroup?.uiService ?? platformGroups[0]?.uiService ?? "followers");
  const [selectedId, setSelectedId] = useState(initialSelection?.id ?? "");
  const [search, setSearch] = useState("");
  const [targetLink, setTargetLink] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const requestId = useRef("");

  const activeGroup = groups.find((g) => g.uiPlatform === platform && g.uiService === service) ?? platformGroups[0] ?? null;
  const packages = activeGroup?.packages ?? [];
  const selected = packages.find((p) => p.id === selectedId) ?? null;
  const purchaseFacts = selected ? getPackagePurchaseFacts(selected) : null;
  const wallet = getWalletPackageState(selected, walletBalance);
  const rule = selected ? linkRules[selected.serviceCode] ?? null : null;
  const linkError = rule && targetLink.trim() ? validateCampaignLink(targetLink, rule) : "";
  const filteredServices = platformGroups.filter((g) => getPackageUiServiceLabel(platform, g.uiService).toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    track("packages_viewed", { platform: platform.toLowerCase(), service });
    const supabase = createClient();
    void (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setLoggedIn(Boolean(user));
        if (user) {
          const { data } = await supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle();
          setWalletBalance(Number(data?.balance ?? 0));
        }
      } finally { setAuthLoading(false); }
    })();
    try {
      const pending = JSON.parse(window.localStorage.getItem(PENDING_KEY) || "null") as { packageId?: string; targetLink?: string } | null;
      if (pending?.packageId === selected?.id && pending.targetLink) setTargetLink(pending.targetLink);
    } catch { /* ignore stale local state */ }
  }, []);

  function choosePlatform(next: PackageUiPlatform) {
    const first = groups.find((g) => g.uiPlatform === next);
    setPlatform(next);
    setService(first?.uiService ?? "followers");
    setSelectedId("");
    setTargetLink("");
    setMessage("");
    setSearch("");
    track("platform_selected", { platform: next.toLowerCase() });
    router.replace(`/packages?platform=${encodeURIComponent(first?.platform ?? next.toLowerCase())}`, { scroll: false });
  }

  function chooseService(next: string) {
    const group = groups.find((g) => g.uiPlatform === platform && g.uiService === next);
    setService(next);
    setSelectedId("");
    setTargetLink("");
    setMessage("");
    track("service_selected", { platform: platform.toLowerCase(), service: group?.service.code ?? next });
    router.replace(`/packages?platform=${encodeURIComponent(group?.platform ?? platform.toLowerCase())}&service=${encodeURIComponent(group?.service.code ?? next)}`, { scroll: false });
  }

  function choosePackage(pkg: PackageUiSelection) {
    setSelectedId(pkg.id);
    setMessage("");
    track("package_selected", { platform: pkg.platformId, service: pkg.serviceCode, package: pkg.tierId, quantity: pkg.quantity, price: pkg.pricePaise === null ? null : pkg.pricePaise / 100, discount: pkg.savingsPercent });
    router.replace(getPackageUiUrl(pkg), { scroll: false });
    window.setTimeout(() => document.getElementById("package-checkout")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  function persist() {
    if (!selected) return;
    window.localStorage.setItem(PENDING_KEY, JSON.stringify({ packageId: selected.id, targetLink: targetLink.trim() }));
  }

  async function buy() {
    setMessage("");
    if (!selected || !purchaseFacts) return;
    if (!rule) { setMessage("This service is available, but package checkout needs the standard order flow for its destination-link requirements."); return; }
    const validation = validateCampaignLink(targetLink, rule);
    if (validation) { setMessage(validation); return; }
    if (!loggedIn) {
      persist();
      track("package_checkout_started", { platform: selected.platformId, service: selected.serviceCode, package: selected.tierId, quantity: selected.quantity, price: purchaseFacts.totalPriceINR });
      router.push(`/login?next=${encodeURIComponent(getPackageUiUrl(selected))}`);
      return;
    }
    if (authLoading || walletBalance === null) { setMessage("Your wallet balance is still loading. Please try again."); return; }
    if (!wallet.hasEnoughBalance) {
      persist();
      track("add_funds_clicked", { platform: selected.platformId, service: selected.serviceCode, package: selected.tierId, quantity: selected.quantity, price: purchaseFacts.totalPriceINR });
      router.push(`/dashboard/wallet?amount=${encodeURIComponent(String(wallet.amountNeeded))}&returnTo=${encodeURIComponent(getPackageUiUrl(selected))}`);
      return;
    }
    if (!requestId.current) requestId.current = crypto.randomUUID();
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceCode: purchaseFacts.serviceCode, serviceId: 0, quantity: purchaseFacts.quantity, link: targetLink.trim(), requestId: requestId.current, notes: null, fallbackPrice: purchaseFacts.fallbackPricePer1000INR, fallbackName: purchaseFacts.fallbackName, fallbackPlatform: purchaseFacts.fallbackPlatform, fallbackMin: purchaseFacts.quantity, fallbackMax: purchaseFacts.quantity }) });
      const result = await response.json() as { data?: ApiOrderData; error?: string };
      if (!response.ok || !result.data) { setMessage(result.error || "Unable to place this order right now."); return; }
      window.localStorage.removeItem(PENDING_KEY);
      track("package_purchase_completed", { platform: selected.platformId, service: selected.serviceCode, package: selected.tierId, quantity: selected.quantity, price: purchaseFacts.totalPriceINR });
      router.push("/dashboard/orders");
      router.refresh();
    } catch { setMessage("Unable to place this order right now."); }
    finally { setSubmitting(false); }
  }

  return <BlogShell><InteractiveHomepageShell><main className="min-h-screen overflow-x-hidden bg-[#080808] pb-32 text-white">
    <section className="relative border-b border-white/10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,122,0,.16),transparent_42%)]" />
      <div className="relative mx-auto max-w-7xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-orange-300"><Sparkles className="h-3.5 w-3.5" /> Premium growth packages</span>
        <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">Pick your platform. Compare real value. Start growing.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">One clean buying experience for every active SocialRUSH service. Prices come from the same service catalog used by the ordering system.</p>
        <div className="mt-7 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
          <Metric value={String(new Set(groups.map((g) => g.platform)).size)} label="Platforms" />
          <Metric value={String(groups.length)} label="Active services" />
          <Metric value="4" label="Package tiers" />
        </div>
      </div>
    </section>

    <section className="sticky top-16 z-30 border-b border-white/10 bg-[#080808]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto [scrollbar-width:none]">
        {platformOrder.filter((p) => groups.some((g) => g.uiPlatform === p)).map((p) => <button key={p} onClick={() => choosePlatform(p)} className={`min-h-11 shrink-0 rounded-xl border px-4 text-sm font-extrabold transition ${platform === p ? "border-orange-400 bg-orange-500 text-black shadow-[0_8px_24px_-12px_rgba(255,122,0,.9)]" : "border-white/10 bg-white/[.04] text-zinc-300 hover:border-orange-400/40 hover:text-white"}`}>{platformLabels[p]}</button>)}
      </div>
    </section>

    <section className="px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-white/10 bg-white/[.035] p-4 lg:sticky lg:top-20 lg:h-fit">
        <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-orange-300">Step 1</p><h2 className="mt-1 text-xl font-black">Choose service</h2></div><span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-400">{platformGroups.length}</span></div>
        {platformGroups.length > 7 && <label className="mb-3 flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3"><Search className="h-4 w-4 text-zinc-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600" /></label>}
        <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-1.5 lg:overflow-visible">{filteredServices.map((g) => <button key={g.service.code} onClick={() => chooseService(g.uiService)} className={`min-h-11 shrink-0 rounded-xl px-3.5 text-left text-sm font-bold transition lg:flex lg:w-full lg:items-center lg:justify-between ${activeGroup?.service.code === g.service.code ? "bg-orange-500 text-black" : "bg-white/[.04] text-zinc-300 hover:bg-white/[.08]"}`}><span>{getPackageUiServiceLabel(platform, g.uiService)}</span><ChevronRight className="hidden h-4 w-4 lg:block" /></button>)}</div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-orange-300">Step 2</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">{activeGroup ? getPackageUiServiceLabel(platform, activeGroup.uiService) : "Packages"}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{activeGroup?.service.description ?? "Choose another active service to continue."}</p></div>
        {packages.length ? <div className={`grid gap-4 ${packages.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : packages.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>{packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} selected={selectedId === pkg.id} onSelect={() => choosePackage(pkg)} />)}</div> : <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.025] p-8 text-center"><h3 className="text-xl font-black">No fixed packages are currently available</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-400">This active service requires live pricing or different order parameters. Use the standard order flow instead of showing an unsupported or ₹0 package.</p><Link href="/dashboard/new-order" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-5 text-sm font-black text-black">Open standard order</Link></div>}

        {selected && purchaseFacts && <section id="package-checkout" className="mt-8 rounded-[28px] border border-orange-400/30 bg-gradient-to-b from-orange-500/[.10] to-white/[.035] p-5 shadow-[0_28px_70px_-45px_rgba(255,122,0,.8)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div><p className="text-xs font-bold uppercase tracking-[.14em] text-orange-300">Step 3 · Review & start</p><h3 className="mt-2 text-2xl font-black">{pkgTitle(selected)}</h3><div className="mt-4 flex flex-wrap gap-2"><Pill>{quantity(selected.quantity)} {getPackageUiServiceLabel(platform, selected.service)}</Pill><Pill>{selected.tierLabel}</Pill>{selected.recommended && <Pill>Most popular</Pill>}</div>
              {rule ? <div className="mt-6"><label htmlFor="package-link" className="text-sm font-extrabold">Public destination link</label><input id="package-link" value={targetLink} onChange={(e) => { setTargetLink(e.target.value); setMessage(""); }} placeholder={rule.placeholder} className={`mt-2 min-h-12 w-full rounded-xl border bg-black/35 px-4 text-sm outline-none transition ${linkError ? "border-red-400/60" : "border-white/15 focus:border-orange-400"}`} /><p className={`mt-2 text-xs ${linkError ? "text-red-300" : "text-zinc-500"}`}>{linkError || rule.helper}</p></div> : <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-100">Use the standard order flow for this service’s destination requirements.</div>}
              {message && <p role="alert" className="mt-4 rounded-xl border border-orange-400/20 bg-black/25 p-3 text-sm text-orange-100">{message}</p>}
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/35 p-5"><div className="flex items-center justify-between"><span className="text-sm text-zinc-400">Package total</span><strong className="text-2xl font-black">{money(selected.pricePaise)}</strong></div>{selected.savingsPaise > 0 && <div className="mt-2 flex items-center justify-between text-sm"><span className="text-zinc-500 line-through">{money(selected.regularPricePaise)}</span><span className="font-bold text-emerald-300">Save {money(selected.savingsPaise)} · {selected.savingsPercent}%</span></div>}<div className="my-4 h-px bg-white/10" />
              {loggedIn ? <><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-zinc-400"><WalletCards className="h-4 w-4" /> Wallet</span><span className="font-bold">{walletBalance === null ? "Checking…" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(walletBalance)}</span></div>{!wallet.hasEnoughBalance && walletBalance !== null && <p className="mt-2 text-xs text-amber-300">Add {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(wallet.amountNeeded)} to continue.</p>}</> : <p className="text-sm leading-6 text-zinc-400">Sign in to continue. Your selected package will be preserved.</p>}
              <button disabled={submitting || authLoading || !rule} onClick={buy} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 text-sm font-black text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}{!loggedIn ? "Sign in & continue" : wallet.hasEnoughBalance ? "Buy with Wallet" : "Add Funds & continue"}</button>
              <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-zinc-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" /> Transparent price, public-link validation and order tracking through your dashboard.</div>
            </div>
          </div>
        </section>}
      </div>
    </div></section>

    <section className="px-4 pb-10 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3"><Trust title="Transparent pricing" text="No fake crossed-out prices. Savings only appear when the package engine has a genuine discount." /><Trust title="Catalog-driven" text="Active platforms and services come from the same SocialRUSH service catalog." /><Trust title="Purchase continuity" text="Package selection is preserved through login and Add Funds where technically supported." /></div></section>

    {selected && purchaseFacts && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0b0b]/95 p-3 backdrop-blur-xl lg:hidden"><div className="mx-auto flex max-w-xl items-center gap-3"><div className="min-w-0 flex-1"><p className="truncate text-xs text-zinc-400">{selected.tierLabel} · {quantity(selected.quantity)}</p><p className="text-lg font-black">{money(selected.pricePaise)}</p></div><button onClick={() => document.getElementById("package-checkout")?.scrollIntoView({ behavior: "smooth", block: "center" })} className="min-h-11 rounded-xl bg-orange-500 px-5 text-sm font-black text-black">Continue</button></div></div>}
  </main></InteractiveHomepageShell></BlogShell>;
}

function PackageCard({ pkg, selected, onSelect }: { pkg: PackageUiSelection; selected: boolean; onSelect: () => void }) {
  return <article className={`relative flex min-h-[320px] flex-col rounded-[24px] border p-5 transition duration-200 ${pkg.recommended ? "border-orange-400/60 bg-orange-500/[.08] shadow-[0_24px_60px_-40px_rgba(255,122,0,.9)]" : "border-white/10 bg-white/[.035] hover:border-white/20"} ${selected ? "ring-2 ring-orange-400 ring-offset-2 ring-offset-[#080808]" : ""}`}>
    {pkg.recommended && <span className="absolute -top-3 left-4 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-black">Most popular</span>}
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-zinc-500">{pkg.tierLabel}</p><h3 className="mt-2 text-3xl font-black">{quantity(pkg.quantity)}</h3><p className="mt-1 text-sm text-zinc-400">{pkg.bestFor}</p></div>{selected && <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-500 text-black"><Check className="h-4 w-4" /></span>}</div>
    <div className="mt-6"><div className="flex items-baseline gap-2"><strong className="text-3xl font-black">{money(pkg.pricePaise)}</strong>{pkg.savingsPaise > 0 && <span className="text-sm text-zinc-500 line-through">{money(pkg.regularPricePaise)}</span>}</div>{pkg.savingsPaise > 0 ? <p className="mt-2 text-xs font-bold text-emerald-300">Save {money(pkg.savingsPaise)} · {pkg.savingsPercent}% OFF</p> : <p className="mt-2 text-xs text-zinc-500">Current catalog price</p>}{pkg.pricePer1000Paise !== null && <p className="mt-2 text-xs text-zinc-500">≈ {money(pkg.pricePer1000Paise)} per 1K</p>}</div>
    <ul className="mt-5 space-y-2 text-xs text-zinc-400"><li className="flex gap-2"><Check className="h-4 w-4 text-orange-300" /> Clear package quantity</li><li className="flex gap-2"><Check className="h-4 w-4 text-orange-300" /> Dashboard order tracking</li></ul>
    <button onClick={onSelect} className={`mt-auto min-h-11 rounded-xl px-4 text-sm font-black transition ${pkg.recommended ? "bg-orange-500 text-black hover:bg-orange-400" : "border border-white/15 bg-white/[.05] text-white hover:border-orange-400/50"}`}>{selected ? "Selected" : "Choose package"}</button>
  </article>;
}

function Metric({ value, label }: { value: string; label: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3 sm:p-4"><strong className="block text-xl font-black sm:text-2xl">{value}</strong><span className="mt-1 block text-[10px] font-bold uppercase tracking-[.1em] text-zinc-500">{label}</span></div>; }
function Pill({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5 text-xs font-bold text-zinc-300">{children}</span>; }
function Trust({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p></div>; }
function pkgTitle(pkg: PackageUiSelection) { return `${platformLabels[pkg.platform]} ${pkg.serviceName}`; }
