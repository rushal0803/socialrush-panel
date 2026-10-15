"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import DashboardDialog from "@/components/dashboard/DashboardDialog";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { paymentMethodLabel } from "@/lib/payments/methods";
import type { WalletTransaction } from "./WalletDashboard";

export default function WalletTransactionDialog({ item, onClose }: { item: WalletTransaction; onClose: () => void }) {
  const { currency, rates } = usePreferredCurrency("INR");
  const [copyStatus, setCopyStatus] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => onClose(), [onClose]);
  const money = formatCurrency(item.amount, currency, rates);
  const rows = [
    ["Transaction ID", item.id],
    ["Payment reference", item.provider_payment_id || item.provider_order_id || item.provider_refund_id || "Not available"],
    ["Payment method", paymentMethodLabel(item.payment_method || item.type)],
    ["Type", item.type],
    ["Amount", `${item.type === "debit" ? "−" : "+"}${money}`],
    ["Wallet impact", item.status === "completed" ? `${item.type === "debit" ? "Debit" : "Credit"} ${money}` : "No completed wallet impact"],
    ["Status", item.status],
    ["Related order", String(item.metadata?.order_id || "Not linked")],
    ["Created", new Date(item.created_at).toLocaleString("en-IN")],
    ["Description", item.description || "Not provided"],
  ];
  return <DashboardDialog open label="Transaction Details" onClose={close} initialFocusRef={closeRef}>
    <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
      <h2 className="text-xl font-semibold text-white">Transaction Details</h2>
      <button ref={closeRef} type="button" aria-label="Close transaction details" onClick={close} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 text-white">×</button>
    </div>
    <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5">
      <dl className="space-y-2 text-xs">{rows.map(([label, value]) => <div key={label} className="flex min-w-0 justify-between gap-4 rounded-xl bg-[#0b0e14] p-3"><dt className="text-slate-400">{label}</dt><dd className="min-w-0 break-all text-right font-semibold text-white">{value}</dd></div>)}</dl>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(item.id); setCopyStatus("Transaction ID copied."); } catch { setCopyStatus("Copy is unavailable. Select the transaction ID above."); } }} className="min-h-11 rounded-xl border border-white/15 px-3 text-xs font-semibold text-white">Copy Transaction ID</button>
        <Link href={`/dashboard/support?category=payment_or_wallet&transaction=${encodeURIComponent(item.id)}&payment=${encodeURIComponent(item.provider_payment_id || item.provider_order_id || "")}&status=${encodeURIComponent(item.status)}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 px-3 text-xs font-semibold text-black">Get Payment Help</Link>
      </div>
      <p role="status" className="mt-2 text-xs text-slate-300">{copyStatus}</p>
      <p className="mt-4 text-xs leading-5 text-amber-200">Never share your card PIN, CVV, OTP, UPI PIN, password or full banking credentials.</p>
    </div>
  </DashboardDialog>;
}
