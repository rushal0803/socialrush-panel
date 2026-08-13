"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import {
  isPaymentMethodEnabled,
  PAYMENT_METHODS,
  paymentMethodLabel,
  paymentMethodUnavailableMessage,
  normalizePaymentMethod,
  type PaymentMethodId,
} from "@/lib/payments/methods";

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

const methods = PAYMENT_METHODS;
const defaultPaymentMethod =
  methods.find((item) => isPaymentMethodEnabled(item.id))?.id ?? "upi";

const quickAmounts = [100, 500, 1000, 2000, 5000];

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

function cleanAmountInput(value: string) {
  const sanitized = value.replace(/[^\d.]/g, "");
  const [wholePart = "", ...fractionParts] = sanitized.split(".");
  const whole = wholePart.replace(/^0+(?=\d)/, "") || (fractionParts.length ? "0" : "");
  if (!fractionParts.length) return whole;
  return `${whole}.${fractionParts.join("").slice(0, 2)}`;
}

function Counter({
  value,
  moneyValue = false,
  formatter,
}: {
  value: number;
  moneyValue?: boolean;
  formatter?: (value: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 900, 1);
      setShown(value * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, visible]);
  return (
    <span ref={ref}>
      {moneyValue
        ? formatter
          ? formatter(shown)
          : Math.round(shown).toLocaleString("en-IN")
        : Math.round(shown).toLocaleString("en-IN")}
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

function PaymentMethodIcon({
  methodId,
  active,
}: {
  methodId: string;
  active: boolean;
}) {
  const iconClassName = active ? "text-white" : "text-[#FF9F00]";

  if (methodId === "upi") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${iconClassName}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <path d="M16.5 13.5H20v6.5h-6.5V16.5" />
        <path d="M15.5 15.5 20 20" />
      </svg>
    );
  }

  if (methodId === "card" || methodId === "international_card") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${iconClassName}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8.5h18" />
        <rect x="3" y="5" width="18" height="14" rx="3" />
        {methodId === "international_card" ? (
          <>
            <circle cx="16.5" cy="14.5" r="2.5" />
            <path d="M14 14.5h5M16.5 12v5" />
          </>
        ) : (
          <path d="M7 15h3M15 15h2" />
        )}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${iconClassName}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 10 9-6 9 6" />
      <path d="M5 10h14M6 10v8m4-8v8m4-8v8m4-8v8M4 20h16" />
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
    <motion.article
      whileHover={{ y: -4 }}
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
          <motion.span
            key={index}
            initial={{ height: 0 }}
            whileInView={{ height: `${Math.max((height / max) * 100, 5)}%` }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className={`flex-1 rounded-t ${color}`}
          />
        ))}
      </div>
    </motion.article>
  );
}

