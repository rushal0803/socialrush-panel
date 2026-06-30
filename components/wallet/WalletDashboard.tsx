"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import {
  isPaymentMethod,
  isPaymentMethodEnabled,
  PAYMENT_METHODS,
  paymentMethodLabel,
  paymentMethodUnavailableMessage,
  razorpayMethodFor,
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

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { email: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void | Promise<void>;
  modal?: { ondismiss?: () => void };
  config?: {
    display: {
      blocks: Record<
        string,
        {
          name: string;
          instruments: Array<{ method: "upi" | "card" | "netbanking" }>;
        }
      >;
      sequence: string[];
      preferences: { show_default_blocks: boolean };
    };
  };
};
type RazorpayCheckout = {
  open: () => void;
  on: (event: "payment.failed", callback: (response: { error?: { description?: string } }) => void) => void;
};
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout;
  }
}

const methods = PAYMENT_METHODS;
const defaultPaymentMethod =
  methods.find((item) => isPaymentMethodEnabled(item.id))?.id ?? "upi";

const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

const trustCards = [
  {
    title: "Secure Checkout",
    detail: "Protected payment routing with verified processing flows.",
    icon: "shield",
    tone: "from-cyan-500/20 via-blue-500/10 to-white/70",
  },
  {
    title: "Instant Credit Update",
    detail: "Wallet balance refreshes quickly after successful verification.",
    icon: "spark",
    tone: "from-emerald-500/20 via-teal-500/10 to-white/70",
  },
  {
    title: "Payment Support",
    detail: "Assistance is available whenever a payment step needs attention.",
    icon: "support",
    tone: "from-pink-500/20 via-violet-500/10 to-white/70",
  },
  {
    title: "Transaction History",
    detail: "Every wallet movement remains visible for clear reconciliation.",
    icon: "history",
    tone: "from-amber-400/20 via-orange-400/10 to-white/70",
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
  const iconClassName = active ? "text-white" : "text-[#4f6daa]";

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
  if (status === "completed") {
    return "bg-emerald-100/80 text-emerald-700 ring-emerald-500/20";
  }
  if (status === "pending") {
    return "bg-amber-100/80 text-amber-700 ring-amber-500/20";
  }
  return "bg-rose-100/80 text-rose-700 ring-rose-500/20";
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
      className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-xl font-bold text-[#07152f]">{value}</p>
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

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
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
    const requested = searchParams.get("method");
    return isPaymentMethod(requested) && isPaymentMethodEnabled(requested)
      ? requested
      : defaultPaymentMethod;
  });
  const [amountInput, setAmountInput] = useState(() => cleanAmountInput(searchParams.get("amount") || ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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

  async function startPayment(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!isPaymentMethodEnabled(method)) {
      setError(paymentMethodUnavailableMessage(method));
      return;
    }
    setLoading(true);
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setError("Secure checkout could not be loaded. Please try again.");
      setLoading(false);
      return;
    }
    const response = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, method }),
    });
    const payload = (await response.json()) as {
      data?: {
        keyId: string;
        orderId: string;
        amount: number;
        currency: string;
        email: string;
      };
      error?: string;
    };
    if (!response.ok || !payload.data) {
      setError(payload.error || "Unable to initialize payment.");
      setLoading(false);
      return;
    }
    const razorpayMethod = razorpayMethodFor(method);
    const selectedMethodLabel = paymentMethodLabel(method);
    const checkout = new window.Razorpay({
      key: payload.data.keyId,
      amount: payload.data.amount,
      currency: payload.data.currency,
      name: "SocialRUSH Wallet",
      description: `Add ${money(amount)} to campaign wallet`,
      order_id: payload.data.orderId,
      prefill: { email: payload.data.email || initial.email },
      theme: { color: "#2563eb" },
      config: {
        display: {
          blocks: {
            selected_method: {
              name: `Pay via ${selectedMethodLabel}`,
              instruments: [{ method: razorpayMethod }],
            },
          },
          sequence: ["block.selected_method"],
          preferences: { show_default_blocks: false },
        },
      },
      modal: { ondismiss: () => setLoading(false) },
      handler: async (result) => {
        const verification = await fetch("/api/razorpay/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
        });
        const verified = (await verification.json()) as {
          data?: { balance: number };
          error?: string;
        };
        setLoading(false);
        if (!verification.ok || !verified.data) {
          setError(verified.error || "Payment verification failed.");
          return;
        }
        const updatedBalance = Number(verified.data.balance);
        setBalance(updatedBalance);
        window.dispatchEvent(
          new CustomEvent("wallet-balance-updated", { detail: updatedBalance }),
        );
        setSuccess(true);
        window.setTimeout(() => setSuccess(false), 3500);
        if (returnTo) {
          const separator = returnTo.includes("?") ? "&" : "?";
          router.replace(`${returnTo}${separator}resume=1`);
          return;
        }
        router.refresh();
      },
    });
    checkout.on("payment.failed", (result) => {
      setLoading(false);
      setError(
        method === "international_card"
          ? "International payments are currently being activated. Please contact WhatsApp support."
          : result.error?.description || "Payment could not be completed. Please try again.",
      );
    });
    checkout.open();
  }

  const stats = [
    {
      label: "Current Balance",
      value: balance,
      money: true,
      note: "Available campaign budget",
      icon: "balance",
      tone: "from-blue-600 to-blue-700",
    },
    {
      label: "Total Deposits",
      value: initial.totalDeposits,
      money: true,
      note: "Lifetime wallet funding",
      icon: "deposit",
      tone: "from-emerald-500 to-teal-600",
    },
    {
      label: "Total Spent",
      value: initial.totalSpent,
      money: true,
      note: "Campaign investment",
      icon: "spent",
      tone: "from-cyan-500 to-blue-600",
    },
    {
      label: "Pending Payments",
      value: initial.pendingPayments,
      money: false,
      note: "Awaiting confirmation",
      icon: "pending",
      tone: "from-amber-400 to-orange-500",
    },
  ];

  const selectedMethod = methods.find((item) => item.id === method) ?? methods[0];
  const selectedStatus = loading
    ? "Processing"
    : amount >= minimumAmount
      ? "Ready"
      : "Minimum amount required";

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-hidden bg-[linear-gradient(165deg,#f0f9ff_0%,#fdf4ff_28%,#fff1f8_55%,#f5f3ff_82%,#ecfeff_100%)] px-4 pb-32 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute bottom-24 left-1/3 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1650px] min-w-0">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/58 p-5 shadow-[0_30px_90px_-40px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-7 xl:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.6),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,.12),transparent_28%)]" />
          <motion.div
            aria-hidden
            animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-6 top-8 hidden h-24 w-24 rounded-[1.75rem] border border-white/60 bg-white/40 text-[#5a75ab] shadow-[0_24px_40px_-24px_rgba(79,108,168,.45)] backdrop-blur-xl sm:block"
          >
            <div className="grid h-full w-full place-items-center">
              <WalletGlyph />
            </div>
          </motion.div>

          <div className="relative">
            <div className="min-w-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="inline-flex rounded-full border border-blue-200/80 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-blue-700 shadow-[0_10px_24px_rgba(89,114,172,.08)]">
                    Financial command center
                  </span>
                  <h1 className="mt-4 text-[clamp(2rem,6vw,3.75rem)] font-black leading-[1.02] tracking-[-0.04em] text-[#07152f]">
                    SocialRUSH Wallet
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#59709b] sm:text-[15px]">
                    Manage campaign funds, payments, spending, and transaction
                    activity securely.
                  </p>
                  <p className="mt-2 max-w-2xl text-xs font-semibold text-[#59709b]">
                    {getCurrencyDisclaimer()}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200/70 bg-white/75 px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 shadow-[0_16px_36px_-24px_rgba(16,185,129,.45)] backdrop-blur-xl">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                  Payments operational
                </div>
              </div>

            </div>
          </div>
        </motion.section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -5 }}
              className={`relative min-w-0 overflow-hidden rounded-[1.35rem] border border-white/65 bg-gradient-to-br p-4 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,.48)] sm:rounded-[1.75rem] sm:p-5 ${stat.tone}`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
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
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 sm:h-10 sm:w-10">
                  <StatIcon name={stat.icon} />
                </span>
              </div>
              <p className="relative mt-3 text-[9px] leading-4 text-white/70 sm:mt-4 sm:text-[10px]">
                {stat.note}
              </p>
            </motion.article>
          ))}
        </section>

        <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/62 shadow-[0_30px_80px_-40px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:rounded-[2rem]">
          <div className="border-b border-white/60 px-5 py-5 sm:px-6 xl:px-7">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">
              Add funds
            </p>
            <h2 className="mt-2 text-xl font-black text-[#07152f] sm:text-2xl">
              Fund your campaign wallet
            </h2>
            <p className="mt-1 text-sm text-[#647aa6]">
              Choose a secure payment method and amount.
            </p>
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
                className="rounded-[1.35rem] border border-white/75 bg-[linear-gradient(145deg,rgba(255,255,255,.92),rgba(240,247,255,.82))] p-4 shadow-[0_26px_60px_-36px_rgba(15,23,42,.42)] sm:rounded-[1.75rem] sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6380b7]">
                      Payment methods
                    </p>
                    <p className="mt-2 text-base font-black text-[#15356f]">
                      Select a secure route
                    </p>
                  </div>
                  <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#6380b7] shadow-sm">
                    {methods.filter((item) => isPaymentMethodEnabled(item.id)).length} active
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:mt-5 xl:grid-cols-4">
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
                        className={`group relative min-h-20 overflow-hidden rounded-[1.25rem] border p-3.5 text-left shadow-[0_18px_40px_-28px_rgba(30,58,138,.35)] transition sm:rounded-[1.5rem] sm:p-4 ${
                          active
                            ? "border-transparent bg-[linear-gradient(white,white)_padding-box,linear-gradient(135deg,rgba(255,102,178,.75),rgba(79,209,255,.75),rgba(139,92,246,.72))_border-box]"
                            : enabled
                              ? "border-white/80 bg-white/78 hover:border-[#cfe0ff]"
                              : "cursor-not-allowed border-slate-200/80 bg-slate-100/70 opacity-70"
                        }`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,209,255,.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,102,178,.14),transparent_32%)] opacity-0 transition group-hover:opacity-100" />
                        <div className="relative flex items-start gap-3">
                          <span
                            className={`grid h-11 w-11 shrink-0 place-items-center rounded-[1.1rem] border shadow-[0_14px_30px_-20px_rgba(30,58,138,.35)] sm:h-12 sm:w-12 sm:rounded-[1.2rem] ${
                              active
                                ? "border-transparent bg-gradient-to-br from-[#ff67b2] via-[#8b8dff] to-[#46c3ff]"
                                : "border-white/80 bg-[#eef4ff]"
                            }`}
                          >
                            <PaymentMethodIcon methodId={item.id} active={active} />
                          </span>

                          <span className="min-w-0">
                            <b className="block text-sm font-black text-[#16346c]">
                              {item.label}
                            </b>
                            <small className="mt-1.5 block text-xs leading-5 text-[#6a82af]">
                              {item.description}
                            </small>
                            {!enabled ? (
                              <small className="mt-2 block text-[10px] font-bold leading-4 text-amber-700">
                                {paymentMethodUnavailableMessage(item.id)}
                              </small>
                            ) : item.id === "international_card" ? (
                              <small className="mt-2 block text-[10px] font-bold leading-4 text-[#6a82af]">
                                Requires international payments enabled in Razorpay.
                              </small>
                            ) : null}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-[1.35rem] border border-white/75 bg-[linear-gradient(145deg,rgba(255,255,255,.92),rgba(240,247,255,.82))] p-4 shadow-[0_26px_60px_-36px_rgba(15,23,42,.42)] sm:rounded-[1.75rem] sm:p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6380b7]">
                      Amount
                    </p>
                    <p className="mt-2 text-base font-black text-[#15356f]">
                      Custom amount
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-[#6882b5]">
                    Minimum {returnTo ? "required order amount" : "100"} · Maximum 500000
                  </p>
                </div>

                <div className="mt-4 rounded-[1.3rem] border border-white/80 bg-white/82 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.7),0_18px_42px_-30px_rgba(76,106,170,.4)] sm:mt-5 sm:rounded-[1.7rem] sm:p-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#7b92bc]">
                    Custom amount
                  </label>
                  <div className="relative mt-3">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-xl border border-white/80 bg-[#eef4ff] px-3 py-2 text-sm font-black text-[#4f6daa] shadow-sm">
                      ₹
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amountInput}
                      onChange={(event) => setAmountInput(cleanAmountInput(event.target.value))}
                      placeholder="1000"
                      className="h-14 w-full rounded-[1.2rem] border border-[#d6e4ff] bg-white pl-20 pr-4 text-xl font-black tracking-[-0.03em] text-[#16346c] outline-none transition focus:border-[#8faeff] focus:shadow-[0_0_0_5px_rgba(143,174,255,.18),0_18px_42px_-28px_rgba(79,108,168,.4)] sm:h-16 sm:rounded-[1.5rem] sm:pr-5 sm:text-2xl"
                    />
                  </div>
                    <p className="mt-2 text-xs font-semibold text-[#6882b5]">
                      Amount is charged in INR. {currency !== "INR" ? `Approx in ${currency}: ${money(amount)}.` : ""}
                    </p>

                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-6">
                    {quickAmounts.map((value) => {
                      const active = amount === value;
                      return (
                        <motion.button
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          key={value}
                          onClick={() => setAmountInput(String(value))}
                          className={`min-h-11 rounded-xl border px-2 py-3 text-center text-xs font-black shadow-[0_16px_32px_-24px_rgba(30,58,138,.35)] transition sm:rounded-2xl sm:px-3 ${
                            active
                              ? "border-transparent bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-white"
                              : "border-white/85 bg-white text-[#5470a3] hover:border-[#c8d9ff] hover:text-[#1e3d77]"
                          }`}
                        >
                          {money(value)}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.section>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm font-semibold text-rose-700 shadow-[0_16px_36px_-28px_rgba(244,63,94,.35)]"
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
                <div className="overflow-hidden rounded-[1.9rem] border border-transparent bg-[linear-gradient(rgba(255,255,255,.88),rgba(255,255,255,.88))_padding-box,linear-gradient(135deg,rgba(255,102,178,.62),rgba(79,209,255,.62),rgba(139,92,246,.62))_border-box] p-[1px] shadow-[0_34px_80px_-42px_rgba(15,23,42,.55)]">
                  <div className="rounded-[1.45rem] bg-[linear-gradient(160deg,rgba(255,255,255,.94),rgba(241,247,255,.86))] p-4 backdrop-blur-2xl sm:rounded-[1.85rem] sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6380b7]">
                          Payment summary
                        </p>
                        <h3 className="mt-2 text-xl font-black text-[#15356f]">
                          Final review
                        </h3>
                      </div>
                      <div className="grid h-12 w-12 place-items-center rounded-[1.25rem] bg-gradient-to-br from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-white shadow-[0_18px_40px_-22px_rgba(117,109,255,.55)]">
                        <WalletGlyph />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5 text-xs text-[#46639a] sm:mt-5 sm:space-y-3 sm:text-sm">
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/75 bg-white/75 px-3 py-3 sm:gap-4 sm:rounded-2xl sm:px-4">
                        <span className="font-semibold">Selected amount</span>
                        <span className="text-right font-black text-[#15356f]">
                          {money(amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/75 bg-white/75 px-3 py-3 sm:gap-4 sm:rounded-2xl sm:px-4">
                        <span className="font-semibold">Payment method</span>
                        <span className="text-right font-black text-[#15356f]">
                          {selectedMethod.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/75 bg-white/75 px-3 py-3 sm:gap-4 sm:rounded-2xl sm:px-4">
                        <span className="font-semibold">Wallet balance</span>
                        <span className="text-right font-black text-[#15356f]">
                          {money(balance)}
                        </span>
                      </div>
                      {currency !== "INR" ? (
                        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/75 bg-white/75 px-3 py-3 sm:gap-4 sm:rounded-2xl sm:px-4">
                          <span className="font-semibold">Wallet base (INR)</span>
                          <span className="text-right font-black text-[#15356f]">
                            {formatCurrency(balance, "INR")}
                          </span>
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/75 bg-white/75 px-3 py-3 sm:gap-4 sm:rounded-2xl sm:px-4">
                        <span className="font-semibold">Final payable amount</span>
                        <span className="text-right font-black text-[#15356f]">
                          {money(amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/75 bg-white/75 px-3 py-3 sm:gap-4 sm:rounded-2xl sm:px-4">
                        <span className="font-semibold">Status</span>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${loading ? "bg-blue-100 text-blue-700" : amount >= minimumAmount ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {selectedStatus}
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={loading || amount < minimumAmount || !isPaymentMethodEnabled(method)}
                      className="mt-5 min-h-14 w-full rounded-[1.2rem] bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-4 text-sm font-black text-white shadow-[0_24px_50px_-22px_rgba(117,109,255,.58)] transition hover:-translate-y-1 hover:shadow-[0_28px_58px_-20px_rgba(117,109,255,.68)] disabled:opacity-50 sm:rounded-[1.35rem] sm:px-5"
                    >
                      {loading
                        ? "Opening secure checkout..."
                        : `Continue securely · ${money(amount)}`}
                    </button>
                  </div>
                </div>

                <div className="hidden rounded-[1.7rem] border border-white/80 bg-[#07152f]/94 p-5 text-white shadow-[0_30px_70px_-36px_rgba(7,21,47,.7)] backdrop-blur-xl xl:block">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
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
                            className={`relative z-10 grid h-10 w-10 place-items-center rounded-2xl text-sm font-black ${item.tone === "emerald" ? "bg-emerald-400/15 text-emerald-300" : "bg-blue-400/15 text-blue-300"}`}
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

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trustCards.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              className={`rounded-[1.7rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,.88),rgba(255,255,255,.7))] p-5 shadow-[0_24px_54px_-34px_rgba(15,23,42,.35)] ${item.tone}`}
            >
              <span className="grid h-12 w-12 place-items-center rounded-[1.2rem] border border-white/75 bg-white/75 text-[#5470a3] shadow-[0_16px_34px_-22px_rgba(76,106,170,.35)]">
                <FeatureIcon name={item.icon} />
              </span>
              <h3 className="mt-4 text-base font-black text-[#15356f]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#6480b2]">
                {item.detail}
              </p>
            </motion.article>
          ))}
        </section>

        <section className="mt-6">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">
              Wallet analytics
            </p>
            <h2 className="mt-1 text-xl font-black text-[#07152f]">
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
              color="bg-blue-500"
            />
            <MiniChart
              title="Order activity"
              value={`${series.reduce((sum, item) => sum + item.orders, 0)} campaigns`}
              data={series.map((item) => item.orders)}
              color="bg-violet-500"
            />
          </div>
          <div className="mt-2 flex justify-around px-4 text-[8px] font-semibold uppercase text-slate-400">
            {series.map((item) => (
              <span key={item.key}>{item.label}</span>
            ))}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 shadow-[0_28px_70px_-40px_rgba(15,23,42,.4)] backdrop-blur-2xl">
          <div className="flex flex-col gap-3 border-b border-white/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">
                Transaction history
              </p>
              <h2 className="mt-2 text-xl font-black text-[#07152f]">
                All wallet movements
              </h2>
            </div>
            <span className="inline-flex w-fit rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5d79ab] shadow-sm">
              {initial.transactions.length} records
            </span>
          </div>
          <div className="grid gap-4 p-4 sm:p-5 lg:hidden">
            {initial.transactions.map((item) => (
              <motion.article
                key={item.id}
                whileHover={{ y: -3 }}
                className="rounded-[1.5rem] border border-white/80 bg-white/80 p-4 shadow-[0_20px_46px_-30px_rgba(15,23,42,.32)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-[#1c3c76]">
                      #{item.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-[11px] text-[#6c84b0]">
                      {new Date(item.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ring-inset ${statusBadgeClass(item.status)}`}>
                    <i className="h-1.5 w-1.5 rounded-full bg-current" />
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#f7faff] px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7c92bc]">
                      Payment Method
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#17366f]">
                      {paymentMethodLabel(item.payment_method || item.description || item.type)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f7faff] px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7c92bc]">
                      Amount
                    </p>
                    <p className={`mt-2 text-sm font-black ${item.type === "debit" ? "text-[#17366f]" : "text-emerald-600"}`}>
                      {item.type === "debit" ? "-" : "+"}
                      {money(item.amount)}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
            {initial.transactions.length === 0 && (
              <div className="rounded-[1.5rem] border border-white/80 bg-white/80 p-10 text-center text-sm text-[#6c84b0] shadow-[0_20px_46px_-30px_rgba(15,23,42,.32)]">
                No transactions yet.
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-white/70 text-[10px] uppercase tracking-[0.18em] text-[#7b92bc]">
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
              <tbody className="divide-y divide-white/70">
                {initial.transactions.map((item) => (
                  <tr key={item.id} className="bg-white/20 transition hover:bg-white/45">
                    <td className="px-6 py-4 font-black text-[#1c3c76]">
                      #{item.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-[#6c84b0]">
                      {new Date(item.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#17366f]">
                      {paymentMethodLabel(item.payment_method || item.description || item.type)}
                    </td>
                    <td className={`px-6 py-4 font-black ${item.type === "debit" ? "text-[#17366f]" : "text-emerald-600"}`}>
                      {item.type === "debit" ? "-" : "+"}
                      {money(item.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ring-inset ${statusBadgeClass(item.status)}`}>
                        <i className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {initial.transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-14 text-center text-[#6c84b0]">
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
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
              className="w-full max-w-sm rounded-[2rem] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,.96),rgba(239,247,255,.9))] p-8 text-center shadow-[0_36px_90px_-40px_rgba(15,23,42,.7)]"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.15 }}
                className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-3xl text-emerald-600 shadow-[0_20px_40px_-20px_rgba(16,185,129,.6)]"
              >
                ✓
              </motion.span>
              <h2 className="mt-5 text-2xl font-black text-[#15356f]">Wallet funded!</h2>
              <p className="mt-2 text-sm text-[#6c84b0]">
                {money(amount)} was added successfully.
              </p>
              <p className="mt-5 rounded-2xl bg-white/80 p-3 text-sm font-black text-blue-600 shadow-[0_16px_36px_-26px_rgba(79,108,168,.35)]">
                New balance: {money(balance)}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
