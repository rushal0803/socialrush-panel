"use client";

import { useMemo, useState } from "react";
import { BarChart3, Copy, RotateCcw, ShieldCheck } from "lucide-react";
import { calculateSocialAdMetrics } from "@/lib/tools/social-ad-metrics";

const field =
  "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#090A0F] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#747B89] focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10";

const initial = {
  spend: "",
  impressions: "",
  clicks: "",
  leads: "",
  conversions: "",
};

function n(value: string) {
  return Number(value) || 0;
}

function money(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function percent(value: number | null) {
  return value === null ? "—" : `${value.toFixed(2)}%`;
}

export default function SocialAdMetricsWorkspace() {
  const [values, setValues] = useState(initial);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateSocialAdMetrics({
        spend: n(values.spend),
        impressions: n(values.impressions),
        clicks: n(values.clicks),
        leads: n(values.leads),
        conversions: n(values.conversions),
      }),
    [values],
  );

  const hasPrimaryInput = result.spend > 0 || result.impressions > 0 || result.clicks > 0;
  const update = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const loadExample = () =>
    setValues({
      spend: "25000",
      impressions: "500000",
      clicks: "7500",
      leads: "420",
      conversions: "63",
    });

  async function copyResult() {
    if (!hasPrimaryInput) return;
    const summary = [
      `CPM: ${money(result.cpm)}`,
      `CPC: ${money(result.cpc)}`,
      `CTR: ${percent(result.ctrPercent)}`,
      `Cost per lead: ${money(result.cpl)}`,
      `Cost per conversion: ${money(result.cpa)}`,
    ].join("\n");
    await navigator.clipboard?.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-[1.6rem] border border-orange-400/30 bg-[linear-gradient(145deg,#151923,#0b0d13)] p-5 shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-orange-200">Paid social efficiency</p>
          <h2 className="mt-2 text-2xl font-black text-white">Calculate CPM, CPC and CTR</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Enter metrics from the same campaign and date range. The calculations run entirely in your browser.
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-orange-400/25 bg-orange-400/[.08]">
          <BarChart3 className="h-5 w-5 text-orange-300" />
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-200">
          Ad spend (₹)
          <input className={field} type="number" min="0" inputMode="decimal" value={values.spend} onChange={(e) => update("spend", e.target.value)} placeholder="25000" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Impressions
          <input className={field} type="number" min="0" inputMode="numeric" value={values.impressions} onChange={(e) => update("impressions", e.target.value)} placeholder="500000" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Clicks
          <input className={field} type="number" min="0" inputMode="numeric" value={values.clicks} onChange={(e) => update("clicks", e.target.value)} placeholder="7500" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Leads <span className="font-normal text-slate-500">(optional)</span>
          <input className={field} type="number" min="0" inputMode="numeric" value={values.leads} onChange={(e) => update("leads", e.target.value)} placeholder="420" />
        </label>
        <label className="text-sm font-semibold text-slate-200 sm:col-span-2">
          Conversions / sales <span className="font-normal text-slate-500">(optional)</span>
          <input className={field} type="number" min="0" inputMode="numeric" value={values.conversions} onChange={(e) => update("conversions", e.target.value)} placeholder="63" />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={loadExample} className="btn-secondary min-h-11 px-4 text-sm">Load example</button>
        <button type="button" onClick={() => setValues(initial)} className="btn-secondary min-h-11 gap-2 px-4 text-sm">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        {hasPrimaryInput ? (
          <button type="button" onClick={copyResult} className="btn-secondary min-h-11 gap-2 px-4 text-sm">
            <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy results"}
          </button>
        ) : null}
      </div>

      <div className="mt-7 rounded-2xl border border-orange-400/25 bg-black/25 p-5">
        {hasPrimaryInput ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["CPM · cost per 1,000 impressions", money(result.cpm)],
                ["CPC · cost per click", money(result.cpc)],
                ["CTR · click-through rate", percent(result.ctrPercent)],
                ["Cost per lead", money(result.cpl)],
                ["Cost per conversion", money(result.cpa)],
                ["Click → lead rate", percent(result.clickToLeadRatePercent)],
                ["Lead → conversion rate", percent(result.leadToConversionRatePercent)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[.04] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-emerald-300" />
            <p className="mt-3 font-black text-white">Add campaign data to calculate your ad metrics</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Use spend, impressions and clicks from one reporting window. Leads and conversions are optional.</p>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-slate-400">
        <b className="text-slate-200">Formulas:</b> CPM = Spend ÷ Impressions × 1,000. CPC = Spend ÷ Clicks. CTR = Clicks ÷ Impressions × 100.
        Optional CPL and CPA use the same spend divided by leads or conversions. No benchmark or future result is assumed.
      </div>
    </section>
  );
}
