"use client";

import Link from "next/link";
import ServiceDiscovery from "./services/ServiceDiscovery";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import TrackedLink from "@/components/analytics/TrackedLink";
import { activeSmmServices, platformMeta, type SmmPlatformId } from "@/lib/smm-service-catalog";
import { calculateServiceTotal } from "@/lib/service-pricing";
import { type ServiceHealth } from "@/lib/service-health";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { Container, Section } from "@/components/ui";

const platforms: SmmPlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];
const faqs = [["Do I need to share my password?", "No. SocialRUSH orders use the relevant public profile, post, page, channel or video link."], ["How does ordering work?", "Choose a platform and service, add a public link and quantity, then review the order before payment."], ["How can I track my order?", "You can follow the status of your submitted orders from the SocialRUSH dashboard."], ["How does wallet payment work?", "Your available wallet balance is shown during the checkout flow before you confirm an eligible order."], ["What is refill support?", "Where a service includes refill coverage, its terms are shown with that service before ordering."], ["How do I contact support?", "Use the support area or the contact options listed on the site for help with an order."]];

function serviceType(code: string) { return code.split("-").slice(1).join(" ").replace(/\b\w/g, c => c.toUpperCase()); }



export default function PremiumHomepage({ hero }: { hero: React.ReactNode }) {
  const router = useRouter();
  const { currency, rates } = usePreferredCurrency();
  const money = (value: number) => formatCurrency(value, currency, rates);
  const [platform, setPlatform] = useState<SmmPlatformId>("instagram");
  const [requestedService, setRequestedService] = useState("");
  const [queryReady, setQueryReady] = useState(false);
  const [serviceCode, setServiceCode] = useState("");
  const [quantity, setQuantity] = useState(1000);
  const [health, setHealth] = useState<Record<string, ServiceHealth>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPlatform = params.get("platform");
    if (platforms.includes(requestedPlatform as SmmPlatformId)) setPlatform(requestedPlatform as SmmPlatformId);
    setRequestedService(params.get("service") || "");
    setQueryReady(true);
  }, []);
  useEffect(() => {
    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let idleId: number | null = null;
    let timeoutId: number | null = null;
    let controller: AbortController | null = null;

    const loadHealth = () => {
      if (cancelled || controller) return;
      controller = new AbortController();
      fetch("/api/service-health", { signal: controller.signal })
        .then((response) => response.ok ? response.json() : null)
        .then((payload) => {
          if (!cancelled && payload?.data) setHealth(payload.data);
        })
        .catch(() => undefined);
    };

    const servicesSection = document.getElementById("services");
    if (servicesSection && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          loadHealth();
        },
        { rootMargin: "700px 0px" },
      );
      observer.observe(servicesSection);
    } else {
      const idleWindow = window as typeof window & {
        requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
        cancelIdleCallback?: (handle: number) => void;
      };
      if (idleWindow.requestIdleCallback) {
        idleId = idleWindow.requestIdleCallback(loadHealth, { timeout: 2500 });
      } else {
        timeoutId = window.setTimeout(loadHealth, 1500);
      }
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (controller) controller.abort();
      const idleWindow = window as typeof window & { cancelIdleCallback?: (handle: number) => void };
      if (idleId !== null) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, []);
  const services = useMemo(() => activeSmmServices.filter(s => s.platform === platform), [platform]);
  const selected = services.find(s => s.code === serviceCode) || services.find(s => requestedService && s.code.endsWith(`-${requestedService}`)) || services[0];
  useEffect(() => { if (queryReady && selected && selected.code !== serviceCode) setServiceCode(selected.code); }, [queryReady, selected, serviceCode]);
  useEffect(() => {
    if (!selected) return;
    setQuantity((current) => {
      const step = selected.quantityStep ?? 1;
      const valid = current >= selected.minQuantity && current <= selected.maxQuantity && (current - selected.minQuantity) % step === 0;
      return valid ? current : selected.minQuantity;
    });
  }, [selected]);
  const total = selected ? calculateServiceTotal(selected.code, quantity) : 0;
  // Keep this handoff aligned with the existing New Order resume flow.  The
  // service code is the catalog identifier consumed by that page, rather than
  // a display-only service label.
  const destination = selected
    ? `/dashboard/new-order?${new URLSearchParams({
      platform,
      service: selected.code,
      quantity: String(quantity),
      resume: "1",
    }).toString()}`
    : "/dashboard/new-order";
  const demoIsReady = Boolean(
    selected &&
    selected.platform === platform &&
    Number.isInteger(quantity) &&
    quantity >= selected.minQuantity &&
    quantity <= selected.maxQuantity &&
    (quantity - selected.minQuantity) % (selected.quantityStep ?? 1) === 0,
  );
  const choosePlatform = (next: SmmPlatformId) => { setPlatform(next); setRequestedService(""); setServiceCode(""); setQuantity(1000); };
  const goOrder = () => router.push(destination);

  return <div className="premium-homepage sr-page bg-[#07080D] text-white">
    {hero}
    <ServiceDiscovery />

    <Section className="py-8 sm:py-10"><Container>
      <nav aria-label="Choose your next step" className="grid gap-0 divide-y divide-white/15 border-y border-white/15 md:grid-cols-3 md:divide-x md:divide-y-0">
        {[
          { href: "#order-demo", step: "order", title: "I’m ready to order", text: "Choose a service and quantity." },
          { href: "/services", step: "compare", title: "I want to compare services", text: "Find the details for your platform." },
          { href: "/tools/social-media-service-cost-calculator", step: "budget", title: "I need to plan a budget", text: "Plan quantities around your budget." },
        ].map((path, index) => <TrackedLink key={path.step} href={path.href} event="homepage_conversion_path_click" metadata={{ surface: "homepage_decision_rail", step: path.step }} className="flex min-h-24 items-center justify-between gap-4 px-4 py-5"><div><span className="text-xs text-orange-300">0{index + 1}</span><b className="mt-1 block text-sm">{path.title}</b><p className="mt-1 text-sm text-[#C4C8BD]">{path.text}</p></div><ArrowRight size={18} aria-hidden="true" /></TrackedLink>)}
      </nav>
      <p className="mt-3 text-sm text-[#C4C8BD]">Every path uses the current catalog and existing order flow.</p>
    </Container></Section>

    <section id="how-it-works" className="border-y border-white/[.07] bg-[#0B0D12] py-16"><Container><SectionHeading eyebrow="Campaign journey" title="A clear path from service to delivery." text="Choose your service, configure a campaign, review your details, then follow every status from your dashboard." /><ol className="workflow workflow-five mt-10 sr-motion-reveal">{[["01", "Choose service", "Select the platform and growth service that fits your objective."], ["02", "Configure campaign", "Add the requested public link and an eligible quantity."], ["03", "Review & pay securely", "See the live rate and final details before checkout."], ["04", "Track delivery", "Follow status changes, receipts and support updates in one place."], ["05", "Campaign completed", "Return to your workspace when the service reaches completion."]].map(([num, title, text]) => <li key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></li>)}</ol><div className="mt-9 flex flex-col items-center gap-2 text-center"><TrackedLink href="#order-demo" event="homepage_conversion_path_click" metadata={{ surface: "homepage_how_it_works", step: "order" }} className="sr-primary sr-motion-press">Check Live Price <ArrowRight className="h-4 w-4" /></TrackedLink><span className="text-[11px] text-[#8F96A3]">Choose a service and quantity before continuing to the real order flow.</span></div></Container></section>

    <section id="order-demo" className="py-16"><Container className="grid items-center gap-10 lg:grid-cols-[.82fr_1.18fr]"><div><SectionHeading eyebrow="Interactive product demo" title="Build your campaign before checkout." text="This preview never creates an order. Configure it here, then continue to the secure existing order flow when you are ready." align="left" /><div className="mt-6 space-y-3 text-sm text-[#C9D0DB] sr-motion-reveal"><p className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-emerald-400" />Choose a platform and its available service.</p><p className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-emerald-400" />See the estimated price and service terms before continuing.</p><p className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-emerald-400" />Open your real order flow only when you are ready.</p></div></div><div className="demo-card sr-motion-pop"><div className="flex items-center justify-between border-b border-white/[.08] pb-4"><div><p className="eyebrow">New order · product preview</p><h3 className="mt-1 text-xl font-black">Build your campaign</h3></div><span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-[10px] font-bold text-orange-200">Preview only</span></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="demo-field"><span>Choose platform</span><select value={platform} onChange={e => choosePlatform(e.target.value as SmmPlatformId)}>{platforms.map(p => <option key={p} value={p}>{platformMeta[p].label}</option>)}</select></label><label className="demo-field"><span>Choose service</span><select value={selected?.code || ""} onChange={e => { setServiceCode(e.target.value);  }}>{services.map(s => <option key={s.code} value={s.code}>{serviceType(s.code)}</option>)}</select></label></div><div className="mt-4"><div className="flex items-center justify-between gap-3 text-xs font-bold"><span>Quantity</span><label className="flex items-center gap-2 text-orange-200"><span className="sr-only">Exact quantity</span><input aria-label="Exact quantity" inputMode="numeric" value={quantity || ""} onChange={e => { setQuantity(Number(e.target.value.replace(/\D/g, "")));  }} className="w-24 rounded-lg border border-orange-400/25 bg-black/25 px-2 py-1 text-right text-xs font-bold text-white" /></label></div><input aria-label="Quantity slider" type="range" min={selected?.minQuantity || 100} max={Math.min(selected?.maxQuantity || 10000, 10000)} step={selected?.quantityStep || 100} value={quantity} onChange={e => { setQuantity(Number(e.target.value));  }} className="demo-range mt-3 w-full" /><p className="mt-2 text-[10px] text-[#A8AFBD]">Available from {selected?.minQuantity.toLocaleString("en-IN")} to {selected?.maxQuantity.toLocaleString("en-IN")} · {selected?.deliveryTime} · {selected?.refillPolicy}</p>{selected && health[selected.code]?.acceptsNewOrders === false ? <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[.07] px-3 py-2 text-xs font-bold text-amber-200">This service is temporarily unavailable for new orders. You can preview pricing and choose another service.</p> : null}</div><div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-orange-400/20 bg-orange-400/[.07] p-4"><span className="text-xs text-[#A8AFBD]">Price preview<b className="mt-1 block text-2xl text-white">{money(total)}</b></span><span className="text-right text-xs text-[#A8AFBD]">Selected service<b className="mt-1 block text-sm text-white">{selected?.name}</b></span></div>{demoIsReady && <p className="mt-4 text-center text-xs font-bold text-emerald-300">✓ Configuration ready</p>}<button type="button" onClick={goOrder} disabled={!demoIsReady || Boolean(selected && health[selected.code]?.acceptsNewOrders === false)} className="mt-3 w-full rounded-xl border border-orange-400/35 bg-gradient-to-r from-orange-500/90 to-amber-500/90 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45">{selected && health[selected.code]?.acceptsNewOrders === false ? "Service temporarily unavailable" : demoIsReady ? "Continue to Order →" : "Choose a valid quantity"}</button></div></Container></section>

    <section className="border-y border-white/[.07] bg-[#0A0C11] py-16"><Container className="max-w-4xl"><div><SectionHeading eyebrow="Frequently asked" title="A few useful answers." text="For more detailed guidance, browse the complete FAQ." align="left" /><div className="mt-6 divide-y divide-white/15 rounded-2xl border border-white/15 bg-[#101219] px-5">{faqs.map(([q, a]) => <details key={q} className="py-4"><summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 text-base font-semibold">{q}<ChevronDown className="h-4 w-4 shrink-0 text-orange-300" aria-hidden="true" /></summary><p className="pt-3 text-base leading-7 text-[#b8c0cd]">{a}</p></details>)}</div><Link href="/faq" className="sr-text-link mt-5">View All FAQs <ArrowRight className="h-4 w-4" /></Link></div></Container></section>


    <section className="py-12"><Container className="rounded-3xl border border-orange-400/20 bg-[radial-gradient(circle_at_90%_0%,rgba(255,118,0,.16),transparent_28rem),#101219] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8"><div><p className="eyebrow">Trust Center</p><h2 className="mt-3 text-2xl font-black sm:text-3xl">Clarity is built into the order experience.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#A8AFBD]">Review payment, public-link ordering, delivery tracking, refill terms and support information before you proceed.</p></div><Link href="/trust" className="sr-secondary mt-5 shrink-0 sm:mt-0">Visit Trust Center <ArrowRight className="h-4 w-4" /></Link></Container></section>

    <section className="py-16"><Container className="final-cta"><div><p className="eyebrow">SocialRUSH</p><h2 className="mt-3 max-w-2xl text-4xl font-black sm:text-5xl">Ready to build your next campaign?</h2><p className="mt-4 max-w-xl text-sm leading-7 text-[#DDD5CC]">Choose a service, review the price and continue when you are ready. No social account password is required.</p></div><div className="flex flex-wrap gap-3"><a href="#services" className="sr-primary">Choose a Service <ArrowRight className="h-4 w-4" /></a><Link href="/dashboard/new-order" className="sr-secondary">I Know What I Need</Link></div></Container></section>
  </div>;
}

function SectionHeading({ eyebrow, title, text, align = "center" }: { eyebrow: string; title: string; text: string; align?: "left" | "center" }) { return <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}><p className="eyebrow">{eyebrow}</p><h2 className="mt-3 text-3xl font-black tracking-[-.045em] sm:text-4xl">{title}</h2><p className="mt-4 text-sm leading-7 text-[#A8AFBD]">{text}</p></div>; }
