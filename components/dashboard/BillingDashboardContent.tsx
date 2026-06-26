"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, FileText, Receipt, Wallet, AlertCircle, Download, Eye } from "lucide-react";
import CurrencyAmount from "@/components/currency/CurrencyAmount";

type Invoice = {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
  order_id: string | null;
};

type Payment = {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  provider_payment_id: string | null;
  created_at: string;
};

type Props = {
  invoices: Invoice[];
  payments: Payment[];
  invoiceError?: string;
  walletBalance: number;
};

function badgeStyle(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "paid" || normalized === "completed") return "bg-emerald-100/80 text-emerald-700 ring-emerald-600/20";
  if (normalized === "pending" || normalized === "processing") return "bg-amber-100/80 text-amber-700 ring-amber-600/20";
  if (normalized === "failed" || normalized === "cancelled") return "bg-rose-100/80 text-rose-700 ring-rose-600/20";
  return "bg-blue-100/80 text-blue-700 ring-blue-600/20";
}

export default function BillingDashboardContent({ invoices, payments, invoiceError, walletBalance }: Props) {
  const paidTotal = invoices
    .filter((item) => ["paid", "completed"].includes(item.status.toLowerCase()))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pendingCount = invoices.filter((item) => ["pending", "processing"].includes(item.status.toLowerCase())).length;
  const lastPayment = payments[0]?.amount ?? 0;

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-clip px-4 pb-24 pt-5 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-[0_26px_60px_-36px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-white/85 bg-white/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#4f6aa0]">
                Finance center
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-[#112a5c] sm:text-4xl">Billing & Invoices</h1>
              <p className="mt-2 text-sm leading-7 text-[#5d75a7]">Review invoices, wallet receipts, and payment references in one premium workspace.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/dashboard/add-funds" className="btn-dashboard-primary px-5 py-2.5 text-sm">
                  Add funds
                </Link>
                <Link href="/dashboard/orders" className="btn-dashboard-secondary px-5 py-2.5 text-sm">
                  View orders
                </Link>
              </div>
            </div>
            <motion.div whileHover={{ y: -4 }} className="rounded-[1.6rem] border border-white/80 bg-white/80 p-5 shadow-[0_20px_42px_-28px_rgba(15,23,42,.4)]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#6e85b1]">Billing overview</p>
              <p className="mt-3 text-sm font-semibold text-[#40609a]">Last receipt token</p>
              <p className="mt-1 truncate text-xs font-bold text-[#18356e]">{payments[0]?.provider_payment_id || payments[0]?.id || "No payments yet"}</p>
              <div className="mt-4 rounded-xl border border-[#dce7ff] bg-[#f7faff] px-3 py-2 text-xs text-[#5d76a8]">
                Auto-updated from your transaction history
              </div>
            </motion.div>
          </div>
        </motion.section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total spent", value: paidTotal, icon: Receipt },
            { label: "Wallet balance", value: walletBalance, icon: Wallet },
            { label: "Last payment", value: lastPayment, icon: CreditCard },
            { label: "Pending invoices", value: pendingCount, icon: FileText, count: true },
          ].map((card, index) => (
            <motion.article
              key={card.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-white/85 bg-white/85 p-5 shadow-[0_20px_44px_-30px_rgba(15,23,42,.35)] backdrop-blur-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6f86b2]">{card.label}</p>
                  <p className="mt-3 text-2xl font-black text-[#17366f]">
                    {card.count ? Number(card.value).toLocaleString("en-IN") : <CurrencyAmount amountINR={Number(card.value)} />}
                  </p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-white shadow-[0_14px_28px_-18px_rgba(117,109,255,.65)]">
                  <card.icon className="h-5 w-5" />
                </span>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-white/85 bg-white/90 shadow-[0_22px_52px_-34px_rgba(15,23,42,.4)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eeff] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-black text-[#17366f]">Invoice history</h2>
              <p className="mt-1 text-xs text-[#6f86b2]">Status, amount, order references, and issue date</p>
            </div>
          </div>

          {invoiceError ? (
            <div className="p-6">
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/85 p-4 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>{invoiceError}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[860px] text-left text-xs">
                  <thead className="bg-[#f7faff] text-[#7b92bc]">
                    <tr>
                      {[
                        "Invoice",
                        "Date",
                        "Order",
                        "Amount",
                        "Status",
                        "Actions",
                      ].map((head) => (
                        <th key={head} className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.13em]">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((item) => (
                      <tr key={item.id} className="border-t border-[#ecf2ff]">
                        <td className="px-6 py-4 font-bold text-[#17366f]">{item.invoice_number}</td>
                        <td className="px-6 py-4 text-[#6079ab]">{new Date(item.created_at).toLocaleDateString("en-IN")}</td>
                        <td className="px-6 py-4 text-[#6079ab]">{item.order_id ? `#${item.order_id.slice(0, 8)}` : "-"}</td>
                        <td className="px-6 py-4 font-bold text-[#17366f]"><CurrencyAmount amountINR={Number(item.amount)} /></td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${badgeStyle(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dae6ff] bg-white text-[#4b69a0] transition hover:-translate-y-0.5">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dae6ff] bg-white text-[#4b69a0] transition hover:-translate-y-0.5">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!invoices.length && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-sm text-[#6f86b2]">No invoices issued yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 sm:p-5 lg:hidden">
                {invoices.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-[#e6eeff] bg-white/90 p-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,.3)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-[#16346c]">{item.invoice_number}</p>
                        <p className="mt-1 text-[11px] text-[#6f86b2]">{new Date(item.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${badgeStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-[#f7faff] px-3 py-2 text-[#6079ab]">
                        Amount
                        <p className="mt-1 font-black text-[#17366f]"><CurrencyAmount amountINR={Number(item.amount)} /></p>
                      </div>
                      <div className="rounded-xl bg-[#f7faff] px-3 py-2 text-[#6079ab]">
                        Order
                        <p className="mt-1 font-black text-[#17366f]">{item.order_id ? `#${item.order_id.slice(0, 8)}` : "-"}</p>
                      </div>
                    </div>
                  </article>
                ))}
                {!invoices.length && <p className="rounded-xl bg-[#f7faff] p-4 text-center text-sm text-[#6f86b2]">No invoices issued yet.</p>}
              </div>
            </>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-white/85 bg-white/90 shadow-[0_22px_52px_-34px_rgba(15,23,42,.4)] backdrop-blur-xl">
          <div className="border-b border-[#e5eeff] px-5 py-4 sm:px-6">
            <h2 className="text-sm font-black text-[#17366f]">Payment receipts</h2>
          </div>

          <div className="divide-y divide-[#edf3ff]">
            {payments.map((item) => (
              <div key={item.id} className="grid gap-2 px-5 py-4 text-xs sm:grid-cols-5 sm:gap-3 sm:px-6">
                <span className="text-[#6079ab]">{new Date(item.created_at).toLocaleDateString("en-IN")}</span>
                <span className="font-black text-[#17366f]"><CurrencyAmount amountINR={Number(item.amount)} /></span>
                <span className="capitalize text-[#6079ab]">{(item.payment_method || "wallet").replaceAll("_", " ")}</span>
                <span>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${badgeStyle(item.status)}`}>
                    {item.status}
                  </span>
                </span>
                <span className="truncate text-[#7b92bc]">{item.provider_payment_id || item.id}</span>
              </div>
            ))}
            {!payments.length && <p className="p-8 text-center text-sm text-[#6f86b2]">No payment receipts yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
