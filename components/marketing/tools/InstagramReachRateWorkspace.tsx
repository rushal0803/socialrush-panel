"use client";

import { useMemo, useState } from "react";
import { Eye, RotateCcw, ShieldCheck } from "lucide-react";
import { calculateInstagramReachRate } from "@/lib/tools/instagram-reach-rate";

const field =
  "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#090A0F] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#747B89] focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10";

const initial = { followers: "", reached: "", impressions: "" };
const n = (value: string) => Number(value) || 0;
const fmt = (value: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);

export default function InstagramReachRateWorkspace() {
  const [values, setValues] = useState(initial);
  const result = useMemo(
    () =>
      calculateInstagramReachRate({
        followers: n(values.followers),
        accountsReached: n(values.reached),
        impressions: n(values.impressions),
      }),
    [values],
  );

  const update = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  return (
    <section className="rounded-[1.6rem] border border-pink-400/25 bg-[linear-gradient(145deg,#171522,#0b0d13)] p-5 shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-pink-200">Instagram reach analysis</p>
          <h2 className="mt-2 text-2xl font-black text-white">Calculate Instagram reach rate</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use follower count and accounts reached from the same reporting window. Add impressions only if you want frequency too.
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-pink-400/25 bg-pink-400/[.08]">
          <Eye className="h-5 w-5 text-pink-300" />
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-200">
          Followers
          <input className={field} type="number" min="1" inputMode="numeric" value={values.followers} onChange={(e)=>update("followers",e.target.value)} placeholder="10000" />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          Accounts reached
          <input className={field} type="number" min="1" inputMode="numeric" value={values.reached} onChange={(e)=>update("reached",e.target.value)} placeholder="12500" />
        </label>
        <label className="text-sm font-semibold text-slate-200 sm:col-span-2">
          Impressions <span className="font-normal text-slate-500">(optional)</span>
          <input className={field} type="number" min="0" inputMode="numeric" value={values.impressions} onChange={(e)=>update("impressions",e.target.value)} placeholder="18000" />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={()=>setValues({followers:"10000",reached:"12500",impressions:"18000"})} className="btn-secondary min-h-11 px-4 text-sm">Load example</button>
        <button type="button" onClick={()=>setValues(initial)} className="btn-secondary min-h-11 gap-2 px-4 text-sm"><RotateCcw className="h-4 w-4" /> Reset</button>
      </div>

      <div className="mt-7 rounded-2xl border border-pink-400/20 bg-black/25 p-5">
        {result ? (
          <>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.13em] text-pink-200"><Eye className="h-4 w-4" /> Reach result</div>
            <p className="mt-2 text-5xl font-black tracking-tight text-white">{fmt(result.reachRatePercent)}%</p>
            <p className="mt-2 text-sm text-slate-400">Accounts reached as a percentage of the follower count you entered.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Accounts reached</p><p className="mt-1 text-base font-black text-white">{fmt(result.accountsReached)}</p></div>
              <div className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Followers</p><p className="mt-1 text-base font-black text-white">{fmt(result.followers)}</p></div>
              {result.impressionsPerReachedAccount !== null ? <div className="rounded-xl border border-white/10 bg-white/[.04] p-3 sm:col-span-2"><p className="text-[10px] font-black uppercase tracking-[.1em] text-slate-500">Impressions per reached account</p><p className="mt-1 text-base font-black text-white">{fmt(result.impressionsPerReachedAccount)}×</p></div> : null}
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-emerald-300" />
            <p className="mt-3 font-black text-white">Enter followers and accounts reached</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Use values from the same Instagram Insights reporting period.</p>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-slate-400">
        <b className="text-slate-200">Formula:</b> reach rate = accounts reached ÷ followers × 100.
      </div>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs leading-6 text-slate-400">
        Instagram Insights remains the source of truth. Reach does not tell this calculator how many reached accounts were followers versus non-followers, so it does not invent that split.
      </div>
    </section>
  );
}
