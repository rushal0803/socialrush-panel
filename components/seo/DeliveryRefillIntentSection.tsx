import Link from "next/link";
import { ArrowRight, Clock3, Link2, RefreshCw, ShieldCheck } from "lucide-react";
import { buildDeliveryRefillIntentCopy } from "@/lib/seo/delivery-refill-intent";

export default function DeliveryRefillIntentSection({
  serviceName,
  deliveryTime,
  refillPolicy,
  destination,
  orderHref,
  tone = "dark",
}: {
  serviceName: string;
  deliveryTime: string;
  refillPolicy: string;
  destination: string;
  orderHref: string;
  tone?: "dark" | "light";
}) {
  const dark = tone === "dark";
  const copy = buildDeliveryRefillIntentCopy({ serviceName, deliveryTime, refillPolicy });

  return (
    <section className={dark ? "border-y border-white/10 bg-[#101116] px-4 py-16 text-white sm:px-6 lg:px-8" : "bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <p className={dark ? "text-xs font-black uppercase tracking-[.16em] text-orange-300" : "text-xs font-black uppercase tracking-[.16em] text-orange-600"}>Delivery & refill search guide</p>
            <h2 className={dark ? "mt-3 max-w-3xl text-3xl font-black tracking-tight text-white" : "mt-3 max-w-3xl text-3xl font-black tracking-tight text-[#0B0B0F]"}>
              {copy.heading}
            </h2>
            <p className={dark ? "mt-4 max-w-3xl text-sm leading-7 text-slate-300" : "mt-4 max-w-3xl text-sm leading-7 text-[#111827]"}>
              Review timing and refill/support terms together before payment. These details describe the current service configuration; they do not promise an exact start time, completion time, retention level, reach or engagement outcome.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <article className={dark ? "rounded-2xl border border-white/10 bg-white/[.035] p-5" : "rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"}>
                <Clock3 className="h-5 w-5 text-orange-500" />
                <p className={dark ? "mt-4 text-[10px] font-black uppercase tracking-[.13em] text-orange-200" : "mt-4 text-[10px] font-black uppercase tracking-[.13em] text-orange-700"}>Current delivery estimate</p>
                <p className={dark ? "mt-2 text-xl font-black text-white" : "mt-2 text-xl font-black text-[#0B0B0F]"}>{deliveryTime}</p>
                <p className={dark ? "mt-2 text-xs leading-6 text-slate-400" : "mt-2 text-xs leading-6 text-[#374151]"}>{copy.delivery}</p>
              </article>

              <article className={dark ? "rounded-2xl border border-white/10 bg-white/[.035] p-5" : "rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"}>
                <RefreshCw className="h-5 w-5 text-orange-500" />
                <p className={dark ? "mt-4 text-[10px] font-black uppercase tracking-[.13em] text-orange-200" : "mt-4 text-[10px] font-black uppercase tracking-[.13em] text-orange-700"}>Current refill/support terms</p>
                <p className={dark ? "mt-2 text-xl font-black text-white" : "mt-2 text-xl font-black text-[#0B0B0F]"}>{refillPolicy}</p>
                <p className={dark ? "mt-2 text-xs leading-6 text-slate-400" : "mt-2 text-xs leading-6 text-[#374151]"}>{copy.refill}</p>
              </article>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={orderHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white">
                Review current order details <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/help-center" className={dark ? "inline-flex min-h-11 items-center rounded-xl border border-white/15 px-5 text-sm font-black text-white" : "inline-flex min-h-11 items-center rounded-xl border border-orange-200 px-5 text-sm font-black text-[#0B0B0F]"}>
                Delivery & support help
              </Link>
            </div>
          </div>

          <aside className={dark ? "rounded-[2rem] border border-white/10 bg-black/20 p-6" : "rounded-[2rem] border border-orange-100 bg-[#FFF8F1] p-6"}>
            <p className={dark ? "text-[10px] font-black uppercase tracking-[.14em] text-slate-400" : "text-[10px] font-black uppercase tracking-[.14em] text-orange-700"}>Keep the order processable</p>
            <div className="mt-5 space-y-4">
              {[
                { icon: Link2, title: "Keep the destination public", text: `Use the correct ${destination} and keep it accessible while the order is processing.` },
                { icon: ShieldCheck, title: "Avoid account-access requests", text: "A public destination is enough for this service. Never send a password, OTP, recovery code or private login." },
                { icon: Clock3, title: "Check the displayed estimate first", text: "If processing exceeds the current estimate, verify the destination is still public and then contact support with the order ID." },
                { icon: RefreshCw, title: "Use refill only when eligible", text: "Refill/support coverage depends on the selected service terms; it is not a blanket lifetime guarantee." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className={dark ? "flex gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4" : "flex gap-3 rounded-2xl border border-orange-100 bg-white p-4"}>
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                  <div>
                    <h3 className={dark ? "text-sm font-black text-white" : "text-sm font-black text-[#0B0B0F]"}>{title}</h3>
                    <p className={dark ? "mt-1 text-xs leading-5 text-slate-400" : "mt-1 text-xs leading-5 text-[#374151]"}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
