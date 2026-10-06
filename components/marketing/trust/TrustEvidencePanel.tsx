import Link from "next/link";
import {
  BadgeIndianRupee,
  FileCheck2,
  Headphones,
  Link2,
  MessageSquareQuote,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { getPublicReviews } from "@/lib/reviews/public";
import { buildPublicTrustEvidence, type TrustEvidenceKind } from "@/lib/trust/trust-engine";

const iconByKind = {
  ordering: Link2,
  pricing: BadgeIndianRupee,
  tracking: ReceiptText,
  refill: RefreshCw,
  support: Headphones,
  policy: FileCheck2,
  review: MessageSquareQuote,
} satisfies Record<TrustEvidenceKind, typeof ShieldCheck>;

export default async function TrustEvidencePanel({
  tone = "dark",
  compact = false,
}: {
  tone?: "dark" | "light";
  compact?: boolean;
}) {
  const reviews = await getPublicReviews(1);
  const evidence = buildPublicTrustEvidence({
    hasPermissionedCompletedOrderReviews: reviews.length > 0,
  });

  const light = tone === "light";
  const sectionClass = light
    ? "border-y border-orange-100 bg-white/70 px-4 py-12 sm:px-6 lg:px-8"
    : "border-y border-white/[.07] bg-[#0A0C11] px-4 py-14 sm:px-6 lg:px-8";
  const cardClass = light
    ? "rounded-2xl border border-orange-100 bg-white p-5 shadow-[0_16px_40px_-34px_rgba(255,159,0,.45)]"
    : "rounded-2xl border border-white/10 bg-[#101219] p-5";
  const titleClass = light ? "text-[#0B0B0F]" : "text-white";
  const copyClass = light ? "text-[#4B5563]" : "text-slate-300";
  const eyebrowClass = light ? "text-orange-600" : "text-orange-300";

  return (
    <section className={sectionClass} aria-labelledby="trust-evidence-heading" data-trust-engine>
      <div className="mx-auto max-w-7xl">
        <div className={compact ? "max-w-3xl" : "max-w-4xl"}>
          <p className={`text-[10px] font-black uppercase tracking-[.18em] ${eyebrowClass}`}>Proof before claims</p>
          <h2 id="trust-evidence-heading" className={`mt-3 text-2xl font-black tracking-[-.03em] sm:text-3xl ${titleClass}`}>
            Trust signals tied to real product and policy behavior.
          </h2>
          <p className={`mt-3 text-sm leading-7 ${copyClass}`}>
            SocialRUSH only surfaces trust evidence that can be tied to the live ordering flow, customer account records, published policies, or permissioned completed-order reviews.
          </p>
        </div>

        <div className={`mt-7 grid gap-3 sm:grid-cols-2 ${compact ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"}`}>
          {evidence.map((item) => {
            const Icon = iconByKind[item.kind];
            return (
              <Link
                key={item.id}
                href={item.href}
                data-trust-evidence-id={item.id}
                className={`${cardClass} group transition hover:-translate-y-0.5`}
              >
                <Icon className="h-5 w-5 text-orange-500" aria-hidden="true" />
                <h3 className={`mt-4 text-sm font-black ${titleClass}`}>{item.title}</h3>
                <p className={`mt-2 text-xs leading-6 ${copyClass}`}>{item.detail}</p>
                <p className={`mt-3 text-[11px] leading-5 ${light ? "text-[#6B7280]" : "text-slate-500"}`}>{item.evidence}</p>
              </Link>
            );
          })}
        </div>

        <div className={`mt-6 flex flex-wrap items-center gap-3 rounded-2xl border p-4 text-xs leading-6 ${light ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-emerald-300/15 bg-emerald-400/[.06] text-emerald-100"}`}>
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
          No password, OTP or recovery code should be shared for a public-link order. Platform outcomes, sales, ranking and virality are not guaranteed.
        </div>
      </div>
    </section>
  );
}
