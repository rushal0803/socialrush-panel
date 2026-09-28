"use client";

import { useMemo, useState } from "react";
import { BarChart3, RotateCcw, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { calculateYouTubeSubscriberGrowth } from "@/lib/tools/youtube-subscriber-growth";

const field =
  "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#090A0F] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#747B89] focus:border-red-400 focus:ring-4 focus:ring-red-400/10";

const initial = { start: "", end: "", days: "30", target: "" };
const n = (value: string) => Number(value) || 0;
const fmt = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);

export default function YouTubeSubscriberGrowthWorkspace() {
  const [values, setValues] = useState(initial);
  const result = useMemo(() => calculateYouTubeSubscriberGrowth({
    startingSubscribers: n(values.start),
    endingSubscribers: n(values.end),
    days: n(values.days),
    targetSubscribers: n(values.target),
  }), [values]);

  const update = (key: keyof typeof values, value: string) =>
    setValues(current => ({ ...current, [key]: value }));

  return (
    <section className="rounded-[1.6rem] border border-red-400/25 bg-[linear-gradient(145deg,#17141a,#0b0d13)] p-5 shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-red-200">YouTube subscriber planning</p>
          <h2 className="mt-2 text-2xl font-black text-white">Calculate subscriber growth rate</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Compare two subscriber counts from the same channel over a known period. No YouTube account connection is required.
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-red-400/25 bg-red-400/[.08]">
          <BarChart3 className="h-5 w-5 text-red-300" />
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-200">
          Starting subscribers
          <input className={field} type="number" min="1" inputMode="numeric" value={values.start} onChange={e=>update("start",e.target.value)} placeholder="5000" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Current subscribers
          <input className={field} type="number" min="0" inputMode="numeric" value={values.end} onChange={e=>update("end",e.target.value)} placeholder="5600" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Days between counts
          <input className={field} type="number" min="1" inputMode="numeric" value={values.days} onChange={e=>update("days",e.target.value)} placeholder="30" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Subscriber goal <span className="font-normal text-slate-500">(optional)</span>
          <input className={field} type="number" min="0" inputMode="numeric" value={values.target} onChange={e=>update("target",e.target.value)} placeholder="10000" />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={()=>setValues({start:"5000",end:"5600",days:"30",target:"10000"})} className="btn-secondary min-h-11 px-4 text-sm">Load example</button>
        <button type="button" onClick={()=>setValues(initial)} className="btn-secondary min-h-11 gap-2 px-4 text-sm">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <div className="mt-7 rounded-2xl border border-red-400/20 bg-black/25 p-5">
        {result ? <>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.13em] text-red-200">
            <TrendingUp className="h-4 w-4" /> Subscriber growth result
          </div>
          <p className="mt-2 text-5xl font-black tracking-tight text-white">{fmt(result.growthRatePercent)}%</p>
          <p className="mt-2 text-sm text-slate-400">Subscriber growth over the exact period you entered.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Net subscriber change</p>
              <p className="mt-1 text-base font-black text-white">{result.netChange >= 0 ? "+" : ""}{fmt(result.netChange)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Daily pace</p>
              <p className="mt-1 text-base font-black text-white">{result.dailyNetChange >= 0 ? "+" : ""}{fmt(result.dailyNetChange)} / day</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">30-day pace</p>
              <p className="mt-1 text-base font-black text-white">{result.monthlyNetChange >= 0 ? "+" : ""}{fmt(result.monthlyNetChange)} subscribers</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">30-day growth rate</p>
              <p className="mt-1 text-base font-black text-white">{fmt(result.monthlyGrowthRatePercent)}%</p>
            </div>
            {result.remainingToTarget !== null ? <div className="rounded-xl border border-white/10 bg-white/[.04] p-3 sm:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Gap to your goal</p>
              <p className="mt-1 text-base font-black text-white">{fmt(result.remainingToTarget)} subscribers</p>
            </div> : null}
          </div>
          {result.daysToTarget !== null ? <div className="mt-4 rounded-xl border border-red-300/20 bg-red-300/[.06] p-4 text-sm text-red-100">
            <Target className="mr-2 inline h-4 w-4" />
            At the same net daily pace, the entered goal is about <b>{result.daysToTarget} days</b> away. This is simple arithmetic, not a forecast.
          </div> : null}
        </> : <div className="py-4 text-center">
          <ShieldCheck className="mx-auto h-6 w-6 text-emerald-300" />
          <p className="mt-3 font-black text-white">Enter two subscriber counts and a time period</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">Use counts from the same YouTube channel and reporting window.</p>
        </div>}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-slate-400">
        <b className="text-slate-200">Formula:</b> growth rate = (current subscribers − starting subscribers) ÷ starting subscribers × 100.
      </div>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-slate-400">
        YouTube Studio remains the source of truth for your subscriber history. This tool uses only the values you enter and does not predict future channel performance or monetization eligibility.
      </div>
    </section>
  );
}
