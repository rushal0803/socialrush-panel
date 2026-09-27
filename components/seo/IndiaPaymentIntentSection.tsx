import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Coins, Smartphone } from "lucide-react";
import { indiaCheckoutMethods } from "@/lib/seo/payment-intent";

const icons = {
  upi: Smartphone,
  bank_transfer: Building2,
  usdt_trc20: Coins,
};

export default function IndiaPaymentIntentSection({
  serviceName,
  destination,
  orderHref,
  tone = "dark",
}: {
  serviceName: string;
  destination: string;
  orderHref: string;
  tone?: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <section className={dark ? "border-y border-white/10 bg-[#0d0f14] px-4 py-14 text-white sm:px-6 lg:px-8" : "bg-white/70 px-4 py-16 sm:px-6 lg:px-8"}>
      <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
        <div>
          <p className={dark ? "text-xs font-black uppercase tracking-[.16em] text-orange-300" : "text-xs font-black uppercase tracking-[.16em] text-orange-600"}>UPI payment in India</p>
          <h2 className={dark ? "mt-3 text-3xl font-black tracking-tight text-white" : "mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]"}>
            Buy {serviceName} with UPI — no social password required
          </h2>
          <p className={dark ? "mt-4 max-w-3xl text-sm leading-7 text-slate-300" : "mt-4 max-w-3xl text-sm leading-7 text-[#111827]"}>
            Choose your quantity first, review the exact INR total, then continue to SocialRUSH checkout. UPI is available alongside other supported payment methods. Delivery still uses only the required {destination}; never submit a social-media password, OTP or recovery code.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={orderHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white">
              Review order & payment <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/blog/instagram-followers-upi-payment-guide-india" className={dark ? "inline-flex min-h-11 items-center rounded-xl border border-white/15 px-5 text-sm font-black text-white" : "inline-flex min-h-11 items-center rounded-xl border border-orange-200 px-5 text-sm font-black text-[#0B0B0F]"}>
              Read UPI payment guide
            </Link>
          </div>
          <p className={dark ? "mt-4 text-[11px] leading-5 text-slate-500" : "mt-4 text-[11px] leading-5 text-[#374151]"}>
            The UPI guide uses Instagram as the example flow. Your selected service, quantity, exact total, payment methods and verification instructions shown at checkout remain authoritative.
          </p>
        </div>
        <aside className={dark ? "rounded-[2rem] border border-white/10 bg-white/[.035] p-5 sm:p-6" : "rounded-[2rem] border border-orange-100 bg-[#FFF8F1] p-5 sm:p-6"}>
          <p className={dark ? "text-[10px] font-black uppercase tracking-[.14em] text-slate-400" : "text-[10px] font-black uppercase tracking-[.14em] text-orange-700"}>Current direct-checkout options</p>
          <div className="mt-4 space-y-3">
            {indiaCheckoutMethods.map((method) => {
              const Icon = icons[method.id];
              return (
                <div key={method.id} className={dark ? "flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4" : "flex gap-3 rounded-2xl border border-orange-100 bg-white p-4"}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500"><Icon className="h-5 w-5" /></span>
                  <div>
                    <h3 className={dark ? "text-sm font-black text-white" : "text-sm font-black text-[#0B0B0F]"}>{method.label}</h3>
                    <p className={dark ? "mt-1 text-xs leading-5 text-slate-400" : "mt-1 text-xs leading-5 text-[#374151]"}>{method.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className={dark ? "mt-4 flex gap-2 text-xs leading-5 text-emerald-200" : "mt-4 flex gap-2 text-xs leading-5 text-emerald-700"}>
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> Pay only the exact amount shown in your active checkout session and keep the transaction reference for verification.
          </p>
        </aside>
      </div>
    </section>
  );
}
