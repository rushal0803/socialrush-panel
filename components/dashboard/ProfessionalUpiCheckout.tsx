"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics/events";

const DEFAULT_WHATSAPP_URL = "https://wa.me/918860330771";

type OrderSnapshot = {
  serviceCode: string;
  platform: string;
  service: string;
  quantity: number;
  link: string;
};

type CheckoutIntent = {
  id: string;
  total: number;
  currency: string;
};

function titleCaseService(code: string) {
  return code
    .split("-")
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      const special: Record<string, string> = {
        youtube: "YouTube",
        linkedin: "LinkedIn",
        instagram: "Instagram",
        facebook: "Facebook",
        telegram: "Telegram",
        tiktok: "TikTok",
        twitter: "Twitter",
        usa: "USA",
        x: "X",
      };
      return special[lower] || lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function getSessionValue(key: string, factory: () => string) {
  const current = sessionStorage.getItem(key);
  if (current) return current;
  const created = factory();
  sessionStorage.setItem(key, created);
  return created;
}

function whatsappBase() {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
  return configured && /^https:\/\/wa\.me\/\d+/i.test(configured)
    ? configured.split("?")[0]
    : DEFAULT_WHATSAPP_URL;
}

export default function ProfessionalUpiCheckout() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const upiId = process.env.NEXT_PUBLIC_UPI_ID?.trim() || "";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME?.trim() || "SocialRUSH";

  const snapshot = useMemo<OrderSnapshot | null>(() => {
    if (pathname !== "/dashboard/order-summary") return null;

    const serviceCode = searchParams.get("service")?.trim() || "";
    const quantity = Number((searchParams.get("quantity") || "").replace(/,/g, ""));
    const link = searchParams.get("link")?.trim() || "";
    if (!serviceCode || !Number.isInteger(quantity) || quantity <= 0 || !link) return null;

    const platformCode = serviceCode.split("-")[0] || "other";
    return {
      serviceCode,
      platform: titleCaseService(platformCode),
      service: titleCaseService(serviceCode),
      quantity,
      link,
    };
  }, [pathname, searchParams]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [intent, setIntent] = useState<CheckoutIntent | null>(null);
  const [clientRequestId, setClientRequestId] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{ id: string; public_order_id: string } | null>(null);

  const amountLabel = intent
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(intent.total)
    : "";

  const upiHref = useMemo(() => {
    if (!intent || !paymentReference || !upiId) return "";
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: intent.total.toFixed(2),
      cu: "INR",
      tr: paymentReference,
      tn: `SocialRUSH ${paymentReference}`,
    });
    return `upi://pay?${params.toString()}`;
  }, [intent, payeeName, paymentReference, upiId]);

  async function beginCheckout() {
    if (!snapshot || loading) return;
    setError("");
    setLoading(true);
    setSuccessOrder(null);
    setPaymentStarted(false);

    track("checkout_started", {
      service_code: snapshot.serviceCode,
      platform: snapshot.platform,
      method: upiId ? "upi" : "whatsapp",
      step: "native_checkout",
    });

    if (!upiId) {
      const message = `Hi SocialRUSH 👋\nI want to place an order.\n\nPlatform: ${snapshot.platform}\nService: ${snapshot.service}\nQuantity: ${snapshot.quantity}\nLink: ${snapshot.link}\n\nPlease share payment details to complete my order.`;
      window.location.assign(`${whatsappBase()}?text=${encodeURIComponent(message)}`);
      return;
    }

    try {
      const fingerprint = `${snapshot.serviceCode}:${snapshot.quantity}:${snapshot.link}`;
      const requestId = getSessionValue(
        `socialrush-upi-request:${fingerprint}`,
        () => crypto.randomUUID(),
      );
      const reference = getSessionValue(`socialrush-upi-ref:${fingerprint}`, () => {
        const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        return `SR-${stamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      });

      const response = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceCode: snapshot.serviceCode,
          quantity: snapshot.quantity,
          link: snapshot.link,
          clientRequestId: requestId,
          packageName: "Custom",
          notes: null,
        }),
      });
      const payload = (await response.json()) as { data?: CheckoutIntent; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error || "Unable to prepare payment.");

      setClientRequestId(requestId);
      setPaymentReference(reference);
      setIntent(payload.data);
      setUtr("");
      setOpen(true);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to prepare payment.";
      setError(message);
      track("checkout_error", {
        service_code: snapshot.serviceCode,
        platform: snapshot.platform,
        method: "upi",
        step: "intent",
        error_category: "intent_failed",
      });
    } finally {
      setLoading(false);
    }
  }

  async function submitUtr() {
    if (!snapshot || !intent) return;
    const cleanUtr = utr.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9-]{8,40}$/.test(cleanUtr)) {
      setError("Enter the UTR / Transaction ID from your successful UPI payment.");
      return;
    }

    setSubmitting(true);
    setError("");
    track("utr_submitted", {
      service_code: snapshot.serviceCode,
      platform: snapshot.platform,
      method: "upi",
      step: "verification",
    });

    try {
      const response = await fetch("/api/orders/manual-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentId: intent.id,
          clientRequestId,
          paymentReference,
          utr: cleanUtr,
        }),
      });
      const payload = (await response.json()) as {
        data?: { id: string; public_order_id: string };
        error?: string;
      };
      if (!response.ok || !payload.data) throw new Error(payload.error || "Unable to confirm your order.");

      setSuccessOrder(payload.data);
      window.setTimeout(() => router.push("/dashboard/orders"), 2200);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to confirm your order.";
      setError(message);
      track("checkout_error", {
        service_code: snapshot.serviceCode,
        platform: snapshot.platform,
        method: "upi",
        step: "verification",
        error_category: "utr_confirmation_failed",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!snapshot) return null;

  return (
    <>
      <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-orange-200 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">Direct UPI checkout</p>
            <p className="mt-1 text-sm font-black text-[#0B0B0F]">Pay directly by UPI — no wallet top-up required</p>
            <p className="mt-1 text-xs font-medium text-[#4B5563]">Your exact order amount is prepared securely before your UPI app opens.</p>
          </div>
          <button
            type="button"
            onClick={() => void beginCheckout()}
            disabled={loading}
            className="min-h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-sm font-black text-black shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Preparing UPI..." : "Pay securely with UPI"}
          </button>
        </div>
        {!open && error ? (
          <p className="mt-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
        ) : null}
      </div>

      {open && intent ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 sm:items-center sm:p-4">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border border-orange-400/20 bg-[#0f131a] p-5 text-white shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6">
            {successOrder ? (
              <div className="py-7 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-3xl">✓</div>
                <h2 className="mt-4 text-2xl font-black">Order received successfully</h2>
                <p className="mt-2 text-sm text-zinc-300">We’re confirming your payment. You don’t need to pay again.</p>
                <p className="mt-3 text-sm font-bold text-orange-300">Order ID: {successOrder.public_order_id}</p>
                <button type="button" onClick={() => router.push("/dashboard/orders")} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 font-black text-black">View My Order</button>
              </div>
            ) : !paymentStarted ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">Secure UPI Checkout</p>
                    <h2 className="mt-2 text-3xl font-black">Pay {amountLabel}</h2>
                  </div>
                  <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300">Close</button>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <p><span className="text-zinc-500">Service:</span> <strong>{snapshot.service}</strong></p>
                    <p><span className="text-zinc-500">Quantity:</span> <strong>{snapshot.quantity.toLocaleString("en-IN")}</strong></p>
                    <p className="break-all sm:col-span-2"><span className="text-zinc-500">Link:</span> {snapshot.link}</p>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <p className="text-sm font-bold">Pay securely with UPI</p>
                  <p className="mt-1 text-xs text-zinc-400">PhonePe • Google Pay • Paytm • Other UPI apps</p>
                </div>

                {upiHref ? (
                  <a
                    href={upiHref}
                    onClick={() => {
                      setPaymentStarted(true);
                      track("payment_started", {
                        service_code: snapshot.serviceCode,
                        platform: snapshot.platform,
                        method: "upi",
                        currency: "INR",
                        step: "upi_app_opened",
                      });
                    }}
                    className="mt-5 block w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 text-center text-base font-black text-black"
                  >
                    Pay {amountLabel}
                  </a>
                ) : null}
                <p className="mt-3 text-center text-xs text-zinc-500">Exact amount prefilled • Never share your UPI PIN or OTP</p>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Complete your order</p>
                    <h2 className="mt-2 text-2xl font-black">Payment completed? ✓</h2>
                  </div>
                  <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300">Close</button>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-300">Enter the UTR / Transaction ID from your UPI app to confirm your order.</p>
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <label htmlFor="manual-upi-utr" className="text-sm font-black">UTR / Transaction ID</label>
                  <input
                    id="manual-upi-utr"
                    value={utr}
                    onChange={(event) => setUtr(event.target.value.slice(0, 40))}
                    placeholder="Enter transaction ID"
                    className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base outline-none focus:border-orange-400"
                  />
                  <details className="mt-3 text-xs text-zinc-400">
                    <summary className="cursor-pointer font-semibold text-orange-300">Where can I find my UTR?</summary>
                    <p className="mt-2 leading-5">Open your UPI app → Transaction History → open this successful payment → copy the UTR / Transaction ID.</p>
                  </details>
                  {error ? <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-200">{error}</p> : null}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void submitUtr()}
                    className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 font-black text-black disabled:opacity-60"
                  >
                    {submitting ? "Confirming..." : "Confirm Payment & Place Order"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
