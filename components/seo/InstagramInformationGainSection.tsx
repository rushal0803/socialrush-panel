import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, IndianRupee, Link2, Scale } from "lucide-react";
import { getServiceById } from "@/lib/smm-service-catalog";
import {
  buildInstagramQuantityExamples,
  getInstagramDecisionRow,
  instagramDecisionRows,
  type InstagramInformationServiceCode,
} from "@/lib/seo/instagram-information-gain";

type Props = {
  serviceCode: InstagramInformationServiceCode;
  ratePer1000?: number | null;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  deliveryTime?: string | null;
  refillPolicy?: string | null;
  orderHref?: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

export default function InstagramInformationGainSection({
  serviceCode,
  ratePer1000,
  minQuantity,
  maxQuantity,
  deliveryTime,
  refillPolicy,
  orderHref,
}: Props) {
  const current = getInstagramDecisionRow(serviceCode);
  const catalog = getServiceById(serviceCode);
  const safeCatalogRate = catalog && !catalog.requiresLiveCatalogFacts && catalog.pricePer1000 > 0
    ? catalog.pricePer1000
    : null;
  const effectiveRate = ratePer1000 ?? safeCatalogRate;
  const effectiveMin = minQuantity ?? catalog?.minQuantity ?? null;
  const effectiveMax = maxQuantity ?? catalog?.maxQuantity ?? null;
  const effectiveDelivery = deliveryTime ?? catalog?.deliveryTime ?? "Review the current estimate before checkout";
  const effectiveRefill = refillPolicy ?? catalog?.refillPolicy ?? "Review the current service terms before checkout";
  const quantityExamples = buildInstagramQuantityExamples(effectiveRate, effectiveMin, effectiveMax);
  const packagesHref = orderHref ?? `/packages?platform=instagram&service=${encodeURIComponent(serviceCode.replace("instagram-", ""))}`;

  return (
    <section aria-labelledby={`${serviceCode}-information-gain-heading`} className="border-y border-white/10 bg-[#0d0f14] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Instagram decision guide</p>
          <h2 id={`${serviceCode}-information-gain-heading`} className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Choose the Instagram signal that matches your actual goal
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Followers, likes, views, comments, saves and shares are different visible signals. They use different destination links and they should not be treated as interchangeable outcomes.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-3xl border border-white/10 bg-white/[.03]">
          <table className="min-w-[920px] w-full border-collapse text-left text-sm">
            <thead className="bg-white/[.045] text-[10px] font-black uppercase tracking-[.12em] text-slate-400">
              <tr>
                <th className="px-4 py-4">Service</th>
                <th className="px-4 py-4">Best used for</th>
                <th className="px-4 py-4">Link required</th>
                <th className="px-4 py-4">What it changes visibly</th>
                <th className="px-4 py-4">What it does not guarantee</th>
              </tr>
            </thead>
            <tbody>
              {instagramDecisionRows.map((row) => {
                const active = row.code === serviceCode;
                return (
                  <tr key={row.code} className={`border-t border-white/10 align-top ${active ? "bg-orange-500/[.09]" : ""}`}>
                    <td className="px-4 py-4">
                      <Link href={row.href} className="inline-flex items-center gap-2 font-black text-orange-200 hover:text-orange-100">
                        {row.label}{active ? <span className="rounded-full bg-orange-400/15 px-2 py-0.5 text-[9px] uppercase tracking-wide">This page</span> : null}
                      </Link>
                    </td>
                    <td className="max-w-[260px] px-4 py-4 leading-6 text-slate-300">{row.bestFor}</td>
                    <td className="max-w-[220px] px-4 py-4 leading-6 text-slate-300">{row.destination}</td>
                    <td className="px-4 py-4 font-bold text-white">{row.visibleSignal}</td>
                    <td className="max-w-[280px] px-4 py-4 leading-6 text-slate-400">{row.limitation}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
          <article className="rounded-3xl border border-orange-400/20 bg-orange-500/[.06] p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-400/15 text-orange-200"><Scale className="h-5 w-5" /></span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">This service</p>
                <h3 className="mt-1 text-xl font-black">{current.label}: when it makes sense</h3>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-300">{current.bestFor}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="flex items-center gap-2 text-xs font-black text-white"><Link2 className="h-4 w-4 text-orange-300" /> Required destination</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{current.destination}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="flex items-center gap-2 text-xs font-black text-white"><AlertTriangle className="h-4 w-4 text-amber-300" /> Important limitation</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{current.limitation}</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
              <div className="rounded-xl bg-white/[.035] p-3"><dt className="text-slate-500">Current delivery guidance</dt><dd className="mt-1 font-black text-white">{effectiveDelivery}</dd></div>
              <div className="rounded-xl bg-white/[.035] p-3"><dt className="text-slate-500">Current refill/support guidance</dt><dd className="mt-1 font-black text-white">{effectiveRefill}</dd></div>
            </dl>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><IndianRupee className="h-5 w-5" /></span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Quantity & pricing clarity</p>
                <h3 className="mt-1 text-xl font-black">Understand the order before payment</h3>
              </div>
            </div>

            {quantityExamples.length ? (
              <>
                <p className="mt-5 text-sm leading-7 text-slate-300">
                  At the currently displayed rate, these are simple quantity-planning examples. The final checkout total remains authoritative.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {quantityExamples.map((example) => (
                    <div key={example.quantity} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{example.quantity.toLocaleString("en-IN")} units</p>
                      <p className="mt-2 text-lg font-black text-white">{money(example.total)}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-5 text-sm leading-7 text-slate-300">
                This service uses current live catalog facts. Review the active quantity range and exact INR total in the order flow instead of relying on a stale static price.
              </p>
            )}

            <div className="mt-5 space-y-3 text-sm text-slate-300">
              {[
                "Use the exact public destination required by this service.",
                "Keep the submitted profile or content accessible while delivery is active.",
                "Never share an Instagram password, OTP or recovery code.",
                "Avoid overlapping orders for the same destination until the active order is complete.",
                "Treat the service as a visible-count or activity campaign, not a guarantee of business results.",
              ].map((item) => (
                <p key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />{item}</p>
              ))}
            </div>
            <Link href={packagesHref} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#111]">
              Review current order details <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
