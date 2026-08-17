"use client";

import Link from "next/link";
import { Check, Copy, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

const input = "mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-[#090A0F] px-3 text-white outline-none focus:border-orange-400";

export function GrowthBudgetWorkspace() {
  const [values, setValues] = useState({ content: "", promotion: "", tools: "", support: "", months: "1" });
  const total = useMemo(() => Object.entries(values).filter(([key]) => key !== "months").reduce((sum, [, value]) => sum + Math.max(0, Number(value) || 0), 0), [values]);
  const months = Math.max(1, Number(values.months) || 1);
  const update = (key: keyof typeof values, value: string) => setValues(current => ({ ...current, [key]: value }));
  const reset = () => setValues({ content: "", promotion: "", tools: "", support: "", months: "1" });
  return <section className="rounded-[1.5rem] border border-orange-400/30 bg-[#111522] p-5 sm:p-7">
    <p className="text-xs font-black tracking-[.15em] text-orange-200">PLANNING WORKSPACE</p>
    <h2 className="mt-2 text-2xl">Estimate a creator growth budget</h2>
    <p className="mt-2 text-sm leading-6 text-slate-400">Enter your own planned amounts. SocialRUSH does not supply market-price estimates in this calculator.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">{[["content", "Content production"], ["promotion", "Paid promotion"], ["tools", "Software and tools"], ["support", "Optional growth support"]].map(([key, label]) => <label key={key} className="text-sm font-bold text-slate-200">{label}<input className={input} type="number" min="0" inputMode="decimal" value={values[key as keyof typeof values]} onChange={event => update(key as keyof typeof values, event.target.value)} placeholder="₹0" /></label>)}</div>
    <label className="mt-4 block text-sm font-bold text-slate-200">Planning period (months)<input className={input} type="number" min="1" inputMode="numeric" value={values.months} onChange={event => update("months", event.target.value)} /></label>
    <div className="mt-5 rounded-2xl border border-orange-300/25 bg-orange-400/[.08] p-5"><p className="text-sm text-orange-100">Planned total</p><p aria-live="polite" className="mt-1 text-4xl font-black text-orange-200">₹{total.toLocaleString("en-IN")}</p><p className="mt-2 text-sm text-slate-300">₹{Math.round(total / months).toLocaleString("en-IN")} per month across {months} month{months === 1 ? "" : "s"}.</p></div>
    <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={reset} className="btn-secondary min-h-11 gap-2 px-4"><RotateCcw className="h-4 w-4" /> Reset</button><button type="button" onClick={() => navigator.clipboard?.writeText(`Creator growth budget: ₹${total.toLocaleString("en-IN")} over ${months} month(s).`)} className="btn-secondary min-h-11 gap-2 px-4"><Copy className="h-4 w-4" /> Copy summary</button></div>
  </section>;
}

export function CreatorChecklistWorkspace() {
  const items = ["Profile clearly explains who it helps", "A realistic weekly content rhythm is scheduled", "Recent posts have one clear next step", "Campaign links include UTM parameters", "Baseline analytics are saved", "Budget and success measures are written down", "Public URLs are checked before any order", "No password, OTP, or recovery code is shared"];
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const completed = checked.filter(Boolean).length;
  return <section className="rounded-[1.5rem] border border-emerald-300/25 bg-[#111522] p-5 sm:p-7"><p className="text-xs font-black tracking-[.15em] text-emerald-300">INTERACTIVE CHECKLIST</p><h2 className="mt-2 text-2xl">Prepare a campaign with confidence</h2><p className="mt-2 text-sm leading-6 text-slate-400">A practical pre-flight list for organic publishing, promotion, measurement, and account safety.</p><div className="mt-5 rounded-xl bg-white/[.05] p-3 text-sm font-bold text-emerald-200">{completed} of {items.length} checks complete</div><div className="mt-4 space-y-2">{items.map((item, index) => <label key={item} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-sm text-slate-200"><input type="checkbox" checked={checked[index]} onChange={() => setChecked(current => current.map((value, itemIndex) => itemIndex === index ? !value : value))} className="mt-0.5 h-4 w-4 accent-orange-400" /><span>{item}</span></label>)}</div><div className="mt-5 flex flex-wrap gap-3"><button type="button" className="btn-secondary min-h-11 gap-2 px-4" onClick={() => setChecked(items.map(() => false))}><RotateCcw className="h-4 w-4" /> Clear checklist</button><Link href="/tools/utm-link-builder" className="btn-primary min-h-11">Build campaign links</Link></div><p className="mt-5 text-xs leading-5 text-slate-400"><Check className="mr-1 inline h-4 w-4 text-emerald-300" /> This checklist is educational planning guidance, not a guarantee of reach, revenue, rankings, or platform outcomes.</p></section>;
}
