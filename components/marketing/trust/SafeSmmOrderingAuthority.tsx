import Link from "next/link";
import { ArrowRight, Eye, Link2, LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";
import { safeSmmOrderingCriteria } from "@/lib/seo/safe-smm-ordering-intent";

const icons = {
  "public-link": Link2,
  credentials: LockKeyhole,
  checkout: ShieldCheck,
  tracking: ReceiptText,
} as const;

export default function SafeSmmOrderingAuthority() {
  return (
    <section className="border-y border-white/[.07] bg-[#0c0f15] px-4 py-16 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="safe-smm-ordering-heading">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Safe social media growth ordering in India</p>
            <h2 id="safe-smm-ordering-heading" className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              What “no password required” should mean before you place an order
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              A useful safety check is based on the order flow, not a marketing badge. SocialRUSH uses the public destination required by the selected service and does not need your social-media password, OTP or recovery code for ordering.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {safeSmmOrderingCriteria.map((item) => {
                const Icon = icons[item.id];
                return (
                  <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
                    <Icon className="h-5 w-5 text-orange-300" />
                    <h3 className="mt-4 text-sm font-black text-white">{item.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-slate-400">{item.description}</p>
                  </article>
                );
              })}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/services" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white">
                Review services <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 bg-white/[.04] px-5 text-sm font-black text-white">
                Compare current pricing
              </Link>
            </div>
          </div>
          <aside className="rounded-[2rem] border border-emerald-300/15 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.13),transparent_38%),#101518] p-6">
            <Eye className="h-6 w-6 text-emerald-300" />
            <p className="mt-5 text-[10px] font-black uppercase tracking-[.15em] text-emerald-200">Verify the flow yourself</p>
            <h3 className="mt-2 text-2xl font-black text-white">Four checks before paying</h3>
            <ol className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
              <li><b className="text-white">1.</b> Confirm the page is on <b className="text-white">getsocialrush.com</b>.</li>
              <li><b className="text-white">2.</b> Check the exact public destination requested by the selected service.</li>
              <li><b className="text-white">3.</b> Review quantity, price, delivery and refill/support details before checkout.</li>
              <li><b className="text-white">4.</b> Track the resulting order from your SocialRUSH account rather than an unofficial message or screenshot.</li>
            </ol>
            <p className="mt-5 text-[11px] leading-5 text-slate-500">
              “No password required” does not mean a platform outcome is guaranteed. Availability, delivery estimates, refill/support terms and platform results can vary by service and conditions.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
