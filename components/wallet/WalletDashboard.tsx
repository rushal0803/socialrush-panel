"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { paymentMethodLabel } from "@/lib/payments/methods";
import dynamic from "next/dynamic";
const WalletTransactionDialog = dynamic(() => import("./WalletTransactionDialog"));

export type WalletTransaction = {
  id: string;
  amount: number;
  type: string;
  status: string;
  payment_method: string | null;
  description: string | null;
  created_at: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  provider_refund_id: string | null;
  metadata: Record<string, unknown> | null;
};
export type WalletOrder = {
  id: string;
  charge: number;
  status: string;
  created_at: string;
  serviceName: string;
};
export type WalletInitialData = {
  balance: number;
  totalDeposits: number;
  totalSpent: number;
  totalOrders: number;
  pendingPayments: number;
  email: string;
  transactions: WalletTransaction[];
  orders: WalletOrder[];
};

type CashfreeCheckout = {
  checkout: (options: { paymentSessionId: string; redirectTarget: "_self" }) => Promise<unknown>;
};
declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => CashfreeCheckout;
  }
}

const trustCards = [
  {
    title: "Protected payment routing",
    detail: "Protected payment routing with verified processing flows.",
    icon: "shield",
  },
  {
    title: "Fast wallet update",
    detail: "Wallet balance refreshes quickly after successful verification.",
    icon: "spark",
  },
  {
    title: "Support available",
    detail: "Assistance is available whenever a payment step needs attention.",
    icon: "support",
  },
] as const;

function Counter({
  value,
  moneyValue = false,
  formatter,
}: {
  value: number;
  moneyValue?: boolean;
  formatter?: (value: number) => string;
}) {
  return (
    <span>
      {moneyValue
        ? formatter
          ? formatter(value)
          : Math.round(value).toLocaleString("en-IN")
        : Math.round(value).toLocaleString("en-IN")}
    </span>
  );
}

function StatIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    balance: (
      <>
        <path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12" />
        <path d="M15 12h5" />
      </>
    ),
    deposit: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M8 11l4-4 4 4" />
      </>
    ),
    orders: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    spent: (
      <>
        <path d="M3 12h18M12 3v18" />
        <path d="m16 8 5 4-5 4M8 16l-5-4 5-4" />
      </>
    ),
    pending: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function WalletGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h13a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6a2 2 0 0 1-2-2V7Z" />
      <path d="M4 7V6a2 2 0 0 1 2-2h11" />
      <path d="M15.5 13H20" />
      <circle cx="15.5" cy="13" r="0.5" fill="currentColor" />
    </svg>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.2 2.5 8 7 10 4.5-2 7-5.8 7-10V6l-7-3Z" />
        <path d="m9.5 12 1.7 1.7L14.8 10" />
      </>
    ),
    spark: (
      <>
        <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />
      </>
    ),
    support: (
      <>
        <path d="M4 12a8 8 0 1 1 16 0" />
        <path d="M5 13v4a2 2 0 0 0 2 2h1v-6H5Z" />
        <path d="M19 13v4a2 2 0 0 1-2 2h-1v-6h3Z" />
        <path d="M12 20c0 1.1-1.8 2-4 2" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v4h4" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function statusBadgeClass(status: string) {
  const value = status.toLowerCase();
  if (["completed", "success", "succeeded"].includes(value)) {
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25";
  }
  if (["pending", "processing", "created"].includes(value)) {
    return "bg-amber-500/10 text-amber-300 ring-amber-400/25";
  }
  if (["refunded", "refund"].includes(value)) return "bg-sky-500/10 text-sky-300 ring-sky-400/25";
  if (["cancelled", "canceled"].includes(value)) return "bg-red-500/10 text-red-300 ring-red-400/25";
  return "bg-red-500/10 text-red-300 ring-red-400/25";
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ring-inset ${statusBadgeClass(status)}`}><i className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
}

function monthlySeries(
  transactions: WalletTransaction[],
  orders: WalletOrder[],
) {
  const months = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - offset));
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-IN", { month: "short" }),
    };
  });
  return months.map((month) => ({
    ...month,
    deposits: transactions
      .filter((item) => {
        const date = new Date(item.created_at);
        return (
          `${date.getFullYear()}-${date.getMonth()}` === month.key &&
          item.type === "credit" &&
          item.status === "completed"
        );
      })
      .reduce((sum, item) => sum + item.amount, 0),
    spending: transactions
      .filter((item) => {
        const date = new Date(item.created_at);
        return (
          `${date.getFullYear()}-${date.getMonth()}` === month.key &&
          item.type === "debit" &&
          item.status === "completed"
        );
      })
      .reduce((sum, item) => sum + item.amount, 0),
    orders: orders.filter((item) => {
      const date = new Date(item.created_at);
      return `${date.getFullYear()}-${date.getMonth()}` === month.key;
    }).length,
  }));
}

function MiniChart({
  title,
  value,
  data,
  color,
}: {
  title: string;
  value: string;
  data: number[];
  color: string;
}) {
  const max = Math.max(...data, 1);
  return (
    <article
      className="rounded-2xl border border-orange-400/20 bg-[#111111] p-5 shadow-[0_18px_45px_-30px_rgba(255,122,0,.55)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            {title}
          </p>
          <p className="mt-2 text-xl font-bold text-white">{value}</p>
        </div>
        <span className={`h-2 w-2 rounded-full ${color}`} />
      </div>
      <div className="mt-5 flex h-20 items-end gap-2">
        {data.map((height, index) => (
          <span
            key={index}
            style={{ height: `${Math.max((height / max) * 100, 5)}%` }}
            className={`flex-1 rounded-t ${color}`}
          />
        ))}
      </div>
    </article>
  );
}

export default function WalletDashboard({
  initial,
}: {
  initial: WalletInitialData;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo =
    requestedReturnTo?.startsWith("/") && !requestedReturnTo.startsWith("//")
      ? requestedReturnTo
      : null;
  const { currency, rates } = usePreferredCurrency("INR");
  const money = (value: number) => formatCurrency(value, currency, rates);
  const [balance, setBalance] = useState(initial.balance);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ paymentId: string; transactionId: string; amount: number; balance: number; completedAt: string } | null>(null);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const verifiedCashfreeOrder = useRef<string | null>(null);
  const transactionTrigger = useRef<HTMLButtonElement | null>(null);
  const closeTransaction = useCallback(() => {
    setSelectedTransaction(null);
    requestAnimationFrame(() => transactionTrigger.current?.focus());
  }, []);
  const amount = Number(searchParams.get("amount") || 0);
  const series = useMemo(
    () => monthlySeries(initial.transactions, initial.orders),
    [initial],
  );
  useEffect(() => {
    const orderId = searchParams.get("cashfree_order_id");
    if (!orderId || verifiedCashfreeOrder.current === orderId) return;
    verifiedCashfreeOrder.current = orderId;
    let active = true;
    void (async () => {
      setLoading(true);
      setError("");
      const response = await fetch("/api/payments/cashfree/verify", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }),
      });
      const payload = await response.json().catch(() => null) as { data?: { status?: string; balance?: number | null; paymentId?: string | null }; error?: string } | null;
      if (!active) return;
      setLoading(false);
      if (!response.ok || !payload?.data) {
        setError(payload?.error || "We could not verify this payment yet. Please check Wallet shortly before trying again.");
        return;
      }
      if (payload.data.status === "success") {
        const updatedBalance = payload.data.balance === null ? balance : Number(payload.data.balance);
        setBalance(updatedBalance);
        window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: updatedBalance }));
        setSuccess({ paymentId: payload.data.paymentId || orderId, transactionId: "", amount, balance: updatedBalance, completedAt: new Date().toISOString() });
        if (returnTo) {
          const separator = returnTo.includes("?") ? "&" : "?";
          router.replace(`${returnTo}${separator}resume=1`);
          return;
        }
        router.replace("/dashboard/add-funds");
        router.refresh();
      } else if (payload.data.status === "pending") {
        setError("Payment is still being verified. Your wallet has not been credited yet; please refresh this page shortly.");
      } else {
        setError("Payment was not successful. Your wallet was not charged.");
      }
    })();
    return () => { active = false; };
  }, [amount, balance, returnTo, router, searchParams]);

  const stats = [
    {
      label: "Total Deposits",
      value: initial.totalDeposits,
      money: true,
      note: "Completed credits in recent history",
      icon: "deposit",
    },
    {
      label: "Total Spent",
      value: initial.totalSpent,
      money: true,
      note: "Completed debits in recent history",
      icon: "spent",
    },
    {
      label: "Total Orders",
      value: initial.totalOrders,
      money: false,
      note: "Campaigns placed",
      icon: "orders",
    },
    {
      label: "Pending Payments",
      value: initial.pendingPayments,
      money: false,
      note: "Awaiting confirmation",
      icon: "pending",
    },
  ].filter((stat) => stat.icon !== "pending" || stat.value > 0);

  const presentStatuses = useMemo(() => Array.from(new Set(initial.transactions.map((item) => item.status).filter(Boolean))), [initial.transactions]);
  const presentMethods = useMemo(() => Array.from(new Set(initial.transactions.map((item) => item.payment_method).filter((item): item is string => Boolean(item)))), [initial.transactions]);
  const transactionSummary = useMemo(() => presentStatuses.map((status) => ({ status, count: initial.transactions.filter((item) => item.status === status).length })), [initial.transactions, presentStatuses]);
  const filteredTransactions = useMemo(() => initial.transactions.filter((item) => {
    const relatedOrder = String(item.metadata?.order_id || "");
    const haystack = `${item.id} ${item.provider_order_id || ""} ${item.provider_payment_id || ""} ${item.provider_refund_id || ""} ${relatedOrder} ${item.description || ""}`.toLowerCase();
    const matchesSearch = haystack.includes(transactionSearch.toLowerCase());
    const matchesType = transactionFilter === "all" || (transactionFilter === "credit" ? item.type === "credit" && item.status === "completed" : transactionFilter === "debit" ? item.type === "debit" : transactionFilter === "refund" ? item.type === "refund" : transactionFilter === "processing" ? item.status === "pending" : transactionFilter === "failed" ? item.status === "failed" : true);
    const days = dateFilter === "all" ? 0 : Number(dateFilter);
    return matchesSearch && matchesType && (statusFilter === "all" || item.status === statusFilter) && (methodFilter === "all" || item.payment_method === methodFilter) && (!days || new Date(item.created_at).getTime() >= Date.now() - days * 86400000);
  }), [dateFilter, initial.transactions, methodFilter, statusFilter, transactionFilter, transactionSearch]);
  const downloadStatement = () => {
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = filteredTransactions.map((item) => [new Date(item.created_at).toISOString(), item.type, item.status, item.description || paymentMethodLabel(item.payment_method || item.type), item.metadata?.order_id || item.provider_payment_id || item.provider_order_id || item.provider_refund_id || item.id, item.type === "debit" ? -Number(item.amount) : Number(item.amount)]);
    const csv = [["Date", "Type", "Status", "Description", "Reference", "Balance impact"], ...rows].map((row) => row.map(quote).join(",")).join("\n");
    const href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = href; link.download = "socialrush-wallet-statement.csv"; link.click(); URL.revokeObjectURL(href);
  };
  return (
    <main className="dashboard-premium-page dashboard-wallet-page relative min-h-[calc(100vh-5rem)] overflow-x-hidden bg-[#050505] px-4 pb-40 pt-5 text-white sm:px-6 sm:pt-7 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange-600/15 blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,122,0,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,122,0,.22)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] min-w-0">
        <section
          className="relative overflow-hidden rounded-[1.5rem] border border-orange-400/25 bg-[#111111]/95 p-5 shadow-[0_28px_80px_-42px_rgba(255,122,0,.7)] sm:rounded-[2rem] sm:p-7"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,.18),transparent_35%)]" />
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-orange-300">
                Secure wallet
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                Wallet
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#D1D5DB]">
                Your available balance for SocialRUSH orders. Add funds securely
                whenever you need to place an order.
              </p>
              <p className="mt-2 max-w-2xl text-xs font-semibold text-[#9CA3AF]">
                {getCurrencyDisclaimer()}
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-orange-400/35 bg-[linear-gradient(135deg,#181818,#0B0B0F)] p-5 shadow-[0_22px_55px_-30px_rgba(255,122,0,.75)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300">
                    Wallet Balance
                  </p>
                  <p className="mt-2 break-words text-3xl font-black text-white">
                    {money(balance)}
                  </p>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FF9F00] text-white shadow-lg shadow-orange-500/20">
                  <WalletGlyph />
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <p className="text-xs leading-5 text-[#9CA3AF]">
                  Available balance for SocialRUSH orders.
                </p>
                <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                  {currency}
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold text-orange-100">Your wallet is charged only after you confirm an order.</p>
            </div>
          </div>
        </section>
        <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap"><Link href="/dashboard/add-funds" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-xs font-black text-white shadow-[0_14px_30px_-20px_rgba(255,122,0,.7)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300">Add Funds</Link><a href="#transactions" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-[#D1D5DB] transition hover:border-orange-400/35 hover:bg-orange-500/10">View Transactions</a><Link href="/dashboard/support?category=payment_or_wallet" className="hidden min-h-11 items-center rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-xs font-bold text-orange-200 sm:inline-flex">Payment Help</Link></div>

        {loading ? <p role="status" className="mt-4 text-sm text-orange-200">Verifying payment. Please wait before paying again.</p> : null}
        {error ? <p role="alert" className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm text-amber-100">{error}</p> : null}
        <section className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="relative min-w-0 overflow-hidden rounded-[1.25rem] border border-orange-400/20 bg-[#111111] p-4 text-white shadow-[0_20px_50px_-34px_rgba(255,122,0,.55)] sm:rounded-[1.5rem] sm:p-5"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    {stat.label}
                  </p>
                  <p className="mt-2 break-words text-[clamp(1rem,4.5vw,1.5rem)] font-bold">
                    <Counter
                      value={stat.value}
                      moneyValue={stat.money}
                      formatter={money}
                    />
                  </p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-orange-300 sm:h-10 sm:w-10">
                  <StatIcon name={stat.icon} />
                </span>
              </div>
              <p className="relative mt-3 text-[9px] leading-4 text-[#9CA3AF] sm:mt-4 sm:text-[10px]">
                {stat.note}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {trustCards.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.4rem] border border-orange-400/20 bg-[#111111] p-5 shadow-[0_20px_50px_-36px_rgba(255,122,0,.6)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-orange-400/25 bg-orange-500/10 text-orange-300">
                <FeatureIcon name={item.icon} />
              </span>
              <h3 className="mt-4 text-base font-black text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#9CA3AF]">
                {item.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-orange-400">
              Wallet analytics
            </p>
            <h2 className="mt-1 text-xl font-black text-white">
              Financial performance
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <MiniChart
              title="Monthly deposits"
              value={money(
                series.reduce((sum, item) => sum + item.deposits, 0),
              )}
              data={series.map((item) => item.deposits)}
              color="bg-emerald-500"
            />
            <MiniChart
              title="Monthly spending"
              value={money(
                series.reduce((sum, item) => sum + item.spending, 0),
              )}
              data={series.map((item) => item.spending)}
              color="bg-orange-500"
            />
            <MiniChart
              title="Order activity"
              value={`${series.reduce((sum, item) => sum + item.orders, 0)} campaigns`}
              data={series.map((item) => item.orders)}
              color="bg-amber-500"
            />
          </div>
          <div className="mt-2 flex justify-around px-4 text-[8px] font-semibold uppercase text-[#6B7280]">
            {series.map((item) => (
              <span key={item.key}>{item.label}</span>
            ))}
          </div>
        </section>

        <section id="transactions" className="mt-6 scroll-mt-24 overflow-hidden rounded-[2rem] border border-orange-400/20 bg-[#0F0F0F] shadow-[0_28px_70px_-44px_rgba(255,122,0,.6)]">
          <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-orange-400">
                Transaction history
              </p>
              <h2 className="mt-2 text-xl font-black text-white">
                All wallet movements
              </h2>
            </div>
            <div className="flex flex-wrap gap-2"><span className="inline-flex w-fit rounded-2xl border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-300">{filteredTransactions.length} records</span><button type="button" disabled={!filteredTransactions.length} onClick={downloadStatement} className="min-h-9 rounded-xl border border-white/10 px-3 text-xs font-bold text-white disabled:opacity-40">Download CSV</button></div>
          </div>
          <div className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-2 xl:grid-cols-5"><input aria-label="Search wallet transactions" value={transactionSearch} onChange={(event) => setTransactionSearch(event.target.value)} className="min-h-11 min-w-0 rounded-xl border border-white/10 bg-[#151515] px-3 text-xs text-white outline-none transition focus:border-orange-400" placeholder="Search transaction or reference" /><select aria-label="Filter transaction type" value={transactionFilter} onChange={(event) => setTransactionFilter(event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-[#151515] px-3 text-xs text-white"><option value="all">All activity</option><option value="credit">Wallet Credit</option><option value="debit">Order Payment</option><option value="refund">Refund</option><option value="processing">Payment Processing</option><option value="failed">Payment Failed</option></select>{presentStatuses.length > 1 && <select aria-label="Filter transaction status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-[#151515] px-3 text-xs text-white"><option value="all">All statuses</option>{presentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>}{presentMethods.length > 1 && <select aria-label="Filter payment method" value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-[#151515] px-3 text-xs text-white"><option value="all">All methods</option>{presentMethods.map((paymentMethod) => <option key={paymentMethod} value={paymentMethod}>{paymentMethodLabel(paymentMethod)}</option>)}</select>}<select aria-label="Filter transaction date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-[#151515] px-3 text-xs text-white"><option value="all">All dates</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></div>
          {initial.transactions.length > 0 && <div className="grid grid-cols-2 gap-2 border-b border-white/10 p-4 sm:flex sm:flex-wrap"> <div className="rounded-xl border border-white/10 bg-white/[.025] px-3 py-2"><p className="text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">Total</p><p className="mt-1 text-sm font-black text-white">{initial.transactions.length}</p></div>{transactionSummary.map(({ status, count }) => <div key={status} className="rounded-xl border border-white/10 bg-white/[.025] px-3 py-2"><p className="text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">{status}</p><p className="mt-1 text-sm font-black text-white">{count}</p></div>)}</div>}
          <div className="grid gap-4 p-4 sm:p-5 lg:hidden">
            {filteredTransactions.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.4rem] border border-white/10 bg-[#151515] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-white">
                      #{item.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-[11px] text-[#9CA3AF]">
                      {new Date(item.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#0B0B0F] px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9CA3AF]">
                      Payment Method
                    </p>
                    <p className="mt-2 text-sm font-bold text-white">
                      {paymentMethodLabel(item.payment_method || item.description || item.type)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#0B0B0F] px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9CA3AF]">
                      Amount
                    </p>
                    <p className={`mt-2 text-sm font-black ${item.type === "debit" ? "text-white" : "text-emerald-300"}`}>
                      {item.type === "debit" ? "-" : "+"}
                      {money(item.amount)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2"><button type="button" onClick={event => { transactionTrigger.current = event.currentTarget; event.currentTarget.focus(); setSelectedTransaction(item); }} className="min-h-11 flex-1 rounded-xl border border-orange-400/25 bg-orange-500/10 px-3 text-xs font-bold text-orange-200">View Details</button><button type="button" aria-label="Copy transaction ID" onClick={() => void navigator.clipboard.writeText(item.id)} className="min-h-11 rounded-xl border border-white/10 px-3 text-xs font-bold">Copy ID</button></div>
              </article>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="rounded-[1.5rem] border border-white/10 bg-[#151515] p-10 text-center text-sm text-[#9CA3AF]">
                <p className="font-bold text-white">No wallet activity yet</p><p className="mt-2">Your deposits, payment activity and eligible refunds will appear here.</p><Link href="/dashboard/add-funds" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-4 text-xs font-bold text-white">Add Funds</Link>
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-[#151515] text-[10px] uppercase tracking-[0.18em] text-[#9CA3AF]">
                <tr>
                  {[
                    "Transaction ID",
                    "Date",
                    "Payment Method",
                    "Amount",
                    "Status",
                  ].map((head) => (
                    <th key={head} className="px-6 py-4">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredTransactions.map((item) => (
                  <tr key={item.id} className="bg-[#0F0F0F] transition hover:bg-[#181818]">
                    <td className="px-6 py-4 font-black text-white">
                      #{item.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-[#9CA3AF]">
                      {new Date(item.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {paymentMethodLabel(item.payment_method || item.description || item.type)}
                    </td>
                    <td className={`px-6 py-4 font-black ${item.type === "debit" ? "text-white" : "text-emerald-300"}`}>
                      {item.type === "debit" ? "-" : "+"}
                      {money(item.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                      <button type="button" onClick={event => { transactionTrigger.current = event.currentTarget; event.currentTarget.focus(); setSelectedTransaction(item); }} className="ml-2 text-[10px] font-bold text-orange-300">Details</button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-14 text-center text-[#9CA3AF]">
                      <p className="font-bold text-white">No wallet activity yet</p><p className="mt-2">Your deposits, payment activity and eligible refunds will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {selectedTransaction ? <WalletTransactionDialog item={selectedTransaction} onClose={closeTransaction} /> : null}
        {success && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-5 backdrop-blur-sm"
          >
            <div
              className="w-full max-w-sm rounded-[2rem] border border-orange-400/30 bg-[#111111] p-8 text-center shadow-[0_36px_90px_-40px_rgba(255,122,0,.8)]"
            >
              <span
                className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-3xl text-emerald-600 shadow-[0_20px_40px_-20px_rgba(16,185,129,.6)]"
              >
                ✓
              </span>
              <h2 className="mt-5 text-2xl font-black text-white">Payment successful</h2>
              <p className="mt-2 text-sm text-[#D1D5DB]">
                {money(success.amount)} was verified and credited to your wallet.
              </p>
              <p className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-3 text-sm font-black text-orange-300">
                New balance: {money(success.balance)}
              </p>
              <dl className="mt-4 space-y-2 text-left text-xs"><div className="rounded-xl bg-[#0B0B0F] p-3"><dt className="text-[#9CA3AF]">Payment reference</dt><dd className="mt-1 break-all font-bold text-white">{success.paymentId}</dd></div><div className="rounded-xl bg-[#0B0B0F] p-3"><dt className="text-[#9CA3AF]">Wallet credit</dt><dd className="mt-1 font-bold text-emerald-300">{money(success.amount)}</dd></div><div className="rounded-xl bg-[#0B0B0F] p-3"><dt className="text-[#9CA3AF]">Verified at</dt><dd className="mt-1 font-bold text-white">{new Date(success.completedAt).toLocaleString("en-IN")}</dd></div></dl><div className="mt-4 grid gap-2"><button type="button" onClick={() => { setSuccess(null); document.getElementById("transactions")?.scrollIntoView({behavior:"smooth"}); }} className="min-h-11 rounded-xl border border-white/10 text-xs font-bold text-white">View Transaction</button><Link href="/dashboard/new-order" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 text-xs font-bold text-white">Create New Order</Link></div>
            </div>
          </div>
        )}
    </main>
  );
}
