"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/currency";

type AdminOverviewProps = {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    walletTopUps: number;
    supportTickets: number;
  };
  recentUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    status: string;
    userName: string;
    createdAt: string;
  }>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const statusTone: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-300 border-amber-400/25",
  processing: "bg-orange-500/10 text-orange-300 border-orange-400/25",
  completed: "bg-emerald-500/10 text-emerald-300 border-emerald-400/25",
  failed: "bg-red-500/10 text-red-300 border-red-400/25",
  refunded: "bg-red-500/10 text-red-300 border-red-400/25",
};

function MetricIcon() {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-400/25 bg-orange-500/10 text-orange-300">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" />
      </svg>
    </span>
  );
}

export default function AdminOverviewContent({ stats, recentUsers, recentTransactions }: AdminOverviewProps) {
  const cards = [
    { title: "Total Users", value: stats.totalUsers.toLocaleString("en-IN"), note: "Registered accounts" },
    { title: "Total Orders", value: stats.totalOrders.toLocaleString("en-IN"), note: "All customer orders" },
    { title: "Total Revenue", value: formatCurrency(stats.totalRevenue, "INR"), note: "Completed order value" },
    { title: "Pending Orders", value: stats.pendingOrders.toLocaleString("en-IN"), note: "Awaiting fulfillment" },
    { title: "Completed Orders", value: stats.completedOrders.toLocaleString("en-IN"), note: "Delivered successfully" },
    { title: "Wallet Top-ups", value: stats.walletTopUps.toLocaleString("en-IN"), note: "Successful wallet credits" },
    { title: "Support Tickets", value: stats.supportTickets.toLocaleString("en-IN"), note: "All customer tickets" },
  ] as const;

  return (
    <main className="relative mx-auto max-w-[1700px] px-5 pb-8 pt-6 sm:px-8 sm:pt-8">
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FF9F00]">Admin Dashboard</p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Platform command center</h1>
            <p className="mt-2 text-sm text-[#D1D5DB]">A clear operational view of users, revenue, orders, payments, and support.</p>
          </div>
          <Link href="/admin/orders" className="btn-dashboard-primary px-4 py-2.5 text-xs">
            Manage Orders
          </Link>
        </div>
      </motion.section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <motion.article
            key={card.title}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.35, delay: index * 0.05 }}
            whileHover={{ y: -6 }}
            className="dashboard-glass p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#D1D5DB]">{card.title}</p>
                <p className="mt-2 break-words text-2xl font-black text-white">{card.value}</p>
              </div>
              <MetricIcon />
            </div>
            <p className="mt-3 text-[11px] text-[#9CA3AF]">{card.note}</p>
          </motion.article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="dashboard-glass overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF9F00]">Users</p>
              <h2 className="mt-1 text-lg font-black text-white">Recent registrations</h2>
            </div>
            <Link href="/admin/users" className="btn-dashboard-secondary px-3.5 py-2 text-xs">
              View all
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {recentUsers.length ? (
              recentUsers.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-xs font-black text-white">
                    {item.fullName.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{item.fullName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">{item.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex rounded-full border border-orange-400/25 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold capitalize text-orange-300">
                      {item.role}
                    </span>
                    <p className="mt-1 text-[10px] text-[#9CA3AF]">{new Date(item.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-5 py-10 text-center text-sm text-[#9CA3AF] sm:px-6">No users found.</p>
            )}
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="dashboard-glass overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF9F00]">Transactions</p>
              <h2 className="mt-1 text-lg font-black text-white">Recent payment activity</h2>
            </div>
            <Link href="/admin/payments" className="btn-dashboard-secondary px-3.5 py-2 text-xs">
              View all
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {recentTransactions.length ? (
              recentTransactions.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{item.userName}</p>
                    <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">{formatCurrency(item.amount, "INR")}</p>
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusTone[item.status] || "border-white/10 bg-white/5 text-[#9CA3AF]"}`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] font-semibold capitalize text-[#D1D5DB]">{item.type}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-5 py-10 text-center text-sm text-[#9CA3AF] sm:px-6">No transactions found.</p>
            )}
          </div>
        </motion.article>
      </section>
    </main>
  );
}