function loadCashfree() {
  return new Promise<boolean>((resolve) => {
    if (window.Cashfree) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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
  const minimumAmount = returnTo ? 0.01 : 100;
  const { currency } = usePreferredCurrency("INR");
  const money = (value: number) => formatCurrency(value, currency);
  const [balance, setBalance] = useState(initial.balance);
  const [method, setMethod] = useState<PaymentMethodId>(() => {
    const requested = normalizePaymentMethod(searchParams.get("method"));
    return requested && requested !== "wallet" && isPaymentMethodEnabled(requested)
      ? requested
      : defaultPaymentMethod;
  });
  const [amountInput, setAmountInput] = useState(() => cleanAmountInput(searchParams.get("amount") || ""));
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
  const amount = useMemo(() => Number(amountInput || 0), [amountInput]);
  const series = useMemo(
    () => monthlySeries(initial.transactions, initial.orders),
    [initial],
  );
  const activities = useMemo(
    () =>
      [
        ...initial.transactions
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            date: item.created_at,
            title:
              item.type === "credit"
                ? `Wallet funded ${formatCurrency(item.amount, currency)}`
                : item.type === "refund"
                  ? `Refund added ${formatCurrency(item.amount, currency)}`
                  : `Campaign investment ${formatCurrency(item.amount, currency)}`,
            tone:
              item.type === "credit" || item.type === "refund"
                ? "emerald"
                : "blue",
          })),
        ...initial.orders
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            date: item.created_at,
            title: `${item.serviceName} campaign ${item.status === "completed" ? "completed" : "created"}`,
            tone: item.status === "completed" ? "emerald" : "blue",
          })),
      ]
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .slice(0, 6),
    [currency, initial.orders, initial.transactions],
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

  async function startPayment(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const canonicalMethod = normalizePaymentMethod(method);
    if (!canonicalMethod || !isPaymentMethodEnabled(canonicalMethod)) {
      setError(paymentMethodUnavailableMessage(method));
      return;
    }
    setLoading(true);
    const loaded = await loadCashfree();
    if (!loaded || !window.Cashfree) {
      setError("Secure Cashfree checkout could not be loaded. Please try again.");
      setLoading(false);
      return;
    }
    const response = await fetch("/api/payments/cashfree/order", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, method: canonicalMethod, returnTo }),
    });
    const payload = await response.json().catch(() => null) as { data?: { paymentSessionId: string; orderId: string; environment: "sandbox" | "production" }; error?: string } | null;
    if (!response.ok || !payload?.data) {
      setError(payload?.error || "Unable to initialize Cashfree payment.");
      setLoading(false);
      return;
    }
    try {
      await window.Cashfree({ mode: payload.data.environment }).checkout({ paymentSessionId: payload.data.paymentSessionId, redirectTarget: "_self" });
    } catch {
      setLoading(false);
      setError("Cashfree checkout was cancelled or could not be opened. Your wallet was not credited.");
    }
    return;
  }

  const stats = [
    {
      label: "Total Deposits",
      value: initial.totalDeposits,
      money: true,
      note: "Lifetime wallet funding",
      icon: "deposit",
    },
    {
      label: "Total Spent",
      value: initial.totalSpent,
      money: true,
      note: "Campaign investment",
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

  const selectedMethod = methods.find((item) => item.id === method) ?? methods[0];
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
  const selectedStatus = loading
    ? "Processing"
    : amount >= minimumAmount
      ? "Ready"
      : "Minimum amount required";

  return (
    <main className="dashboard-premium-page dashboard-wallet-page relative min-h-[calc(100vh-5rem)] overflow-x-hidden bg-[#050505] px-4 pb-40 pt-5 text-white sm:px-6 sm:pt-7 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange-600/15 blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,122,0,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,122,0,.22)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] min-w-0">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
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
        </motion.section>
        <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap"><a href="#add-funds" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 text-xs font-black text-white shadow-[0_14px_30px_-20px_rgba(255,122,0,.7)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300">Add Funds</a><a href="#transactions" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-[#D1D5DB] transition hover:border-orange-400/35 hover:bg-orange-500/10">View Transactions</a><a href="/dashboard/support?category=payment_or_wallet" className="hidden min-h-11 items-center rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-xs font-bold text-orange-200 sm:inline-flex">Payment Help</a></div>

        <section className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -5 }}
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
            </motion.article>
          ))}
        </section>

        <section id="add-funds" className="mt-5 scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-orange-400/25 bg-[#0F0F0F] shadow-[0_30px_80px_-45px_rgba(255,122,0,.65)] sm:rounded-[2rem]">
          <div className="border-b border-white/10 px-5 py-5 sm:px-6 xl:px-7">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-400">
              Add funds
            </p>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Three simple steps
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { number: 1, label: "Payment method", state: "complete" },
                { number: 2, label: "Enter amount", state: amount >= minimumAmount ? "complete" : "active" },
                { number: 3, label: "Review & pay", state: amount >= minimumAmount ? "active" : "upcoming" },
              ].map((step) => (
                <div
                  key={step.number}
                  className={`flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2.5 sm:px-3 ${
                    step.state === "complete"
                      ? "border-emerald-400/30 bg-emerald-500/10"
                      : step.state === "active"
                        ? "border-orange-400/55 bg-orange-500/15 shadow-[0_12px_28px_-22px_rgba(255,122,0,.8)]"
                        : "border-white/10 bg-[#111111]"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-black ${
                      step.state === "complete"
                        ? "bg-emerald-500 text-white"
                        : step.state === "active"
                          ? "bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white"
                          : "bg-white/10 text-[#9CA3AF]"
                    }`}
                  >
                    {step.state === "complete" ? "✓" : step.number}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[8px] font-black uppercase tracking-[0.1em] text-[#9CA3AF]">
                      Step {step.number}
                    </span>
                    <span className={`block truncate text-[9px] font-black sm:text-[10px] ${step.state === "upcoming" ? "text-[#9CA3AF]" : "text-white"}`}>
                      {step.label}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={startPayment}
            className="grid gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-7 xl:px-7 xl:py-7"
          >
            <div className="min-w-0 space-y-5 sm:space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-[1.35rem] border border-orange-400/20 bg-[#151515] p-4 shadow-[0_22px_55px_-38px_rgba(255,122,0,.6)] sm:rounded-[1.75rem] sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-400">
                      Step 1
                    </p>
                    <p className="mt-2 text-base font-black text-white">
                      Select Payment Method
                    </p>
                  </div>
                  <span className="rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300">
                    {methods.filter((item) => isPaymentMethodEnabled(item.id)).length} active
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 xl:mt-5 xl:grid-cols-4">
                  {methods.map((item) => {
                    const active = method === item.id;
                    const enabled = isPaymentMethodEnabled(item.id);
                    return (
                      <motion.button
                        whileHover={enabled ? { y: -4 } : undefined}
                        whileTap={enabled ? { scale: 0.985 } : undefined}
                        type="button"
                        key={item.id}
                        disabled={!enabled}
                        aria-disabled={!enabled}
                        onClick={() => {
                          if (!enabled) return;
                          setMethod(item.id);
                          setError("");
                        }}
                        className={`group relative min-h-36 overflow-hidden rounded-[1.15rem] border p-3 text-left transition sm:min-h-28 sm:rounded-[1.35rem] sm:p-4 ${
                          active
                            ? "border-orange-400/80 bg-orange-500/15 shadow-[0_0_0_3px_rgba(255,122,0,.1),0_18px_42px_-30px_rgba(255,122,0,.8)]"
                            : enabled
                              ? "border-white/10 bg-[#0B0B0F] hover:border-orange-400/45"
                              : "cursor-not-allowed border-white/5 bg-[#0B0B0F] opacity-45"
                        }`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255, 159, 0, .14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255, 122, 0, .14),transparent_32%)] opacity-0 transition group-hover:opacity-100" />
                        <div className="relative flex flex-col items-start gap-3 sm:flex-row">
                          <span
                            className={`grid h-11 w-11 shrink-0 place-items-center rounded-[1.1rem] border shadow-[0_14px_30px_-20px_rgba(255, 159, 0, .35)] sm:h-12 sm:w-12 sm:rounded-[1.2rem] ${
                              active
                                ? "border-transparent bg-gradient-to-br from-[#FF7A00] to-[#FFB000]"
                                : "border-orange-400/20 bg-orange-500/10"
                            }`}
                          >
                            <PaymentMethodIcon methodId={item.id} active={active} />
                          </span>

                          <span className="min-w-0">
                            <b className="block text-sm font-black text-white">
                              {item.label}
                            </b>
                            <small className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-[#9CA3AF] sm:block sm:text-xs sm:leading-5">
                              {item.description}
                            </small>
                            {!enabled ? (
                              <small className="mt-2 line-clamp-1 text-[9px] font-bold leading-4 text-amber-300 sm:text-[10px]">
                                Currently under activation.
                              </small>
                            ) : item.id === "international_card" ? (
                              <small className="mt-2 block text-[10px] font-bold leading-4 text-[#D1D5DB]">
                                Requires international payments enabled for this checkout provider.
                              </small>
                            ) : null}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D1D5DB]">Checkout provider</p>
                  <div className="mt-3 rounded-xl border border-orange-400 bg-orange-500/15 px-4 py-3 text-left text-xs font-black text-white">
                    Cashfree
                    <span className="mt-1 block text-[10px] font-medium text-[#9CA3AF]">Hosted UPI, card and net banking checkout</span>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-[1.35rem] border border-orange-400/20 bg-[#151515] p-4 shadow-[0_22px_55px_-38px_rgba(255,122,0,.6)] sm:rounded-[1.75rem] sm:p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-400">
                      Step 2
                    </p>
                    <p className="mt-2 text-base font-black text-white">
                      Enter Amount
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-[#9CA3AF]">
                    Minimum {returnTo ? "required order amount" : "100"} · Maximum 500000
                  </p>
                </div>

                <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-[#0B0B0F] p-3.5 sm:mt-5 sm:rounded-[1.7rem] sm:p-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#D1D5DB]">
                    Amount in INR
                  </label>
                  <div className="relative mt-3">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-3 py-2 text-sm font-black text-orange-300">
                      ₹
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amountInput}
                      onChange={(event) => setAmountInput(cleanAmountInput(event.target.value))}
                      placeholder="1000"
                      className="h-14 w-full rounded-[1.2rem] border border-white/10 bg-[#151515] pl-20 pr-4 text-xl font-black tracking-[-0.03em] text-white outline-none transition placeholder:text-[#6B7280] focus:border-[#FF7A00] focus:shadow-[0_0_0_4px_rgba(255,122,0,.15)] sm:h-16 sm:rounded-[1.5rem] sm:pr-5 sm:text-2xl"
                    />
                  </div>
                    <p className="mt-2 text-xs font-semibold text-[#9CA3AF]">
                      Amount is charged in INR. {currency !== "INR" ? `Approx in ${currency}: ${money(amount)}.` : ""}
                    </p>

                  <div className="mt-4 grid grid-cols-2 gap-2.5 min-[390px]:grid-cols-3 sm:grid-cols-5 sm:gap-3">
                    {quickAmounts.map((value) => {
                      const active = amount === value;
                      return (
                        <motion.button
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          key={value}
                          onClick={() => setAmountInput(String(value))}
                          className={`min-h-11 rounded-xl border px-2 py-3 text-center text-xs font-black shadow-[0_16px_32px_-24px_rgba(255, 159, 0, .35)] transition sm:rounded-2xl sm:px-3 ${
                            active
                              ? "border-transparent bg-gradient-to-r from-[#FF7A00] to-[#FFB000] text-white"
                              : "border-white/10 bg-[#151515] text-[#D1D5DB] hover:border-orange-400/45 hover:text-white"
                          }`}
                        >
                          {money(value)}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.section>

              {amount > 0 && amount < minimumAmount && (
                <p className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm font-semibold text-amber-200">
                  Minimum amount required: {money(minimumAmount)}.
                </p>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm font-semibold text-red-200"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className="order-last min-w-0 xl:order-none"
            >
              <div className="space-y-4 xl:sticky xl:top-24">
                <div className="overflow-hidden rounded-[1.6rem] border border-orange-400/35 bg-[#111111] shadow-[0_30px_70px_-40px_rgba(255,122,0,.8)]">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-400">
                          Step 3
                        </p>
                        <h3 className="mt-2 text-xl font-black text-white">
                          Payment Summary
                        </h3>
                      </div>
                      <div className="grid h-12 w-12 place-items-center rounded-[1.25rem] bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-white shadow-[0_18px_40px_-22px_rgba(255, 196, 0, .55)]">
                        <WalletGlyph />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5 text-xs text-[#9CA3AF] sm:mt-5 sm:text-sm">
                      <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2.5">
                        <span className="font-semibold">Payment method</span>
                        <span className="max-w-[58%] text-right font-bold text-white">
                          {selectedMethod.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2.5">
                        <span className="font-semibold">Entered amount</span>
                        <span className="text-right font-bold text-white">
                          {amountInput ? money(amount) : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2.5">
                        <span className="font-semibold">Fees / charges</span>
                        <span className="text-right font-bold text-white">
                          {money(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2.5">
                        <span className="font-semibold">Wallet credit</span>
                        <span className="text-right font-bold text-emerald-300">
                          {amountInput ? money(amount) : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-400/25 bg-orange-500/10 px-3 py-3">
                        <span className="font-bold text-orange-200">Final payable</span>
                        <span className="text-right text-lg font-black text-white">
                          {amountInput ? money(amount) : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <span className="font-semibold">Status</span>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${loading ? "bg-orange-500/15 text-orange-300" : amount >= minimumAmount ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                          {selectedStatus}
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={loading || amount < minimumAmount || !isPaymentMethodEnabled(method)}
                      type="submit"
                      className="mt-5 min-h-14 w-full rounded-[1.2rem] bg-gradient-to-r from-[#FF7A00] to-[#FF9F00] px-4 py-4 text-sm font-black text-white shadow-[0_22px_48px_-20px_rgba(255,122,0,.7)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-none disabled:bg-[#2A2A2A] disabled:text-[#9CA3AF] disabled:shadow-none sm:rounded-[1.35rem] sm:px-5"
                    >
                      {loading
                        ? "Opening secure checkout..."
                        : !amountInput
                          ? "Enter amount to continue"
                          : amount < minimumAmount
                            ? `Minimum ${money(minimumAmount)} required`
                            : "Proceed to Secure Payment"}
                    </button>
                    <a
                      href="/dashboard/support?category=payment_or_wallet"
                      className="mt-3 inline-flex w-full items-center justify-center text-xs font-bold text-orange-300 transition hover:text-orange-200"
                    >
                      Get Payment Help
                    </a>
                  </div>
                </div>

                <div className="hidden rounded-[1.7rem] border border-orange-400/20 bg-[#111111] p-5 text-white xl:block">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                        Recent activity
                      </p>
                      <h3 className="mt-2 text-lg font-black">
                        Wallet timeline
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                      Live
                    </span>
                  </div>

                  <div className="mt-5 space-y-1">
                    {activities.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative flex gap-4 py-3"
                      >
                        <div className="relative">
                          <span
                            className={`relative z-10 grid h-10 w-10 place-items-center rounded-2xl text-sm font-black ${item.tone === "emerald" ? "bg-emerald-400/15 text-emerald-300" : "bg-orange-400/15 text-orange-300"}`}
                          >
                            {item.tone === "emerald" ? "+" : "↗"}
                          </span>
                          {index < activities.length - 1 && (
                            <i className="absolute left-1/2 top-10 h-7 -translate-x-1/2 border-l border-white/10" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">
                            {item.title}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                            {new Date(item.date).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {activities.length === 0 && (
                      <p className="py-10 text-center text-xs text-slate-400">
                        Your wallet activity will appear here.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>
          </form>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {trustCards.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -4 }}
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
            </motion.article>
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
            <span className="inline-flex w-fit rounded-2xl border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-300">
              {filteredTransactions.length} records
            </span>
          </div>
          <div className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-2 xl:grid-cols-5"><input aria-label="Search wallet transactions" value={transactionSearch} onChange={(event) => setTransactionSearch(event.target.value)} className="min-h-11 min-w-0 rounded-xl border border-white/10 bg-[#151515] px-3 text-xs text-white outline-none transition focus:border-orange-400" placeholder="Search transaction or reference" /><select aria-label="Filter transaction type" value={transactionFilter} onChange={(event) => setTransactionFilter(event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-[#151515] px-3 text-xs text-white"><option value="all">All activity</option><option value="credit">Wallet Credit</option><option value="debit">Order Payment</option><option value="refund">Refund</option><option value="processing">Payment Processing</option><option value="failed">Payment Failed</option></select>{presentStatuses.length > 1 && <select aria-label="Filter transaction status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-[#151515] px-3 text-xs text-white"><option value="all">All statuses</option>{presentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>}{presentMethods.length > 1 && <select aria-label="Filter payment method" value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-[#151515] px-3 text-xs text-white"><option value="all">All methods</option>{presentMethods.map((paymentMethod) => <option key={paymentMethod} value={paymentMethod}>{paymentMethodLabel(paymentMethod)}</option>)}</select>}<select aria-label="Filter transaction date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-[#151515] px-3 text-xs text-white"><option value="all">All dates</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></div>
          {initial.transactions.length > 0 && <div className="grid grid-cols-2 gap-2 border-b border-white/10 p-4 sm:flex sm:flex-wrap"> <div className="rounded-xl border border-white/10 bg-white/[.025] px-3 py-2"><p className="text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">Total</p><p className="mt-1 text-sm font-black text-white">{initial.transactions.length}</p></div>{transactionSummary.map(({ status, count }) => <div key={status} className="rounded-xl border border-white/10 bg-white/[.025] px-3 py-2"><p className="text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">{status}</p><p className="mt-1 text-sm font-black text-white">{count}</p></div>)}</div>}
          <div className="grid gap-4 p-4 sm:p-5 lg:hidden">
            {filteredTransactions.map((item) => (
              <motion.article
                key={item.id}
                whileHover={{ y: -3 }}
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
                <div className="mt-3 flex gap-2"><button type="button" onClick={() => setSelectedTransaction(item)} className="min-h-11 flex-1 rounded-xl border border-orange-400/25 bg-orange-500/10 px-3 text-xs font-bold text-orange-200">View Details</button><button type="button" aria-label="Copy transaction ID" onClick={() => void navigator.clipboard.writeText(item.id)} className="min-h-11 rounded-xl border border-white/10 px-3 text-xs font-bold">Copy ID</button></div>
              </motion.article>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="rounded-[1.5rem] border border-white/10 bg-[#151515] p-10 text-center text-sm text-[#9CA3AF]">
                <p className="font-bold text-white">No wallet activity yet</p><p className="mt-2">Your deposits, payment activity and eligible refunds will appear here.</p><a href="#add-funds" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-4 text-xs font-bold text-white">Add Funds</a>
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
                      <button type="button" onClick={() => setSelectedTransaction(item)} className="ml-2 text-[10px] font-bold text-orange-300">Details</button>
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
      <AnimatePresence>
        {selectedTransaction ? <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => setSelectedTransaction(null)}><motion.article initial={{scale:.96,y:12}} animate={{scale:1,y:0}} onClick={(event) => event.stopPropagation()} className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-3xl border border-orange-400/30 bg-[#111111] p-5 shadow-2xl sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Transaction Details</h2><button type="button" aria-label="Close transaction details" onClick={() => setSelectedTransaction(null)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10">×</button></div><dl className="mt-5 space-y-2 text-xs">{[["Transaction ID",selectedTransaction.id],["Payment reference",selectedTransaction.provider_payment_id || selectedTransaction.provider_order_id || selectedTransaction.provider_refund_id || "Not available"],["Payment method",paymentMethodLabel(selectedTransaction.payment_method || selectedTransaction.type)],["Type",selectedTransaction.type],["Amount",`${selectedTransaction.type === "debit" ? "−" : "+"}${money(selectedTransaction.amount)}`],["Wallet impact",selectedTransaction.status === "completed" ? (selectedTransaction.type === "debit" ? `Debit ${money(selectedTransaction.amount)}` : `Credit ${money(selectedTransaction.amount)}`) : "No completed wallet impact"],["Status",selectedTransaction.status],["Related order",String(selectedTransaction.metadata?.order_id || "Not linked")],["Created",new Date(selectedTransaction.created_at).toLocaleString("en-IN")],["Description",selectedTransaction.description || "Not provided"]].map(([label,value]) => <div key={label} className="flex min-w-0 justify-between gap-4 rounded-xl bg-[#0B0B0F] p-3"><dt className="shrink-0 text-[#9CA3AF]">{label}</dt><dd className="min-w-0 break-all text-right font-bold text-white">{value}</dd></div>)}</dl><div className="mt-4 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => void navigator.clipboard.writeText(selectedTransaction.id)} className="min-h-11 rounded-xl border border-white/10 text-xs font-bold">Copy Transaction ID</button><a href={`/dashboard/support?category=payment_or_wallet&transaction=${encodeURIComponent(selectedTransaction.id)}&payment=${encodeURIComponent(selectedTransaction.provider_payment_id || selectedTransaction.provider_order_id || "")}&status=${encodeURIComponent(selectedTransaction.status)}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 text-xs font-bold text-white">Get Payment Help</a></div><p className="mt-4 text-[11px] leading-5 text-amber-200">Never share your card PIN, CVV, OTP, UPI PIN, password or full banking credentials.</p></motion.article></motion.div> : null}
      </AnimatePresence>
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.75, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-sm rounded-[2rem] border border-orange-400/30 bg-[#111111] p-8 text-center shadow-[0_36px_90px_-40px_rgba(255,122,0,.8)]"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.15 }}
                className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-3xl text-emerald-600 shadow-[0_20px_40px_-20px_rgba(16,185,129,.6)]"
              >
                ✓
              </motion.span>
              <h2 className="mt-5 text-2xl font-black text-white">Payment successful</h2>
              <p className="mt-2 text-sm text-[#D1D5DB]">
                {money(success.amount)} was verified and credited to your wallet.
              </p>
              <p className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-3 text-sm font-black text-orange-300">
                New balance: {money(success.balance)}
              </p>
              <dl className="mt-4 space-y-2 text-left text-xs"><div className="rounded-xl bg-[#0B0B0F] p-3"><dt className="text-[#9CA3AF]">Payment reference</dt><dd className="mt-1 break-all font-bold text-white">{success.paymentId}</dd></div><div className="rounded-xl bg-[#0B0B0F] p-3"><dt className="text-[#9CA3AF]">Wallet credit</dt><dd className="mt-1 font-bold text-emerald-300">{money(success.amount)}</dd></div><div className="rounded-xl bg-[#0B0B0F] p-3"><dt className="text-[#9CA3AF]">Verified at</dt><dd className="mt-1 font-bold text-white">{new Date(success.completedAt).toLocaleString("en-IN")}</dd></div></dl><div className="mt-4 grid gap-2"><button type="button" onClick={() => { setSuccess(null); document.getElementById("transactions")?.scrollIntoView({behavior:"smooth"}); }} className="min-h-11 rounded-xl border border-white/10 text-xs font-bold text-white">View Transaction</button><a href="/dashboard/new-order" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-500 text-xs font-bold text-white">Create New Order</a></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
