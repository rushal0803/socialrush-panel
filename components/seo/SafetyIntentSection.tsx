import Link from "next/link";
import { AlertTriangle, ArrowRight, ExternalLink, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { buildSafetyIntentCopy, safetyPolicyFor, type SafetyIntentPlatform } from "@/lib/seo/safety-intent";

export default function SafetyIntentSection({
  serviceName,
  platform,
  destination,
  guideHref,
  orderHref,
  tone = "dark",
}: {
  serviceName: string;
  platform: SafetyIntentPlatform;
  destination: string;
  guideHref: string;
  orderHref: string;
  tone?: "dark" | "light";
}) {
  const dark = tone === "dark";
  const copy = buildSafetyIntentCopy({ serviceName, platform, destination });
  const policy = safetyPolicyFor(platform);
  const cards = [
    { icon: KeyRound, ...copy.checks[0] },
    { icon: ShieldCheck, ...copy.checks[1] },
    { icon: RefreshCw, ...copy.checks[2] },
    { icon: AlertTriangle, ...copy.checks[3] },
  ];

  return (
    <section className={dark ? "border-y border-white/10 bg-[#0b0d12] px-4 py-16 text-white sm:px-6 lg:px-8" : "bg-white/70 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_.98fr] lg:items-start">
          <div>
            <p className={dark ? "text-xs font-black uppercase tracking-[.16em] text-orange-300" : "text-xs font-black uppercase tracking-[.16em] text-orange-600"}>
              Safety, password & policy intent
            </p>
            <h2 className={dark ? "mt-3 text-3xl font-black tracking-tight text-white" : "mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]"}>
              {copy.heading}
            </h2>
            <p className={dark ? "mt-4 max-w-3xl text-sm leading-7 text-slate-300" : "mt-4 max-w-3xl text-sm leading-7 text-[#111827]"}>
              {copy.intro}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={guideHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white">
                Read the full safety guide <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={orderHref} className={dark ? "inline-flex min-h-11 items-center rounded-xl border border-white/15 px-5 text-sm font-black text-white" : "inline-flex min-h-11 items-center rounded-xl border border-orange-200 px-5 text-sm font-black text-[#0B0B0F]"}>
                Review current order details
              </Link>
            </div>
            <p className={dark ? "mt-4 text-[11px] leading-5 text-slate-500" : "mt-4 text-[11px] leading-5 text-[#4B5563]"}>
              This section is risk information, not a guarantee that any third-party growth method is permitted, permanent, or consequence-free.
            </p>
          </div>

          <aside className={dark ? "rounded-[2rem] border border-white/10 bg-white/[.035] p-5 sm:p-6" : "rounded-[2rem] border border-orange-100 bg-[#FFF8F1] p-5 sm:p-6"}>
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map(({ icon: Icon, title, body }) => (
                <article key={title} className={dark ? "rounded-2xl border border-white/10 bg-black/20 p-4" : "rounded-2xl border border-orange-100 bg-white p-4"}>
                  <Icon className="h-5 w-5 text-orange-500" />
                  <h3 className={dark ? "mt-3 text-sm font-black text-white" : "mt-3 text-sm font-black text-[#0B0B0F]"}>{title}</h3>
                  <p className={dark ? "mt-2 text-xs leading-5 text-slate-400" : "mt-2 text-xs leading-5 text-[#374151]"}>{body}</p>
                </article>
              ))}
            </div>
            <a
              href={policy.href}
              target="_blank"
              rel="noopener noreferrer"
              className={dark ? "mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-xs font-black text-white" : "mt-4 flex items-center justify-between rounded-xl border border-orange-100 bg-white px-4 py-3 text-xs font-black text-[#0B0B0F]"}
            >
              Read current {policy.label}
              <ExternalLink className="h-3.5 w-3.5 text-orange-500" />
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
