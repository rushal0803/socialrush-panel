import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, CreditCard, Landmark, ReceiptText, ShieldCheck, Wallet, XCircle } from "lucide-react";
import CurrencyAmount from "@/components/currency/CurrencyAmount";
import { buildPaymentRecovery, paymentConfidenceSummary, type PaymentConfidenceInput } from "@/lib/payments/confidence";
import { isPaymentMethodEnabled, PAYMENT_METHODS } from "@/lib/payments/methods";

function recoveryTone(tone: "warning"|"danger"|"info") {
  if (tone === "danger") return "border-red-400/20 bg-red-500/[.07] text-red-100";
  if (tone === "warning") return "border-amber-400/20 bg-amber-500/[.07] text-amber-100";
  return "border-sky-400/20 bg-sky-500/[.06] text-sky-100";
}

export default function PaymentConfidencePanel({
  transactions,
  walletBalance,
}: {
  transactions: PaymentConfidenceInput[];
  walletBalance: number;
}) {
  const summary = paymentConfidenceSummary(transactions);
  const recovery = transactions
    .map((item) => ({ item, recovery: buildPaymentRecovery(item) }))
    .filter((entry): entry is { item: PaymentConfidenceInput; recovery: NonNullable<ReturnType<typeof buildPaymentRecovery>> } => Boolean(entry.recovery))
    .slice(0, 4);

  return <section className="mx-auto w-full max-w-[1500px] px-4 pt-5 sm:px-6 lg:px-8">
    <div className="overflow-hidden rounded-[1.6rem] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,153,0,.14),transparent_34%),linear-gradient(135deg,#121317,#0b0c0f)] p-5 text-white sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Payment confidence</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Know exactly what happened to your money.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Completed, pending, failed and refunded transactions are separated clearly. Pending records never mean you should pay twice.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[.035] p-3"><CheckCircle2 className="h-4 w-4 text-emerald-300"/><p className="mt-2 text-xl font-black">{summary.completed}</p><span className="text-[10px] text-slate-400">Completed</span></div>
            <div className="rounded-xl border border-white/10 bg-white/[.035] p-3"><Clock3 className="h-4 w-4 text-amber-300"/><p className="mt-2 text-xl font-black">{summary.pending}</p><span className="text-[10px] text-slate-400">Pending</span></div>
            <div className="rounded-xl border border-white/10 bg-white/[.035] p-3"><XCircle className="h-4 w-4 text-red-300"/><p className="mt-2 text-xl font-black">{summary.failed}</p><span className="text-[10px] text-slate-400">Failed</span></div>
            <div className="rounded-xl border border-white/10 bg-white/[.035] p-3"><ReceiptText className="h-4 w-4 text-sky-300"/><p className="mt-2 text-xl font-black">{summary.refunded}</p><span className="text-[10px] text-slate-400">Refunded</span></div>
          </div>
        </div>
        <aside className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-500">Wallet balance</p><p className="mt-1 text-2xl font-black"><CurrencyAmount amountINR={walletBalance}/></p></div><span className="grid h-11 w-11 place-items-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-300"><Wallet className="h-5 w-5"/></span></div>
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-500">Gateway availability</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/15 bg-emerald-500/[.05] px-3 py-2.5"><span className="flex items-center gap-2 text-xs font-bold"><Wallet className="h-4 w-4 text-emerald-300"/>Wallet balance</span><b className="text-[10px] text-emerald-200">Available</b></div>
              {PAYMENT_METHODS.map((method)=><div key={method.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.025] px-3 py-2.5"><span className="flex items-center gap-2 text-xs font-bold">{method.id==="upi"?<Landmark className="h-4 w-4 text-orange-300"/>:<CreditCard className="h-4 w-4 text-orange-300"/>}{method.label}</span><b className={`text-[10px] ${isPaymentMethodEnabled(method.id)?"text-emerald-200":"text-slate-500"}`}>{isPaymentMethodEnabled(method.id)?"Available":"Gateway unavailable"}</b></div>)}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-slate-500">Manual UPI, bank transfer and USDT funding options are handled from Add Funds and remain separate from disabled gateway methods.</p>
            <Link href="/dashboard/add-funds" className="mt-4 inline-flex min-h-10 items-center rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-xs font-black text-orange-100">Open Add Funds</Link>
          </div>
        </aside>
      </div>

      {recovery.length ? <div className="mt-5 border-t border-white/10 pt-5"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-slate-500"><ShieldCheck className="h-4 w-4 text-orange-300"/>Needs attention</div><div className="mt-3 grid gap-3 lg:grid-cols-2">{recovery.map(({item,recovery})=><article key={item.id} className={`rounded-2xl border p-4 ${recoveryTone(recovery.tone)}`}><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0"/><div className="min-w-0"><h3 className="text-sm font-black">{recovery.title}</h3><p className="mt-1 text-xs leading-5 opacity-80">{recovery.detail}</p><div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-xs font-black"><CurrencyAmount amountINR={item.amount}/></span><Link href={recovery.actionHref} className="text-xs font-black underline underline-offset-4">{recovery.actionLabel}</Link></div></div></div></article>)}</div></div> : null}
    </div>
  </section>;
}
