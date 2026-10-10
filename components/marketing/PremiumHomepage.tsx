"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronDown, CircleDollarSign, Headphones, Link2, PackageCheck, RefreshCw, Search, TicketCheck, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import TrackedLink from "@/components/analytics/TrackedLink";
import { activeSmmServices, platformMeta, type SmmPlatformId } from "@/lib/smm-service-catalog";
import { calculateServiceTotal } from "@/lib/service-pricing";
import { serviceHealthLabels, type ServiceHealth } from "@/lib/service-health";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { Container, Section } from "@/components/ui";

const platforms: SmmPlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];
const platformColor: Record<SmmPlatformId, string> = { instagram: "from-fuchsia-500 to-orange-400", youtube: "from-red-500 to-red-700", facebook: "from-blue-500 to-blue-700", linkedin: "from-sky-500 to-blue-800", telegram: "from-sky-400 to-blue-600", tiktok: "from-cyan-400 via-slate-600 to-rose-500", x: "from-slate-500 to-slate-950" };
const trust: [LucideIcon, string, string][] = [[Link2, "Public link only", "No social account password is required."], [CircleDollarSign, "Transparent pricing", "Review the rate before you confirm."], [Wallet, "Wallet visibility", "See your available balance in one place."], [TrendingUp, "Order tracking", "Follow campaign progress from your dashboard."], [RefreshCw, "Refill information", "See applicable service terms clearly."], [Headphones, "Support", "Use the available help channels when needed."]];
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
  const featured = activeSmmServices.filter(s => ["instagram-followers", "instagram-likes", "instagram-views", "youtube-subscribers", "youtube-views", "facebook-followers"].includes(s.code));
  const choosePlatform = (next: SmmPlatformId) => { setPlatform(next); setRequestedService(""); setServiceCode(""); setQuantity(1000); };
  const goOrder = () => router.push(destination);

  return <div className="premium-homepage sr-page overflow-hidden bg-[#07080D] text-white">
    {hero}
    <Section id="services" className="py-12"><Container><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><SectionHeading eyebrow="Popular services" title="Choose a service with clarity." text="Pricing comes from the live SocialRUSH service catalog." align="left" /><Link href="/services" className="sr-text-link">View all services <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{featured.map(s => { const currentHealth = health[s.code]; return <article key={s.code} className="service-card product-service-card sr-motion-lift sr-motion-shimmer"><div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${platformColor[s.platform]} text-white`}><PlatformIcon platform={s.platform} className="h-5 w-5" /></span>{currentHealth ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300"><i className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{currentHealth.acceptsNewOrders ? "Available" : serviceHealthLabels[currentHealth.status]}</span> : null}</div><h3 className="mt-4 text-lg font-black">{s.name}</h3><p className="mt-2 text-xs text-[#9FA8B6]">Starting from</p><p className="service-price mt-1 text-2xl font-black">{money(s.pricePer1000)} <span className="text-xs font-semibold text-[#9FA8B6]">/ 1K</span></p><div className="mt-4 grid gap-1 border-y border-white/[.08] py-3 text-xs"><span className="text-[#D7DBE3]">{s.deliveryTime}</span><span className="text-[#A8AFBD]">{s.refillPolicy}</span></div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => { choosePlatform(s.platform); setServiceCode(s.code); document.getElementById("order-demo")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }} className="sr-secondary sr-motion-press w-full">Check Price <ArrowRight className="h-4 w-4" /></button>{currentHealth?.acceptsNewOrders === false ? <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[.04] px-3 text-center text-xs font-bold text-[#8F96A3]">Temporarily unavailable</span> : <Link href={`/dashboard/new-order?platform=${encodeURIComponent(s.platform)}&service=${encodeURIComponent(s.code)}&resume=1`} className="sr-primary sr-motion-press w-full">Order Now <ArrowRight className="h-4 w-4" /></Link>}</div></article>; })}</div></Container></Section>

    <Section className="py-8 sm:py-10"><Container>
      <nav aria-label="Choose your next step" className="grid gap-0 divide-y divide-white/15 border-y border-white/15 md:grid-cols-3 md:divide-x md:divide-y-0">
        {[
          { href: "#order-demo", step: "order", title: "I’m ready to order", text: "Choose a service and quantity." },
          { href: "/services", step: "compare", title: "I want to compare services", text: "Find the details for your platform." },
          { href: "/tools/social-media-service-cost-calculator", step: "budget", title: "I need to plan a budget", text: "Plan quantities around your budget." },
        ].map((path, index) => <TrackedLink key={path.step} href={path.href} event="homepage_conversion_path_click" metadata={{ surface: "homepage_decision_rail", step: path.step }} className="flex min-h-24 items-center justify-between gap-4 px-4 py-5"><div><span className="text-xs text-orange-300">0{index + 1}</span><b className="mt-1 block text-sm">{path.title}</b><p className="mt-1 text-sm text-[#C4C8BD]">{path.text}</p></div><ArrowRight size={18} aria-hidden="true" /></TrackedLink>)}
      </nav>
      <p className="mt-3 text-sm text-[#C4C8BD]">Every path uses the current catalog and existing order flow.</p>
      <div className="mt-12"><SectionHeading eyebrow="SocialRUSH Growth Engine" title="Grow across the platforms that matter." text="Explore available services by platform, compare options clearly, and continue when you are ready." /><div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-4">{platforms.map(p=><Link href={`/services?platform=${p}`} key={p} className="flex items-center gap-3 bg-[#191b18] p-5"><PlatformIcon platform={p} className="h-5 w-5 text-orange-200" /><div><b className="block text-sm">{platformMeta[p].label}</b><span className="text-xs text-[#A8AFBD]">{activeSmmServices.filter(s=>s.platform===p).length} services ? Explore</span></div><ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" /></Link>)}</div></div>
    </Container></Section>

    <section className="border-y border-white/[.07] bg-[#0A0C11] py-12"><Container><SectionHeading eyebrow="One workspace" title="A professional workspace for every campaign." text="Discover services, review pricing, manage payments and track orders without unnecessary complexity." /><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4 sr-motion-reveal"><FeatureCard className="md:col-span-2 lg:row-span-2" icon={Search} title="Service discovery" text="Find services by platform and compare their delivery details before ordering."><div className="mt-6 rounded-2xl border border-white/[.08] bg-[#090B10] p-3"><div className="flex items-center gap-3 rounded-xl border border-orange-400/25 bg-orange-400/[.07] p-3 text-sm"><Search className="h-4 w-4 text-orange-300" /><span className="flex-1 text-[#D7DBE3]">Instagram Followers</span><span className="text-xs text-emerald-300">Available</span></div><div className="mt-3 grid grid-cols-3 gap-2">{["Followers", "Likes", "Views"].map(x => <span key={x} className="rounded-lg bg-white/[.04] p-2 text-center text-[10px] text-[#A8AFBD]">{x}</span>)}</div></div></FeatureCard><FeatureCard icon={CircleDollarSign} title="Transparent pricing" text="Know the service rate and estimated total before confirming." /><FeatureCard icon={Wallet} title="Wallet" text="Manage your available balance from your dashboard." /><FeatureCard className="lg:col-span-2" icon={TicketCheck} title="Order tracking" text="Follow campaign progress with a visible status timeline."><div className="mt-5 flex items-center gap-2 text-[10px] font-bold text-[#C8CED8]"><span className="status-dot" /> Received <span className="h-px flex-1 bg-emerald-400/50" /><span className="status-dot" /> Processing <span className="h-px flex-1 bg-white/15" /><span className="grid h-5 w-5 place-items-center rounded-full border border-white/15 text-[#747B89]">3</span></div></FeatureCard><FeatureCard icon={RefreshCw} title="Refill support" text="Understand eligibility and terms for each applicable service." /><FeatureCard icon={Headphones} title="Customer support" text="Get help through the support channels available to you." /></div></Container></section>


    <section id="how-it-works" className="border-y border-white/[.07] bg-[#0B0D12] py-16"><Container><SectionHeading eyebrow="Campaign journey" title="A clear path from service to delivery." text="Choose your service, configure a campaign, review your details, then follow every status from your dashboard." /><ol className="workflow workflow-five mt-10 sr-motion-reveal">{[["01", "Choose service", "Select the platform and growth service that fits your objective."], ["02", "Configure campaign", "Add the requested public link and an eligible quantity."], ["03", "Review & pay securely", "See the live rate and final details before checkout."], ["04", "Track delivery", "Follow status changes, receipts and support updates in one place."], ["05", "Campaign completed", "Return to your workspace when the service reaches completion."]].map(([num, title, text]) => <li key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></li>)}</ol><div className="mt-9 flex flex-col items-center gap-2 text-center"><TrackedLink href="#order-demo" event="homepage_conversion_path_click" metadata={{ surface: "homepage_how_it_works", step: "order" }} className="sr-primary sr-motion-press">Check Live Price <ArrowRight className="h-4 w-4" /></TrackedLink><span className="text-[11px] text-[#8F96A3]">Choose a service and quantity before continuing to the real order flow.</span></div></Container></section>

    <section id="order-demo" className="py-16"><Container className="grid items-center gap-10 lg:grid-cols-[.82fr_1.18fr]"><div><SectionHeading eyebrow="Interactive product demo" title="Build your campaign before checkout." text="This preview never creates an order. Configure it here, then continue to the secure existing order flow when you are ready." align="left" /><div className="mt-6 space-y-3 text-sm text-[#C9D0DB] sr-motion-reveal"><p className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-emerald-400" />Choose a platform and its available service.</p><p className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-emerald-400" />See the estimated price and service terms before continuing.</p><p className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-emerald-400" />Open your real order flow only when you are ready.</p></div></div><div className="demo-card sr-motion-pop"><div className="flex items-center justify-between border-b border-white/[.08] pb-4"><div><p className="eyebrow">New order · product preview</p><h3 className="mt-1 text-xl font-black">Build your campaign</h3></div><span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-[10px] font-bold text-orange-200">Preview only</span></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="demo-field"><span>Choose platform</span><select value={platform} onChange={e => choosePlatform(e.target.value as SmmPlatformId)}>{platforms.map(p => <option key={p} value={p}>{platformMeta[p].label}</option>)}</select></label><label className="demo-field"><span>Choose service</span><select value={selected?.code || ""} onChange={e => { setServiceCode(e.target.value);  }}>{services.map(s => <option key={s.code} value={s.code}>{serviceType(s.code)}</option>)}</select></label></div><div className="mt-4"><div className="flex items-center justify-between gap-3 text-xs font-bold"><span>Quantity</span><label className="flex items-center gap-2 text-orange-200"><span className="sr-only">Exact quantity</span><input aria-label="Exact quantity" inputMode="numeric" value={quantity || ""} onChange={e => { setQuantity(Number(e.target.value.replace(/\D/g, "")));  }} className="w-24 rounded-lg border border-orange-400/25 bg-black/25 px-2 py-1 text-right text-xs font-bold text-white" /></label></div><input aria-label="Quantity slider" type="range" min={selected?.minQuantity || 100} max={Math.min(selected?.maxQuantity || 10000, 10000)} step={selected?.quantityStep || 100} value={quantity} onChange={e => { setQuantity(Number(e.target.value));  }} className="demo-range mt-3 w-full" /><p className="mt-2 text-[10px] text-[#A8AFBD]">Available from {selected?.minQuantity.toLocaleString("en-IN")} to {selected?.maxQuantity.toLocaleString("en-IN")} · {selected?.deliveryTime} · {selected?.refillPolicy}</p>{selected && health[selected.code]?.acceptsNewOrders === false ? <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[.07] px-3 py-2 text-xs font-bold text-amber-200">This service is temporarily unavailable for new orders. You can preview pricing and choose another service.</p> : null}</div><div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-orange-400/20 bg-orange-400/[.07] p-4"><span className="text-xs text-[#A8AFBD]">Price preview<b className="mt-1 block text-2xl text-white">{money(total)}</b></span><span className="text-right text-xs text-[#A8AFBD]">Selected service<b className="mt-1 block text-sm text-white">{selected?.name}</b></span></div>{demoIsReady && <p className="mt-4 text-center text-xs font-bold text-emerald-300">✓ Configuration ready</p>}<button type="button" onClick={goOrder} disabled={!demoIsReady || Boolean(selected && health[selected.code]?.acceptsNewOrders === false)} className="mt-3 w-full rounded-xl border border-orange-400/35 bg-gradient-to-r from-orange-500/90 to-amber-500/90 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45">{selected && health[selected.code]?.acceptsNewOrders === false ? "Service temporarily unavailable" : demoIsReady ? "Continue to Order →" : "Choose a valid quantity"}</button></div></Container></section>

    <section className="border-y border-white/[.07] bg-[#0A0C11] py-16"><Container><SectionHeading eyebrow="Trust by design" title="Built around clarity and control." text="Useful information is placed where you need it, without making promises beyond the service details you can review." /><div className="trust-bento mt-9">{trust.map(([Icon, title, text], index) => <article key={title} className={`trust-card ${index === 0 ? "trust-card-featured" : ""}`}><span><Icon className="h-5 w-5" /></span><h3>{title}</h3><p>{text}</p>{index < 3 ? <div className="trust-mini" aria-hidden="true"><i /><i /><i /></div> : null}</article>)}</div></Container></section>

    <section className="py-16"><Container className="grid items-center gap-10 lg:grid-cols-[1fr_.96fr]"><div className="dashboard-preview order-2 lg:order-1"><div className="dash-top"><span className="font-black">Social<span className="text-orange-400">RUSH</span></span><span className="text-[10px] text-[#9FA8B6]">Dashboard preview · sample data</span></div><div className="grid gap-3 p-4 sm:grid-cols-[.8fr_1.2fr]"><aside className="rounded-xl border border-white/[.08] bg-[#0A0C10] p-3"><p className="eyebrow">Workspace</p>{["Overview", "New Order", "Orders", "Wallet", "Support"].map((x, i) => <p key={x} className={`mt-2 rounded-lg px-3 py-2 text-xs ${i === 0 ? "bg-orange-400/10 text-orange-200" : "text-[#A8AFBD]"}`}>{x}</p>)}</aside><div className="space-y-3"><div className="grid grid-cols-2 gap-3"><DashStat label="Wallet · sample" value="₹X,XXX" icon={Wallet} /><DashStat label="Service status" value="Operational" icon={PackageCheck} /></div><div className="rounded-xl border border-white/[.08] bg-[#0A0C10] p-3"><div className="flex justify-between"><b className="text-sm">Recent orders</b><span className="text-[10px] text-orange-300">Sample view</span></div>{[["Instagram Followers", "Processing", "bg-orange-400"], ["YouTube Views", "Completed", "bg-emerald-400"], ["LinkedIn Followers", "Reviewing", "bg-sky-400"]].map(([name, status, color]) => <div key={name} className="mt-3 rounded-lg bg-white/[.035] p-2.5"><div className="flex justify-between text-[11px]"><b>{name}</b><span className="text-[#A8AFBD]">{status}</span></div><div className="mt-2 h-1.5 rounded-full bg-white/10"><div className={`h-full rounded-full ${color}`} style={{ width: status === "Completed" ? "100%" : status === "Processing" ? "65%" : "32%" }} /></div></div>)}</div></div></div></div><div className="order-1 lg:order-2"><SectionHeading eyebrow="After login" title="Your growth workspace." text="Wallet, new orders, service visibility, support and tracking come together in an easy-to-scan dashboard." align="left" /><Link href="/dashboard" className="sr-primary mt-7">Open dashboard <ArrowRight className="h-4 w-4" /></Link></div></Container></section>

    <section className="border-y border-white/[.07] bg-[#0A0C11] py-16"><Container className="grid gap-9 lg:grid-cols-[.8fr_1.2fr]"><div><SectionHeading eyebrow="Order confidence" title="Review the details at checkout." text="Your order total and key requirements remain visible before you proceed." align="left" /><div className="confidence-card mt-7"><p className="eyebrow">Your order · preview</p><h3 className="mt-2 text-xl">{selected?.name || "Instagram Followers"}</h3><p className="mt-1 text-sm text-[#A8AFBD]">{quantity.toLocaleString("en-IN")} quantity</p><div className="mt-5 flex justify-between border-y border-white/[.08] py-4"><span className="text-sm text-[#A8AFBD]">Order total</span><b className="text-xl">{money(total)}</b></div><ul className="mt-4 space-y-2 text-xs text-[#D7DBE3]"><li>✓ Public link only</li><li>✓ No password required</li><li>✓ Review before confirming</li></ul><button onClick={goOrder} className="sr-primary mt-5 w-full">Start Order <ArrowRight className="h-4 w-4" /></button></div></div><div><SectionHeading eyebrow="Frequently asked" title="A few useful answers." text="For more detailed guidance, browse the complete FAQ." align="left" /><div className="mt-6 divide-y divide-white/[.08] rounded-2xl border border-white/[.08] bg-[#10131A] px-4">{faqs.map(([q, a], i) => <div key={q}><button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-sm font-bold"><span>{q}</span><ChevronDown className={`h-4 w-4 shrink-0 text-orange-300 transition ${openFaq === i ? "rotate-180" : ""}`} /></button><div className={`grid transition-[grid-template-rows] duration-300 ${openFaq === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><p className="overflow-hidden pb-4 text-sm leading-6 text-[#A8AFBD]">{a}</p></div></div>)}</div><Link href="/faq" className="sr-text-link mt-5">View All FAQs <ArrowRight className="h-4 w-4" /></Link></div></Container></section>


    <section className="border-y border-white/[.07] bg-[#0A0C11] py-16"><Container className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><SectionHeading eyebrow="Social media growth services in India" title="Choose services with useful information first." text="SocialRUSH brings Instagram, YouTube, Facebook, LinkedIn, X, TikTok and Telegram services into one place. Browse the live catalog to compare service requirements, pricing and delivery information before placing an order." align="left" /><div className="grid content-start gap-3 sm:grid-cols-2">{platforms.map((p) => <Link key={p} href={`/services?platform=${p}`} className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-sm font-bold text-[#D7DBE3] transition hover:border-orange-400/50 hover:text-orange-200">{platformMeta[p].label} growth services <ArrowRight className="float-right mt-0.5 h-4 w-4" /></Link>)}</div></Container></section>

    <section className="py-12"><Container className="rounded-3xl border border-orange-400/20 bg-[radial-gradient(circle_at_90%_0%,rgba(255,118,0,.16),transparent_28rem),#101219] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8"><div><p className="eyebrow">Trust Center</p><h2 className="mt-3 text-2xl font-black sm:text-3xl">Clarity is built into the order experience.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#A8AFBD]">Review payment, public-link ordering, delivery tracking, refill terms and support information before you proceed.</p></div><Link href="/trust" className="sr-secondary mt-5 shrink-0 sm:mt-0">Visit Trust Center <ArrowRight className="h-4 w-4" /></Link></Container></section>

    <section className="py-16"><Container className="final-cta"><div><p className="eyebrow">SocialRUSH</p><h2 className="mt-3 max-w-2xl text-4xl font-black sm:text-5xl">Ready to build your next campaign?</h2><p className="mt-4 max-w-xl text-sm leading-7 text-[#DDD5CC]">Choose a service, review the price and continue when you are ready. No social account password is required.</p></div><div className="flex flex-wrap gap-3"><a href="#services" className="sr-primary">Choose a Service <ArrowRight className="h-4 w-4" /></a><Link href="/dashboard/new-order" className="sr-secondary">I Know What I Need</Link></div></Container></section>
  </div>;
}

function SectionHeading({ eyebrow, title, text, align = "center" }: { eyebrow: string; title: string; text: string; align?: "left" | "center" }) { return <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}><p className="eyebrow">{eyebrow}</p><h2 className="mt-3 text-3xl font-black tracking-[-.045em] sm:text-4xl">{title}</h2><p className="mt-4 text-sm leading-7 text-[#A8AFBD]">{text}</p></div>; }
function FeatureCard({ icon: Icon, title, text, children, className = "" }: { icon: LucideIcon; title: string; text: string; children?: React.ReactNode; className?: string }) { return <article className={`feature-card ${className}`}><span className="icon-box"><Icon className="h-5 w-5" /></span><h3 className="mt-6 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[#A8AFBD]">{text}</p>{children}</article>; }
function DashStat({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) { return <div className="rounded-xl border border-white/[.08] bg-[#0A0C10] p-3"><Icon className="h-4 w-4 text-orange-300" /><p className="mt-3 text-[10px] text-[#A8AFBD]">{label}</p><b className="mt-1 block text-sm">{value}</b></div>; }
