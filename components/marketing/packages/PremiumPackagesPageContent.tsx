"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, LoaderCircle, Search, ShieldCheck, WalletCards } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import premiumStyles from "../PremiumSystem.module.css";
import { createClient } from "@/lib/supabase/client";
import { linkRules, validateCampaignLink } from "@/lib/order-service-experience";

import {
  getPackagePurchaseFacts,
  getPackageUiGroups,
  getPackageUiServiceLabel,
  getPackageUiUrl,
  getWalletPackageState,
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

type Props = { initialPlatformParam?: string; initialServiceParam?: string; initialPackageIdParam?: string; initialGroups?: ReturnType<typeof getPackageUiGroups>; variant?: "public" | "dashboard" };

type ApiOrderData = { id: string; balance: number };

export default function PremiumPackagesPageContent({ initialPlatformParam, initialServiceParam, initialPackageIdParam, initialGroups, variant = "public" }: Props) {
  const router = useRouter();
  const groups = useMemo(() => initialGroups ?? [], [initialGroups]);
  const basePath = variant === "dashboard" ? "/dashboard/packages" : "/packages";
  const selectionUrl = (pkg: PackageUiSelection) => getPackageUiUrl(pkg).replace("/packages", basePath);
  const initialSelection = groups.flatMap((g) => g.packages).find((pkg) => initialPackageIdParam ? pkg.id === initialPackageIdParam : pkg.serviceCode === initialServiceParam);
  const initialPlatform = initialSelection?.platform ?? (platformOrder.find((p) => groups.some((g) => g.uiPlatform === p) && p.toLowerCase() === String(initialPlatformParam ?? "").toLowerCase()) ?? groups[0]?.uiPlatform ?? "Instagram");
  const [platform, setPlatform] = useState<PackageUiPlatform>(initialPlatform);
  const platformGroups = useMemo(() => groups.filter((g) => g.uiPlatform === platform), [groups, platform]);
  const initialGroup = initialSelection ? groups.find((g) => g.service.code === initialSelection.serviceCode) : platformGroups[0];
  const [service, setService] = useState(initialGroup?.uiService ?? platformGroups[0]?.uiService ?? "followers");
  const [selectedId, setSelectedId] = useState(initialPackageIdParam ? initialSelection?.id ?? "" : "");
  const [search, setSearch] = useState("");
  const [targetLink, setTargetLink] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [pollAnswer, setPollAnswer] = useState("");
  const [skillName, setSkillName] = useState("");
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

    const supabase = createClient();
    void (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setLoggedIn(Boolean(user));
        if (user) {
          const { data } = await supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle();
          setWalletBalance(Number(data?.balance ?? 0));
        }
      } catch { setMessage("Unable to check your account. Please sign in again."); } finally { setAuthLoading(false); }
    })();
  }, []);

  useEffect(() => {
    track("packages_viewed", { platform: platform.toLowerCase(), service });
  }, [platform, service]);
  useEffect(() => {
    try {
      const pending = JSON.parse(window.localStorage.getItem(PENDING_KEY) || "null");
      if (pending?.packageId === selectedId) { setTargetLink(pending.targetLink || ""); setOrderNotes(pending.orderNotes || ""); setPollAnswer(pending.pollAnswer || ""); setSkillName(pending.skillName || ""); }
    } catch { /* stale browser state */ }
  }, [selectedId]);

  function choosePlatform(next: PackageUiPlatform) {
    const first = groups.find((g) => g.uiPlatform === next);
    setPlatform(next);
    setService(first?.uiService ?? "followers");
    setSelectedId("");
    setTargetLink("");
    setOrderNotes(""); setPollAnswer(""); setSkillName(""); requestId.current = "";
    setMessage("");
    setSearch("");
    track("platform_selected", { platform: next.toLowerCase() });
    router.replace(`${basePath}?platform=${encodeURIComponent(first?.platform ?? next.toLowerCase())}`, { scroll: false });
  }

  function chooseService(next: string) {
    const group = groups.find((g) => g.uiPlatform === platform && g.uiService === next);
    setService(next);
    setSelectedId("");
    setTargetLink("");
    setOrderNotes("");
    setPollAnswer("");
    setSkillName("");
    requestId.current = "";
    setMessage("");
    track("service_selected", { platform: platform.toLowerCase(), service: group?.service.code ?? next });
    router.replace(`${basePath}?platform=${encodeURIComponent(group?.platform ?? platform.toLowerCase())}&service=${encodeURIComponent(group?.service.code ?? next)}`, { scroll: false });
  }

  function choosePackage(pkg: PackageUiSelection) {
    if (pkg.id !== selectedId) requestId.current = "";
    setSelectedId(pkg.id);
    setMessage("");
    track("package_selected", { platform: pkg.platformId, service: pkg.serviceCode, package: pkg.tierId, quantity: pkg.quantity, price: pkg.pricePaise === null ? null : pkg.pricePaise / 100, discount: pkg.savingsPercent });
    router.replace(selectionUrl(pkg), { scroll: false });
    window.setTimeout(() => document.getElementById("package-checkout")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  function persist() {
    if (!selected) return;
    window.localStorage.setItem(PENDING_KEY, JSON.stringify({ packageId: selected.id, targetLink: targetLink.trim(), orderNotes, pollAnswer, skillName }));
  }

  async function buy() {
    setMessage("");
    if (!selected || !purchaseFacts) return;
    if (!rule) { setMessage("This service needs the standard order flow for its destination requirements."); return; }
    const validation = validateCampaignLink(targetLink, rule);
    if (validation) { setMessage(validation); return; }
    if (!loggedIn) {
      persist();
      track("package_checkout_started", { platform: selected.platformId, service: selected.serviceCode, package: selected.tierId, quantity: selected.quantity, price: purchaseFacts.totalPriceINR });
      router.push(`/login?next=${encodeURIComponent(selectionUrl(selected))}`);
      return;
    }
    if (authLoading || walletBalance === null) { setMessage("Your wallet balance is still loading. Please try again."); return; }
    if (!wallet.hasEnoughBalance) {
      persist();
      track("add_funds_clicked", { platform: selected.platformId, service: selected.serviceCode, package: selected.tierId, quantity: selected.quantity, price: purchaseFacts.totalPriceINR });
      router.push(`/dashboard/add-funds?amount=${encodeURIComponent(String(wallet.amountNeeded))}&next=${encodeURIComponent(selectionUrl(selected))}`);
      return;
    }
    if (!requestId.current) requestId.current = crypto.randomUUID();
    const payload = { serviceCode: purchaseFacts.serviceCode, quantity: purchaseFacts.quantity, link: targetLink.trim(), clientRequestId: requestId.current, packageId: selected.id };
    setSubmitting(true);
    try {
      const intentResponse = await fetch("/api/checkout/intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, notes: orderNotes || undefined, pollAnswerNumber: pollAnswer || undefined, endorsementSkillName: skillName || undefined }) });
      const intentResult = await intentResponse.json() as { data?: { id?: string; total_paise?: number }; error?: string };
      if (!intentResponse.ok || !intentResult.data?.id) { setMessage(intentResult.error || "Unable to prepare checkout right now."); return; }
      if (intentResult.data.total_paise !== selected.pricePaise) { setMessage("The price has changed. Refresh and review your package before continuing."); return; }
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, intentId: intentResult.data.id }) });
      const result = await response.json() as { data?: ApiOrderData; error?: string };
      if (!response.ok || !result.data) { setMessage(result.error || "Unable to place this order right now."); return; }
      window.localStorage.removeItem(PENDING_KEY);
      setWalletBalance(Number(result.data.balance));
      track("package_purchase_completed", { platform: selected.platformId, service: selected.serviceCode, package: selected.tierId, quantity: selected.quantity, price: purchaseFacts.totalPriceINR });
      router.push("/dashboard/orders");
      router.refresh();
    } catch { setMessage("Unable to place this order right now."); }
    finally { setSubmitting(false); }
  }

  const experience = <main className={`package-experience min-w-0 bg-[#070707] px-4 pt-6 pb-24 lg:pb-8 text-white antialiased sm:px-6 lg:px-8 ${premiumStyles.packages}`}><div className="mx-auto max-w-7xl">
    <header className="mb-4"><p className="text-xs font-bold uppercase tracking-[.16em] text-orange-300">SocialRUSH packages</p><h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Your next campaign.<br />A package that fits.</h1><p className="mt-3 text-sm leading-6 text-zinc-300 sm:text-base">Choose your platform, compare quantities and save on larger orders.</p><Link href={variant === "dashboard" ? "/dashboard/new-order" : "/pricing"} className="mt-2 inline-flex min-h-8 items-center text-sm font-semibold text-orange-300">Need a custom quantity?</Link></header>
    <ol aria-label="Order steps" className="mb-5 grid grid-cols-4 gap-2 text-xs font-semibold text-zinc-200">{["Platform", "Service", "Package", "Review"].map((label, index) => <li key={label} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg bg-[#151515] px-1 py-2 sm:flex-row sm:gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-orange-300/40 text-orange-300">{index+1}</span>{label}</li>)}</ol>
    <section aria-labelledby="platform-title" className="mb-5"><h2 id="platform-title" className="mb-3 text-base font-bold">1. Choose platform</h2><div className="grid grid-cols-2 gap-2 min-[375px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-7">{platformOrder.filter((p) => groups.some((g) => g.uiPlatform === p)).map((p) => <button key={p} aria-pressed={platform === p} onClick={() => choosePlatform(p)} className={`min-h-12 min-w-0 rounded-xl border px-2 text-sm font-bold transition ${platform === p ? "border-orange-300 bg-orange-300 text-black" : "border-white/15 bg-[#151515] text-zinc-200 hover:border-orange-300"}`}>{platformLabels[p]}{platform === p && <Check className="ml-1 inline h-3 w-3" />}</button>)}</div></section>
    {!groups.length && <p role="status" className="rounded-xl border border-white/15 p-6 text-zinc-200">Packages are temporarily unavailable. Please try again shortly.</p>}
    {!!groups.length && <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)]"><aside aria-labelledby="service-title" className="min-w-0 rounded-2xl border border-white/10 bg-[#111111] p-3 sm:p-4"><h2 id="service-title" className="mb-3 text-base font-bold">2. Choose service <span className="text-sm font-normal text-zinc-300">({platformGroups.length})</span></h2>
    {platformGroups.length > 7 && <label className="mb-3 flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-3"><Search size={16} /><span className="sr-only">Search services</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services" className="min-w-0 w-full bg-transparent text-sm text-white placeholder:text-zinc-300" /></label>}
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-1">{filteredServices.map((g) => <button key={g.service.code} aria-pressed={activeGroup?.service.code === g.service.code} onClick={() => chooseService(g.uiService)} className={`flex min-h-11 min-w-0 items-center justify-between gap-1 rounded-lg border px-3 py-2 text-left text-sm font-semibold ${activeGroup?.service.code === g.service.code ? "border-orange-300 text-orange-200 bg-[#191919]" : "border-white/10 text-zinc-200 hover:border-white/30"}`}><span className="min-w-0 flex-1 break-words">{getPackageUiServiceLabel(platform,g.uiService)}</span>{activeGroup?.service.code === g.service.code && <Check size={14} className="shrink-0" />}</button>)}</div>{!filteredServices.length && <p className="py-3 text-sm text-zinc-300">No matching services.</p>}</aside>
    <div className="min-w-0"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold">3. Choose your package</h2><span className="text-sm text-zinc-300">{activeGroup?.service.name}</span></div><div className="grid gap-3 md:grid-cols-2">{packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} selected={selectedId === pkg.id} onSelect={() => choosePackage(pkg)} />)}</div>
    {activeGroup && <details className="mt-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300"><summary className="cursor-pointer font-semibold text-white">Service details & requirements</summary><p className="mt-3 leading-6">{activeGroup.service.description}</p><p className="mt-2 leading-6">{activeGroup.service.importantInstruction}</p><p className="mt-2">Refill: {activeGroup.service.refillPolicy}</p></details>}
        {selected && purchaseFacts && <section id="package-checkout" className="mt-5 scroll-mt-24 rounded-2xl border border-orange-400/30 bg-[#111111] p-5 shadow-[0_28px_70px_-45px_rgba(255,122,0,.8)] sm:p-7">
          <div className="grid gap-6 xl:grid-cols-2">
            <div><p className="text-xs font-bold uppercase tracking-[.14em] text-orange-300">4. Add your link & review</p><h3 className="mt-2 text-2xl font-black">{pkgTitle(selected)}</h3><div className="mt-4 flex flex-wrap gap-2"><Pill>{quantity(selected.quantity)} {getPackageUiServiceLabel(platform, selected.service)}</Pill><Pill>{selected.tierLabel}</Pill></div>
              {rule ? <div className="mt-6"><label htmlFor="package-link" className="text-sm font-extrabold">Public destination link</label><input type="url" aria-describedby="package-link-help" aria-invalid={Boolean(linkError)} id="package-link" value={targetLink} onChange={(e) => { requestId.current = ""; setTargetLink(e.target.value); setMessage(""); }} placeholder={rule.placeholder} className={`mt-2 min-h-12 w-full rounded-xl border bg-black/35 px-4 text-sm outline-none transition ${linkError ? "border-red-400/60" : "border-white/15 focus:border-orange-400"}`} /><p id="package-link-help" className={`mt-2 text-sm ${linkError ? "text-red-300" : "text-zinc-300"}`}>{linkError || rule.helper}</p></div> : <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-100">Use the standard order flow for this service’s destination requirements.</div>}
              {selected.serviceCode.includes("custom-comments") && <label className="mt-3 block text-sm">Comments, one per line<textarea value={orderNotes} onChange={(e) => { requestId.current = ""; setOrderNotes(e.target.value); }} className="mt-2 min-h-24 w-full rounded-lg border border-white/25 bg-black p-3" /></label>}
              {selected.serviceCode === "telegram-poll-votes" && <label className="mt-3 block text-sm">Poll answer number<input type="number" min="1" value={pollAnswer} onChange={(e) => { requestId.current = ""; setPollAnswer(e.target.value); }} className="mt-2 min-h-11 w-full rounded-lg border border-white/25 bg-black px-3" /></label>}
              {selected.serviceCode === "linkedin-usa-endorsements" && <label className="mt-3 block text-sm">Skill name<input value={skillName} onChange={(e) => { requestId.current = ""; setSkillName(e.target.value); }} className="mt-2 min-h-11 w-full rounded-lg border border-white/25 bg-black px-3" /></label>}
              {message && <p role="alert" className="mt-4 rounded-xl border border-orange-400/20 bg-black/25 p-3 text-sm text-orange-100">{message}</p>}
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/35 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm text-zinc-300">Package total</span><strong className="text-2xl font-black">{money(selected.pricePaise)}</strong></div>{selected.savingsPaise > 0 && <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm"><span className="text-zinc-300 line-through">{money(selected.regularPricePaise)}</span><span className="font-bold text-emerald-300">Save {money(selected.savingsPaise)} · {selected.savingsPercent}%</span></div>}<div className="my-4 h-px bg-white/10" />
              {loggedIn ? <><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-zinc-300"><WalletCards className="h-4 w-4" /> Wallet</span><span className="font-bold">{walletBalance === null ? "Checking…" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(walletBalance)}</span></div>{!wallet.hasEnoughBalance && walletBalance !== null && <p className="mt-2 text-xs text-amber-300">Add {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(wallet.amountNeeded)} to continue.</p>}</> : <p className="text-sm leading-6 text-zinc-300">Sign in to continue. Your selected package will be preserved.</p>}
              <button disabled={submitting || authLoading || !rule} onClick={buy} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-300 px-5 text-sm font-black text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}{!loggedIn ? "Sign in & continue" : wallet.hasEnoughBalance ? "Buy with Wallet" : "Add Funds & continue"}</button>
              <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-zinc-300"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" /> Transparent price, order tracking through your dashboard.</div>
            </div>
          </div>
        </section>}
      </div>
    </div>}
    {variant === "public" && <section className="mt-8 border-t border-white/10 pt-6"><h2 className="text-lg font-bold">Before you order</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{[{q:"What is included?",a:"Each package includes the displayed quantity for one service and one destination link."},{q:"How do savings work?",a:"Larger tiers receive the displayed discount. Review your total before placing an order."},{q:"Where can I track my order?",a:"Sign in to view progress in your dashboard. Check service details for link requirements and refill terms."}].map((faq) => <details key={faq.q} className="rounded-xl border border-white/15 p-4"><summary className="cursor-pointer text-sm font-semibold">{faq.q}</summary><p className="mt-3 text-sm leading-6 text-zinc-300">{faq.a}</p></details>)}</div><Link href="/services" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-orange-300">Explore all services</Link></section>}
    </div></main>;
  return variant === "dashboard" ? experience : <div className="bg-[#070707] text-white"><div className="public-dark"><MarketingHeader /></div>{experience}<div className="public-dark content-auto"><MarketingFooter /></div></div>;
}

function PackageCard({ pkg, selected, onSelect }: { pkg: PackageUiSelection; selected: boolean; onSelect: () => void }) {
  return <article data-package-card data-package-featured={pkg.recommended ? "true" : "false"} className={`min-w-0 rounded-2xl border bg-[#111111] p-4 transition ${selected ? "border-orange-300 ring-1 ring-orange-300" : pkg.recommended ? "border-orange-300/50" : "border-white/15"}`}>
    <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wider text-zinc-200">{pkg.tierLabel}</span>{pkg.recommended && <span className="rounded-full bg-orange-300 px-2.5 py-1 text-xs font-bold text-black">Recommended</span>}{selected && <span className="flex items-center gap-1 text-xs font-bold text-orange-200"><Check size={14} />Selected</span>}</div>
    <div className="mt-3 flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h3 className="text-2xl font-bold tracking-tight">{quantity(pkg.quantity)}</h3><p className="mt-1 break-words text-sm text-zinc-200">{pkg.serviceName}</p></div><div><strong className="block text-2xl font-bold tracking-tight">{money(pkg.pricePaise)}</strong>{pkg.savingsPaise > 0 && <del className="mt-1 block text-sm text-zinc-300">{money(pkg.regularPricePaise)}</del>}</div></div>
    <p className="mt-2 text-xs leading-5 text-zinc-300">{pkg.bestFor}</p>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs leading-5"><span className="text-zinc-300">{money(pkg.pricePer1000Paise)} / 1K</span>{pkg.savingsPaise > 0 && <span className="font-bold text-emerald-300">Save {money(pkg.savingsPaise)} / {pkg.savingsPercent}%</span>}</div>
    <button aria-pressed={selected} onClick={onSelect} className={`mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${selected || pkg.recommended ? "bg-orange-300 text-black hover:bg-orange-200" : "bg-[#F5F5F5] text-black hover:bg-zinc-200"}`}>{selected ? "Selected - review below" : `Choose ${pkg.tierLabel} package`}<ChevronRight size={16} /></button>
  </article>;
}
function Pill({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-zinc-200">{children}</span>; }
function pkgTitle(pkg: PackageUiSelection) { return `${platformLabels[pkg.platform]} ${pkg.serviceName}`; }
