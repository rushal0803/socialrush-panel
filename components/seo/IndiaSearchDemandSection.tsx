import Link from "next/link";
import { ArrowRight, CheckCircle2, IndianRupee, Link2, ShieldCheck, WalletCards } from "lucide-react";
import { getContentCluster } from "@/lib/seo/content-clusters";
import { buildQuantityPlanning } from "@/lib/seo/search-demand";
import { getServiceById, type SmmPlatformId } from "@/lib/smm-service-catalog";
import type { ServiceCode } from "@/lib/service-pricing";

type Props = {
  serviceCode: ServiceCode;
  unitLabel: string;
  platformLabel?: string;
  liveRatePer1000?: number | null;
  liveMinQuantity?: number | null;
  liveMaxQuantity?: number | null;
};

function formatQuantity(value: number) {
  if (value >= 1000 && value % 1000 === 0) return `${value / 1000}K`;
  return value.toLocaleString("en-IN");
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function clusterKey(platform: SmmPlatformId) {
  return platform === "x" ? "twitter" : platform;
}

export default function IndiaSearchDemandSection({ serviceCode, unitLabel, platformLabel, liveRatePer1000, liveMinQuantity, liveMaxQuantity }: Props) {
  const service = getServiceById(serviceCode);
  if (!service) return null;

  const label = platformLabel || (service.platform === "x" ? "Twitter / X" : service.platform.charAt(0).toUpperCase() + service.platform.slice(1));
  const minQuantity = liveMinQuantity && liveMinQuantity > 0 ? liveMinQuantity : service.minQuantity;
  const maxQuantity = liveMaxQuantity && liveMaxQuantity > 0 ? liveMaxQuantity : service.maxQuantity;
  const step = service.quantityStep ?? 1;
  const protectedLiveFacts = service.requiresLiveCatalogFacts || service.pricePer1000 <= 0;
  const liveRateAvailable = typeof liveRatePer1000 === "number" && liveRatePer1000 > 0;
  const staticRate = protectedLiveFacts ? null : service.pricePer1000;
  const candidateRows = buildQuantityPlanning(staticRate);
  const rows = candidateRows.filter((row) =>
    row.quantity >= minQuantity
    && row.quantity <= maxQuantity
    && (row.quantity - minQuantity) % step === 0
  );
  const displayRows = rows.length > 0 ? rows : [
    { quantity: minQuantity, total: null as number | null },
    ...(maxQuantity !== minQuantity ? [{ quantity: maxQuantity, total: null as number | null }] : []),
  ].slice(0, 2);
  const cluster = getContentCluster(clusterKey(service.platform));

  return (
    <section aria-labelledby={`${serviceCode}-search-demand-heading`} className="border-y border-white/10 bg-[#0e1016] px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <article>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">India price & order guide</p>
            <h2 id={`${serviceCode}-search-demand-heading`} className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {label} {unitLabel} price in India by quantity
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Compare common campaign sizes before ordering. {protectedLiveFacts
                ? liveRateAvailable
                  ? "This service currently has live pricing in the active order flow, so static totals are intentionally not repeated here."
                  : "This service uses protected live catalog facts, so the final price is shown only in the active order flow."
                : "The totals below use the current catalog rate on this page."} Final availability, service terms and checkout total remain authoritative.
            </p>

            <div className="mt-7 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-[1fr_1.25fr] bg-white/[.05] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-slate-400">
                <span>Quantity</span><span>Current INR total</span>
              </div>
              {displayRows.map((row) => (
                <div key={row.quantity} className="grid grid-cols-[1fr_1.25fr] border-t border-white/10 px-4 py-4 text-sm">
                  <span className="font-black text-white">{formatQuantity(row.quantity)} {unitLabel}</span>
                  <span className="font-black text-orange-200">{row.total === null ? "Check live order total" : formatInr(row.total)}</span>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[11px] leading-5 text-slate-500">
              Quantity examples are planning shortcuts, not separate packages or discounts. Rates can change; always review the active order summary before payment.
            </p>
          </article>

          <aside className="rounded-[2rem] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,159,0,.14),transparent_30%),linear-gradient(145deg,#17140f,#101116)] p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">What to compare before you pay</p>
            <div className="mt-5 space-y-3">
              {[
                [IndianRupee, "Price & quantity", "Compare the exact INR total for the quantity you actually need."],
                [Link2, "Public link requirement", "Use the correct public profile, page, channel or content URL shown by the service."],
                [ShieldCheck, "No password", "SocialRUSH does not require your social-media password, OTP or recovery code for this order flow."],
                [WalletCards, "India payment flow", "UPI is available in the current India checkout flow; review the payment screen for the active options before paying."],
              ].map(([Icon, title, copy]) => {
                const ItemIcon = Icon as typeof IndianRupee;
                return <div key={String(title)} className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                  <div className="flex items-start gap-3">
                    <ItemIcon className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
                    <div><h3 className="text-sm font-black">{String(title)}</h3><p className="mt-1 text-xs leading-6 text-slate-300">{String(copy)}</p></div>
                  </div>
                </div>;
              })}
            </div>
          </aside>
        </div>

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.025] p-5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.13em] text-slate-400"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Continue your research</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.035] px-4 py-2.5 text-xs font-black text-orange-200 hover:border-orange-400/40">Compare all pricing <ArrowRight className="h-3.5 w-3.5" /></Link>
            {cluster ? <Link href={cluster.hubPath} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.035] px-4 py-2.5 text-xs font-black text-orange-200 hover:border-orange-400/40">{cluster.hubLabel} <ArrowRight className="h-3.5 w-3.5" /></Link> : null}
            {cluster?.guideLinks.slice(0, 2).map((link) => <Link key={link.href} href={link.href} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.035] px-4 py-2.5 text-xs font-black text-slate-200 hover:border-orange-400/40">{link.label} <ArrowRight className="h-3.5 w-3.5" /></Link>)}
          </div>
        </div>
      </div>
    </section>
  );
}
