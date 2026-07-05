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
  if (normalized === "paid" || normalized === "completed") return "bg-emerald-500/10 text-emerald-200 ring-emerald-400/25";
  if (normalized === "pending" || normalized === "processing") return "bg-amber-500/10 text-amber-200 ring-amber-400/25";
  if (normalized === "failed" || normalized === "cancelled") return "bg-red-500/10 text-red-200 ring-red-400/25";
  return "bg-orange-500/10 text-orange-200 ring-orange-400/25";
}

export default function BillingDashboardContent({ invoices, payments, invoiceError, walletBalance }: Props) {
  const paidTotal = invoices
    .filter((item) => ["paid", "completed"].includes(item.status.toLowerCase()))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pendingCount = invoices.filter((item) => ["pending", "processing"].includes(item.status.toLowerCase())).length;
  const lastPayment = payments[0]?.amount ?? 0;

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-clip bg-[#050505] px-4 pb-24 pt-5 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[2rem] border border-orange-400/20 bg-[#111111] p-6 shadow-[0_26px_60px_-36px_rgba(255,122,0,.65)] sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-orange-200">
                Finance center
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">Billing & Invoices</h1>
              <p className="mt-2 text-sm leading-7 text-[#D1D5DB]">Review invoices, wallet receipts, and payment references in one premium workspace.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/dashboard/add-funds" className="btn-dashboard-primary px-5 py-2.5 text-sm">
                  Add funds
                </Link>
                <Link href="/dashboard/orders" className="btn-dashboard-secondary px-5 py-2.5 text-sm">
                  View orders
                </Link>
              </div>
            </div>
            <motion.div whileHover={{ y: -4 }} className="rounded-[1.6rem] border border-orange-400/20 bg-[#151515] p-5 shadow-[0_20px_42px_-28px_rgba(255,122,0,.55)]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#9CA3AF]">Billing overview</p>
              <p className="mt-3 text-sm font-semibold text-[#FF9F00]">Last receipt token</p>
              <p className="mt-1 truncate text-xs font-bold text-white">{payments[0]?.provider_payment_id || payments[0]?.id || "No payments yet"}</p>
              <div className="mt-4 rounded-xl border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-xs text-[#D1D5DB]">
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
              className="rounded-3xl border border-orange-400/20 bg-[#111111] p-5 shadow-[0_20px_44px_-30px_rgba(255,122,0,.55)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">{card.label}</p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {card.count ? Number(card.value).toLocaleString("en-IN") : <CurrencyAmount amountINR={Number(card.value)} />}
                  </p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-[0_14px_28px_-18px_rgba(255, 196, 0, .65)]">
                  <card.icon className="h-5 w-5" />
                </span>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-orange-400/20 bg-[#111111] shadow-[0_22px_52px_-34px_rgba(255,122,0,.6)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-400/20 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-black text-white">Invoice history</h2>
              <p className="mt-1 text-xs text-[#9CA3AF]">Status, amount, order references, and issue date</p>
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
                  <thead className="bg-[#0B0B0F] text-orange-200">
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
                      <tr key={item.id} className="border-t border-white/10 text-[#D1D5DB]">
                        <td className="px-6 py-4 font-bold text-orange-200">{item.invoice_number}</td>
                        <td className="px-6 py-4 text-[#D1D5DB]">{new Date(item.created_at).toLocaleDateString("en-IN")}</td>
                        <td className="px-6 py-4 text-[#D1D5DB]">{item.order_id ? `#${item.order_id.slice(0, 8)}` : "-"}</td>
                        <td className="px-6 py-4 font-bold text-white"><CurrencyAmount amountINR={Number(item.amount)} /></td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${badgeStyle(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-orange-400/25 bg-orange-500/10 text-[#FF9F00] transition hover:-translate-y-0.5">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-orange-400/25 bg-orange-500/10 text-[#FF9F00] transition hover:-translate-y-0.5">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!invoices.length && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-sm text-[#9CA3AF]">No invoices issued yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 sm:p-5 lg:hidden">
                {invoices.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-orange-400/20 bg-[#151515] p-4 shadow-[0_14px_30px_-24px_rgba(255,122,0,.55)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-orange-200">{item.invoice_number}</p>
                        <p className="mt-1 text-[11px] text-[#9CA3AF]">{new Date(item.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${badgeStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-white/10 bg-[#0B0B0F] px-3 py-2 text-[#9CA3AF]">
                        Amount
                        <p className="mt-1 font-black text-white"><CurrencyAmount amountINR={Number(item.amount)} /></p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#0B0B0F] px-3 py-2 text-[#9CA3AF]">
                        Order
                        <p className="mt-1 font-black text-white">{item.order_id ? `#${item.order_id.slice(0, 8)}` : "-"}</p>
                      </div>
                    </div>
                  </article>
                ))}
                {!invoices.length && <p className="rounded-xl border border-orange-400/20 bg-[#151515] p-4 text-center text-sm text-[#9CA3AF]">No invoices issued yet.</p>}
              </div>
            </>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-orange-400/20 bg-[#111111] shadow-[0_22px_52px_-34px_rgba(255,122,0,.6)]">
          <div className="border-b border-orange-400/20 px-5 py-4 sm:px-6">
            <h2 className="text-sm font-black text-white">Payment receipts</h2>
          </div>

          <div className="divide-y divide-white/10">
            {payments.map((item) => (
              <div key={item.id} className="grid gap-2 px-5 py-4 text-xs sm:grid-cols-5 sm:gap-3 sm:px-6">
                <span className="text-[#D1D5DB]">{new Date(item.created_at).toLocaleDateString("en-IN")}</span>
                <span className="font-black text-white"><CurrencyAmount amountINR={Number(item.amount)} /></span>
                <span className="capitalize text-[#D1D5DB]">{(item.payment_method || "wallet").replaceAll("_", " ")}</span>
                <span>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${badgeStyle(item.status)}`}>
                    {item.status}
                  </span>
                </span>
                <span className="truncate text-[#9CA3AF]">{item.provider_payment_id || item.id}</span>
              </div>
            ))}
            {!payments.length && <p className="p-8 text-center text-sm text-[#9CA3AF]">No payment receipts yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
