"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, CreditCard, Gift, Trash2 } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import { formatCurrency } from "@/lib/currency";
import { track } from "@/lib/analytics/events";
import { resolveFirstOrderConversionMode } from "@/lib/cro/first-order-conversion";

export type DraftSummary = { platform: string; serviceCode: string; serviceName: string; quantity: number; updatedAt: string };
export type ServiceShortcut = { code: string; platform: string; name: string; pricePer1000: number; minQuantity: number; minimumTotal: number };
export type CheckoutRecoverySummary = { id: string; serviceCode: string; serviceName: string; quantity: number; target: string | null; total: number; createdAt: string; expiresAt: string | null };

const readinessSteps = [
  ["1", "Choose a service", "Pick the platform and service that matches your goal."],
  ["2", "Add a public link", "Use the requested public profile, post, video or group link. No password required."],
  ["3", "Review exact total", "Confirm quantity, current price and payment details before anything is placed."],
] as const;

export default function OrderConversionCards({
  firstOrder,
  draft,
  shortcuts,
  checkoutRecovery,
  firstOrderOffer,
}: {
  firstOrder: boolean;
  draft: DraftSummary | null;
  shortcuts: ServiceShortcut[];
  checkoutRecovery: CheckoutRecoverySummary | null;
  firstOrderOffer: { reward: number; minimum: number } | null;
}) {
  const mode = resolveFirstOrderConversionMode({
    firstOrder,
    hasDraft: Boolean(draft),
    hasCheckoutRecovery: Boolean(checkoutRecovery),
  });

  if (!mode) return null;

  const recoveryParams = new URLSearchParams();
  if (checkoutRecovery) {
    recoveryParams.set("service", checkoutRecovery.serviceCode);
    recoveryParams.set("quantity", String(checkoutRecovery.quantity));
    recoveryParams.set("prefill", "1");
    if (checkoutRecovery.target) recoveryParams.set("link", checkoutRecovery.target);
  }
  const recoveryHref = checkoutRecovery ? `/dashboard/new-order?${recoveryParams.toString()}` : "/dashboard/new-order";
  const discard = async () => {
    const response = await fetch("/api/order-draft", { method: "DELETE" });
    if (response.ok) {
      track("order_draft_discarded", { step: "dashboard" });
      window.location.reload();
    }
  };

  return <section className="sr-smart-conversion mt-4">
    {mode === "first_order" ? <article className="sr-smart-card relative overflow-hidden rounded-[1.35rem] border border-orange-400/25 bg-[radial-gradient(circle_at_85%_10%,rgba(255,122,0,.22),transparent_35%),linear-gradient(135deg,#17120c,#101116)] p-5 shadow-[0_24px_60px_-42px_rgba(255,122,0,.95)] sm:p-6">
      <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-200">Your first campaign</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight">Your first order in three clear steps</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Start with a service, add the correct public link, then review the exact total before payment. Nothing is placed until you confirm the final step.</p>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {readinessSteps.map(([number, title, description]) => <div key={number} className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-orange-400/25 bg-orange-500/10 text-xs font-black text-orange-200">{number}</span>
            <div>
              <p className="text-sm font-black text-white">{title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
            </div>
          </div>
        </div>)}
      </div>

      {firstOrderOffer ? <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/[.08] p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-300"><Gift className="h-5 w-5" /></span>
        <div>
          <p className="text-sm font-black text-emerald-200">{formatCurrency(firstOrderOffer.reward, "INR")} first-order wallet bonus</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">Complete your first qualifying order of {formatCurrency(firstOrderOffer.minimum, "INR")} or more. After completion, the bonus is credited to your SocialRUSH wallet automatically.</p>
        </div>
      </div> : null}

      {shortcuts.length ? <div className="mt-4">
        <p className="mb-2 text-[11px] font-bold text-slate-400">Starter choices · minimum quantity prefilled · you can edit before review</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {shortcuts.map((service) => <Link
            key={service.code}
            href={`/dashboard/new-order?platform=${service.platform}&service=${service.code}&quantity=${service.minQuantity}&prefill=1`}
            onClick={() => track("service_selected", { service_code: service.code, platform: service.platform, step: "first_order_shortcut" })}
            className="sr-smart-service rounded-xl border border-white/10 bg-black/20 p-3 transition hover:border-orange-400/50 hover:bg-orange-500/10 focus:outline-none focus:ring-4 focus:ring-orange-400/20"
          >
            <PlatformIcon platform={service.platform} className="h-5 w-5 text-orange-300" />
            <p className="mt-2 text-xs font-black">{service.name}</p>
            <p className="mt-2 text-sm font-black text-emerald-300">Start at {formatCurrency(service.minimumTotal, "INR")}</p>
            <p className="mt-1 text-[10px] text-slate-400">{formatCurrency(service.pricePer1000, "INR")} / 1K · Min {service.minQuantity.toLocaleString("en-IN")}</p>
          </Link>)}
        </div>
      </div> : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link href="/dashboard/new-order" onClick={() => track("new_order_clicked", { step: "first_order_cta", surface: "dashboard_conversion" })} className="btn-dashboard-primary gap-2 px-5 text-sm">
          Start Your First Order <ArrowRight className="h-4 w-4" />
        </Link>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Exact price shown before payment</span>
      </div>
    </article> : null}

    {mode === "checkout_recovery" && checkoutRecovery ? <article className="sr-smart-card rounded-[1.35rem] border border-sky-400/25 bg-[linear-gradient(135deg,rgba(14,165,233,.12),rgba(16,17,22,.98)_58%)] p-5 shadow-[0_24px_60px_-45px_rgba(14,165,233,.65)] sm:p-6">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-sky-400/25 bg-sky-500/10 text-sky-200"><CreditCard className="h-5 w-5" /></span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-sky-200">Unfinished checkout</p>
          <h2 className="mt-1 text-xl font-black">Finish your checkout</h2>
          <p className="mt-1 text-sm text-slate-300">You already reached checkout, so this is your clearest next step. We’ll rebuild the order using current pricing instead of reusing the old payment session.</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3"><dt className="text-slate-500">Service</dt><dd className="mt-1 font-bold">{checkoutRecovery.serviceName}</dd></div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3"><dt className="text-slate-500">Quantity</dt><dd className="mt-1 font-bold">{checkoutRecovery.quantity.toLocaleString("en-IN")}</dd></div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3"><dt className="text-slate-500">Previous total</dt><dd className="mt-1 font-bold">{formatCurrency(checkoutRecovery.total, "INR")}</dd></div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3"><dt className="text-slate-500">Started</dt><dd className="mt-1 font-bold">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(checkoutRecovery.createdAt))}</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={recoveryHref} onClick={() => track("checkout_recovery_click", { service_code: checkoutRecovery.serviceCode, step: "dashboard_rebuild" })} className="btn-dashboard-primary gap-2 px-4 text-xs">Finish Checkout <ArrowRight className="h-4 w-4" /></Link>
        <Link href="/dashboard/new-order" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-xs font-bold text-slate-300 hover:border-orange-400/35 hover:text-orange-200">Start Fresh</Link>
      </div>
    </article> : null}

    {mode === "draft" && draft ? <article className="sr-smart-card rounded-[1.35rem] border border-amber-400/25 bg-[linear-gradient(135deg,rgba(255,122,0,.13),rgba(16,17,22,.98)_55%)] p-5 shadow-[0_24px_60px_-45px_rgba(255,122,0,.7)] sm:p-6">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-400/25 bg-orange-500/10 text-orange-200"><Clock3 className="h-5 w-5" /></span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-200">Saved order</p>
          <h2 className="mt-1 text-xl font-black">Continue your order</h2>
          <p className="mt-1 text-sm text-slate-300">You already chose a service earlier. Continue that saved order before starting another path.</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3"><dt className="text-slate-500">Platform</dt><dd className="mt-1 font-bold capitalize">{draft.platform}</dd></div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3"><dt className="text-slate-500">Service</dt><dd className="mt-1 font-bold">{draft.serviceName}</dd></div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3"><dt className="text-slate-500">Quantity</dt><dd className="mt-1 font-bold">{draft.quantity.toLocaleString("en-IN")}</dd></div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3"><dt className="text-slate-500">Last updated</dt><dd className="mt-1 font-bold">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(draft.updatedAt))}</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/dashboard/new-order?draft=1" onClick={() => track("continue_order_clicked", { step: "draft_resumed" })} className="btn-dashboard-primary gap-2 px-4 text-xs">Continue Order <ArrowRight className="h-4 w-4" /></Link>
        <button onClick={() => void discard()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-xs font-bold text-slate-300 hover:border-red-400/35 hover:text-red-200"><Trash2 className="h-4 w-4" />Discard</button>
      </div>
    </article> : null}
  </section>;
}
