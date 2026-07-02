"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, CircleDollarSign, CreditCard, Headset, Layers3, LineChart, Plus, ShoppingBag, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

type OverviewStats = {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  walletBalance: number;
  totalSpend: number;
  supportTickets: number;
};

type DashboardTransaction = {
  id: string;
  amount: number;
  type: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
};

type DashboardOrder = {
  id: string;
  serviceName: string;
  quantity: number;
  status: string;
  price: number;
  createdAt: string;
};

type DashboardOverviewProps = {
  userName: string;
  stats: OverviewStats;
  transactions: DashboardTransaction[];
  orders: DashboardOrder[];
  monthlySpend: Array<{ month: string; value: number }>;
  serviceUsage: Array<{ name: string; count: number }>;
};

const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const statusProgress: Record<string, number> = {
  pending: 26,
  processing: 62,
  in_progress: 72,
  completed: 100,
  partial: 80,
  cancelled: 100,
  refunded: 100,
  failed: 100,
};

const statusTone: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-orange-50 text-orange-700 border-orange-200",
  in_progress: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
  refunded: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function DashboardOverviewContent({
  userName,
  stats,
  transactions,
  orders,
  monthlySpend,
  serviceUsage,
}: DashboardOverviewProps) {
  const { currency } = usePreferredCurrency("INR");
  const money = (value: number) => formatCurrency(value, currency);

  const overviewCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString("en-IN"),
      icon: ShoppingBag,
      chip: "All-time",
    },
    {
      title: "Active Orders",
      value: stats.activeOrders.toLocaleString("en-IN"),
      icon: Layers3,
      chip: "Live",
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders.toLocaleString("en-IN"),
      icon: Bell,
      chip: "Delivered",
    },
    {
      title: "Wallet Balance",
      value: money(stats.walletBalance),
      icon: Wallet,
      chip: "Available",
    },
    {
      title: "Total Spend",
      value: money(stats.totalSpend),
      icon: CircleDollarSign,
      chip: "Campaigns",
    },
    {
      title: "Support Tickets",
      value: stats.supportTickets.toLocaleString("en-IN"),
      icon: Headset,
      chip: "Open + closed",
    },
  ] as const;

  const maxSpend = Math.max(1, ...monthlySpend.map((item) => item.value));
  const maxService = Math.max(1, ...serviceUsage.map((item) => item.count));

  return (
    <main className="relative mx-auto max-w-[1700px] px-5 pb-8 pt-6 sm:px-8 sm:pt-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-amber-200/45 blur-3xl" />
      </div>

      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#111827]">Dashboard overview</p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#0B0B0F]">Welcome back, {userName}</h1>
            <p className="mt-2 text-sm text-[#111827]">Your growth workspace now follows the same SocialRUSH homepage design system.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/dashboard/new-order" className="btn-dashboard-primary px-4 py-2.5 text-xs">
              <Plus className="mr-1.5 h-4 w-4" />
              Add New Order
            </Link>
            <Link href="/dashboard/wallet" className="btn-dashboard-secondary px-4 py-2.5 text-xs">
              <CreditCard className="mr-1.5 h-4 w-4" />
              Add Funds
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.article
              key={card.title}
              variants={cardAnim}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              className="dashboard-glass p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#111827]">{card.title}</p>
                  <p className="mt-2 text-2xl font-black text-[#0B0B0F]">{card.value}</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-[0_10px_22px_rgba(255, 196, 0, .35)]">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 inline-flex rounded-full border border-[#FFF3E0] bg-[#FFF8F1] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#111827]">
                {card.chip}
              </p>
            </motion.article>
          );
        })}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="dashboard-glass p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#111827]">Wallet</p>
              <h2 className="mt-2 text-xl font-black text-[#0B0B0F]">Razorpay / UPI Payment UI</h2>
            </div>
            <Link href="/dashboard/add-funds" className="btn-dashboard-primary px-4 py-2.5 text-xs">
              Add Funds
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Razorpay", "UPI", "Wallet Credit"].map((item) => (
              <div key={item} className="rounded-2xl border border-[#FFF3E0] bg-[#FFF8F1] p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#111827]">{item}</p>
                <p className="mt-2 text-sm font-semibold text-[#0B0B0F]">Secure checkout ready</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <h3 className="text-sm font-bold text-[#0B0B0F]">Recent Transactions</h3>
            {transactions.length ? (
              transactions.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#FFF8F1] bg-white/85 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold capitalize text-[#0B0B0F]">{item.type.replaceAll("_", " ")} • {item.paymentMethod}</p>
                    <p className="mt-1 text-[11px] text-[#111827]">{new Date(item.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#0B0B0F]">{money(item.amount)}</p>
                    <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusTone[item.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                      {titleCase(item.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-[#FFF3E0] bg-[#FFF8F1] p-4 text-xs text-[#111827]">No transactions yet.</p>
            )}
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="dashboard-glass p-5 sm:p-6"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#111827]">Analytics</p>
          <h2 className="mt-2 text-xl font-black text-[#0B0B0F]">Growth & Spend</h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-2xl border border-[#FFF3E0] bg-[#FFF8F1] p-4">
              <p className="text-xs text-[#111827]">Growth score</p>
              <p className="mt-1 text-2xl font-black text-[#0B0B0F]">+18.6%</p>
            </div>
            <div className="rounded-2xl border border-[#FFF3E0] bg-[#FFF8F1] p-4">
              <p className="text-xs text-[#111827]">Monthly spend</p>
              <p className="mt-1 text-2xl font-black text-[#0B0B0F]">{money(monthlySpend.reduce((sum, item) => sum + item.value, 0))}</p>
            </div>
            <div className="rounded-2xl border border-[#FFF3E0] bg-[#FFF8F1] p-4">
              <p className="text-xs text-[#111827]">Service usage</p>
              <p className="mt-1 text-2xl font-black text-[#0B0B0F]">{serviceUsage.length}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#111827]">Monthly Spend Chart</p>
            {monthlySpend.map((item) => (
              <div key={item.month} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#111827]">
                  <span>{item.month}</span>
                  <span>{money(item.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-[#FFF8F1]">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FFB000]"
                    style={{ width: `${Math.max(8, Math.round((item.value / maxSpend) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.article>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="dashboard-glass overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[#FFF8F1] px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#111827]">Orders</p>
              <h2 className="mt-1 text-lg font-black text-[#0B0B0F]">Order History</h2>
            </div>
            <Link href="/dashboard/new-order" className="btn-dashboard-secondary px-3.5 py-2 text-xs">
              New Order
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-[#FFF8F1] text-[10px] uppercase tracking-[0.1em] text-[#111827]">
                <tr>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-5 py-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFF8F1]">
                {orders.length ? (
                  orders.map((item) => {
                    const progress = statusProgress[item.status] ?? 28;
                    return (
                      <tr key={item.id}>
                        <td className="px-5 py-3.5 font-semibold text-[#0B0B0F]">{item.serviceName}</td>
                        <td className="px-4 py-3.5 text-[#FF9F00]">{item.quantity.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusTone[item.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                            {titleCase(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#0B0B0F]">{money(item.price)}</td>
                        <td className="px-4 py-3.5 text-[#111827]">{new Date(item.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="px-5 py-3.5">
                          <div className="h-2.5 rounded-full bg-[#FFF8F1]">
                            <div
                              className="h-2.5 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FFB000]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-[#111827]">
                      No orders yet. Start your first campaign.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="dashboard-glass p-5 sm:p-6"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#111827]">Service Usage</p>
          <h2 className="mt-2 text-lg font-black text-[#0B0B0F]">Top Services</h2>
          <div className="mt-4 space-y-3">
            {serviceUsage.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#111827]">
                  <span className="truncate pr-3">{item.name}</span>
                  <span>{item.count}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-[#FFF8F1]">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FFB000]"
                    style={{ width: `${Math.max(12, Math.round((item.count / maxService) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.article>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="dashboard-glass mt-6 p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#111827]">Quick Actions</p>
            <h2 className="mt-2 text-lg font-black text-[#0B0B0F]">Campaign shortcuts</h2>
          </div>
          <LineChart className="h-5 w-5 text-[#111827]" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/new-order" className="btn-dashboard-primary min-h-12 px-4 text-sm">
            Add New Order
          </Link>
          <Link href="/dashboard/add-funds" className="btn-dashboard-secondary min-h-12 px-4 text-sm">
            Add Funds
          </Link>
          <Link href="/services" className="btn-dashboard-secondary min-h-12 px-4 text-sm">
            View Services
          </Link>
          <Link href="/dashboard/support" className="btn-dashboard-secondary min-h-12 px-4 text-sm">
            Contact Support
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
