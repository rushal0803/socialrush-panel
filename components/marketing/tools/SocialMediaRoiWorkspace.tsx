"use client";

import { useMemo, useState } from "react";
import { Calculator, Copy, RotateCcw, ShieldCheck, TrendingUp } from "lucide-react";
import { calculateSocialMediaRoi } from "@/lib/tools/social-media-roi";

const field =
  "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#090A0F] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#747B89] focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10";

const initial = {
  revenue: "",
  grossMarginPercent: "",
  adSpend: "",
  contentCost: "",
  toolsCost: "",
  laborCost: "",
  otherCost: "",
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
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SocialMediaRoiWorkspace() {
  const [values, setValues] = useState(initial);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateSocialMediaRoi({
        revenue: n(values.revenue),
        grossMarginPercent: n(values.grossMarginPercent),
        adSpend: n(values.adSpend),
        contentCost: n(values.contentCost),
        toolsCost: n(values.toolsCost),
        laborCost: n(values.laborCost),
        otherCost: n(values.otherCost),
        leads: n(values.leads),
        conversions: n(values.conversions),
      }),
    [values],
  );

  const update = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const loadExample = () =>
    setValues({
      revenue: "120000",
      grossMarginPercent: "60",
      adSpend: "25000",
      contentCost: "12000",
      toolsCost: "3000",
      laborCost: "15000",
      otherCost: "0",
      leads: "180",
      conversions: "24",
    });

  async function copyResult() {
    if (!result) return;
    const summary = [
      `Social media ROI: ${result.roiPercent.toFixed(2)}%`,
      `Total investment: ${money(result.totalInvestment)}`,
      `Gross profit before campaign cost: ${money(result.grossProfitBeforeCampaignCost)}`,
      `Contribution after listed costs: ${money(result.contributionAfterListedCosts)}`,
      `Break-even revenue: ${money(result.breakEvenRevenue)}`,
    ].join("\n");
    await navigator.clipboard?.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-[1.6rem] border border-orange-400/30 bg-[linear-gradient(145deg,#151923,#0b0d13)] p-5 shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-orange-200">Campaign economics</p>
          <h2 className="mt-2 text-2xl font-black text-white">Calculate social media ROI</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use revenue, gross margin and the costs you actually paid. Nothing is sent to SocialRUSH.
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-orange-400/25 bg-orange-400/[.08]">
          <Calculator className="h-5 w-5 text-orange-300" />
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-200">
          Revenue attributed to social (₹)
          <input className={field} type="number" min="0" inputMode="decimal" value={values.revenue} onChange={(e) => update("revenue", e.target.value)} placeholder="120000" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Gross margin (%)
          <input className={field} type="number" min="0" max="100" inputMode="decimal" value={values.grossMarginPercent} onChange={(e) => update("grossMarginPercent", e.target.value)} placeholder="60" />
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-black text-white">Monthly campaign costs</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            ["adSpend", "Ad spend"],
            ["contentCost", "Content / creative"],
            ["toolsCost", "Tools / software"],
            ["laborCost", "Labor / agency fees"],
            ["otherCost", "Other campaign costs"],
          ].map(([key, label]) => (
            <label key={key} className="text-sm font-semibold text-slate-200">
              {label} (₹)
              <input className={field} type="number" min="0" inputMode="decimal" value={values[key as keyof typeof values]} onChange={(e) => update(key as keyof typeof values, e.target.value)} placeholder="0" />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-200">
          Leads <span className="font-normal text-slate-500">(optional)</span>
          <input className={field} type="number" min="0" inputMode="numeric" value={values.leads} onChange={(e) => update("leads", e.target.value)} placeholder="180" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Conversions / sales <span className="font-normal text-slate-500">(optional)</span>
          <input className={field} type="number" min="0" inputMode="numeric" value={values.conversions} onChange={(e) => update("conversions", e.target.value)} placeholder="24" />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={loadExample} className="btn-secondary min-h-11 px-4 text-sm">Load example</button>
        <button type="button" onClick={() => setValues(initial)} className="btn-secondary min-h-11 gap-2 px-4 text-sm">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        {result ? (
          <button type="button" onClick={copyResult} className="btn-secondary min-h-11 gap-2 px-4 text-sm">
            <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy results"}
          </button>
        ) : null}
      </div>

      <div className="mt-7 rounded-2xl border border-orange-400/25 bg-black/25 p-5">
        {result ? (
          <>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.13em] text-orange-200">
              <TrendingUp className="h-4 w-4" /> ROI result
            </div>
            <p className="mt-2 text-5xl font-black tracking-tight text-white">{result.roiPercent.toFixed(1)}%</p>
            <p className="mt-2 text-sm text-slate-400">
              Gross-profit ROI after the costs you listed. This is an estimate, not a guarantee of campaign performance.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Total investment", money(result.totalInvestment)],
                ["Gross profit before campaign cost", money(result.grossProfitBeforeCampaignCost)],
                ["Contribution after listed costs", money(result.contributionAfterListedCosts)],
                ["Break-even revenue", money(result.breakEvenRevenue)],
                ["Return multiple", `${result.returnMultiple.toFixed(2)}×`],
                ["Revenue ROAS (ads only)", result.revenueRoas === null ? "—" : `${result.revenueRoas.toFixed(2)}×`],
                ["Cost per lead", money(result.costPerLead)],
                ["Cost per conversion", money(result.costPerConversion)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[.04] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">{label}</p>
                  <p className="mt-1 text-base font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-emerald-300" />
            <p className="mt-3 font-black text-white">Add a gross margin and at least one campaign cost</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Revenue can be zero. The calculator needs a positive cost and margin to produce a meaningful ROI denominator.</p>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-slate-400">
        <b className="text-slate-200">Formula:</b> ROI = (Revenue × Gross Margin − Total Listed Costs) ÷ Total Listed Costs × 100.
        Gross margin helps avoid treating all revenue as profit.
      </div>
    </section>
  );
}
