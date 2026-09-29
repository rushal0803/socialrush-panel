import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { bigPackages } from "@/lib/big-packages";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { getPackageMerchandising, getPackageUnitRate } from "@/lib/package-merchandising";

const platformMap: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  telegram: "Telegram",
  tiktok: "TikTok",
  x: "X",
  twitter: "X",
};

function normalize(value?: string) {
  return String(value || "").trim().toLowerCase();
}

export default function PackageValueGuide({ platform, service }: { platform?: string; service?: string }) {
  const platformLabel = platformMap[normalize(platform)];
  const serviceKey = normalize(service).replace(/^(instagram|youtube|facebook|linkedin|telegram|tiktok|twitter|x)-/, "");
  if (!platformLabel || !serviceKey) return null;

  const packages = bigPackages
    .filter((pkg) => pkg.platform === platformLabel && pkg.service === serviceKey)
    .sort((a, b) => a.quantity - b.quantity);

  const catalogCode = `${platformLabel === "X" ? "x" : platformLabel.toLowerCase()}-${serviceKey}`;
  const catalogService = activeSmmServices.find((item) => item.code === catalogCode);

  if (!packages.length) {
    return (
      <section className="relative px-4 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-[24px] border border-orange-400/25 bg-[#111111] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Live service pricing</p>
            <h2 className="mt-1 text-xl font-black text-white">This service uses live catalog pricing</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {catalogService?.name ?? `${platformLabel} ${serviceKey}`} is available through the standard order flow. Review the current rate, minimum quantity and availability before placing the order.
            </p>
          </div>
          <Link href={`/dashboard/new-order?service=${encodeURIComponent(catalogService?.code ?? catalogCode)}`} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white">
            Check live price <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative px-4 pb-4 sm:px-6 lg:px-8" aria-label="Package value guide">
      <div className="mx-auto w-full max-w-7xl rounded-[24px] border border-orange-400/20 bg-[#111111] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><Sparkles className="h-5 w-5" /></span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Quick value guide</p>
            <h2 className="mt-1 text-xl font-black text-white">Choose by campaign size, not guesswork</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">These labels help compare package sizes. The displayed package price remains the checkout price source — no invented discount is shown.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {packages.slice(0, 4).map((pkg, index) => {
            const merchandising = getPackageMerchandising(pkg, index, Math.min(packages.length, 4));
            const unitRate = getPackageUnitRate(pkg);
            return (
              <Link key={pkg.packageId} href={`/packages?platform=${encodeURIComponent(platform || "")}&service=${encodeURIComponent(service || "")}&package=${encodeURIComponent(pkg.packageId)}`} className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 ${merchandising.featured ? "border-orange-400/50 bg-orange-500/[.08] shadow-[0_18px_38px_-28px_rgba(255,122,0,.9)]" : "border-white/10 bg-white/[.03] hover:border-orange-400/35"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-orange-400/25 bg-orange-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] text-orange-200">{merchandising.badge}</span>
                  {merchandising.featured ? <CheckCircle2 className="h-4 w-4 text-orange-300" /> : null}
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-[.12em] text-slate-500">{merchandising.tier}</p>
                <p className="mt-1 text-lg font-black text-white">{pkg.quantityLabel}</p>
                <p className="mt-1 text-sm font-black text-orange-200">₹{pkg.basePriceINR.toLocaleString("en-IN")}</p>
                {unitRate ? <p className="mt-1 text-xs text-slate-500">₹{Math.round(unitRate).toLocaleString("en-IN")} per 1K</p> : null}
                <p className="mt-3 text-xs leading-5 text-slate-400">{merchandising.benefit}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-200">Select package <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
