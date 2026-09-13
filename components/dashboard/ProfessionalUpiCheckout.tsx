"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const DEFAULT_WHATSAPP_URL = "https://wa.me/918860330771";
const ACTIVE_ROUTES = new Set(["/dashboard/new-order", "/dashboard/order-summary"]);
const CASHFREE_ERROR_PATTERNS = [/unable to initialize secure payment/i, /preparing secure payment/i, /preparing secure checkout/i];

type OrderSnapshot = { serviceCode: string; platform: string; service: string; quantity: number; link: string };
type CheckoutIntent = { id: string; total: number; currency: string };

function titleCaseService(code: string) {
  return code.split("-").filter(Boolean).map((word) => {
    const lower = word.toLowerCase();
    const special: Record<string, string> = { youtube: "YouTube", linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", telegram: "Telegram", tiktok: "TikTok", twitter: "Twitter", usa: "USA", x: "X" };
    return special[lower] || lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(" ");
}

function findInputValue(root: ParentNode, labelPattern: RegExp) {
  const label = Array.from(root.querySelectorAll("label")).find((item) => labelPattern.test(item.textContent || ""));
  return label?.querySelector<HTMLInputElement>("input, textarea")?.value?.trim() || "";
}

function findSummaryValue(root: ParentNode, labelPattern: RegExp) {
  const label = Array.from(root.querySelectorAll("span, p, dt, div")).find((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    return text.length < 80 && labelPattern.test(text);
  });
  const parent = label?.parentElement;
  if (!label || !parent) return "";
  const sibling = Array.from(parent.children).find((child) => child !== label && (child.textContent || "").trim());
  if (sibling) return (sibling.textContent || "").replace(/\s+/g, " ").trim();
  return (parent.textContent || "").replace((label.textContent || ""), "").replace(/\s+/g, " ").trim();
}

function readOrderSnapshot(): OrderSnapshot | null {
  const root = document.querySelector("main") || document.body;
  const params = new URLSearchParams(window.location.search);
  const serviceCode = params.get("service") || "";
  const quantityRaw = params.get("quantity") || root.querySelector<HTMLInputElement>('input[inputmode="numeric"]')?.value?.trim() || findSummaryValue(root, /^quantity$/i);
  const quantity = Number(String(quantityRaw).replace(/,/g, ""));
  const link = params.get("link") || findInputValue(root, /public link|campaign link|username/i) || findSummaryValue(root, /^public link$/i);
  if (!serviceCode || !Number.isInteger(quantity) || quantity <= 0 || !link) return null;
  const platformRaw = params.get("platform") || serviceCode.split("-")[0] || findSummaryValue(root, /^platform$/i);
  return { serviceCode, platform: titleCaseService(platformRaw || "Other"), service: findSummaryValue(root, /^service$/i) || titleCaseService(serviceCode), quantity, link };
}

function checkoutButton(element: Element) {
  const control = element.closest<HTMLElement>("button, a");
  if (!control) return null;
  if (control.dataset.temporaryCheckout === "true") return control;
  const text = (control.textContent || "").replace(/\s+/g, " ").trim();
  const matches = /^place order$/i.test(text) || /^place order securely$/i.test(text) || /^pay .+ and place order$/i.test(text) || /^pay .+ & place order$/i.test(text) || /^pay .+ and continue$/i.test(text) || /^pay .+ & continue$/i.test(text) || /^continue to payment$/i.test(text) || /^place order on whatsapp$/i.test(text) || /^pay via upi$/i.test(text) || /^pay securely with upi$/i.test(text);
  return matches ? control : null;
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
  return configured && /^https:\/\/wa\.me\/\d+/i.test(configured) ? configured.split("?")[0] : DEFAULT_WHATSAPP_URL;
}

export default function ProfessionalUpiCheckout() {
  const pathname = usePathname();
  const router = useRouter();
  const active = ACTIVE_ROUTES.has(pathname);
  const upiId = process.env.NEXT_PUBLIC_UPI_ID?.trim() || "";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME?.trim() || "SocialRUSH";
  const upiConfigured = Boolean(upiId);
  const [open, setOpen] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [snapshot, setSnapshot] = useState<OrderSnapshot | null>(null);
  const [intent, setIntent] = useState<CheckoutIntent | null>(null);
  const [clientRequestId, setClientRequestId] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{ id: string; public_order_id: string } | null>(null);

  const amountLabel = intent ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(intent.total) : "";
  const upiHref = useMemo(() => {
    if (!intent || !paymentReference || !upiConfigured) return "";
    const params = new URLSearchParams({ pa: upiId, pn: payeeName, am: intent.total.toFixed(2), cu: "INR", tr: paymentReference, tn: `SocialRUSH ${paymentReference}` });
    return `upi://pay?${params.toString()}`;
  }, [intent, payeeName, paymentReference, upiConfigured, upiId]);

  useEffect(() => {
    if (!active) return;
    const prepare = () => {
      for (const control of Array.from(document.querySelectorAll<HTMLElement>("button, a"))) {
        const match = checkoutButton(control);
        if (!match) continue;
        match.dataset.temporaryCheckout = "true";
        const label = upiConfigured ? "Pay securely with UPI" : "Place Order on WhatsApp";
        match.setAttribute("aria-label", label);
        if (!(match instanceof HTMLButtonElement && match.disabled) && (match.textContent || "").trim() !== label) match.textContent = label;
      }
      for (const element of Array.from(document.querySelectorAll<HTMLElement>("p, div"))) {
        const text = (element.textContent || "").replace(/\s+/g, " ").trim();
        if (text.length <= 180 && CASHFREE_ERROR_PATTERNS.some((pattern) => pattern.test(text))) element.style.display = "none";
      }
    };
    let scheduled = false;
    const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(() => { scheduled = false; prepare(); }); } };
    prepare();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const onClick = async (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = checkoutButton(target);
      if (!control || (control instanceof HTMLButtonElement && control.disabled)) return;
      event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
      const current = readOrderSnapshot();
      if (!current) { setError("Please complete the service, quantity and link before continuing."); return; }
      if (!upiConfigured) {
        const message = `Hi SocialRUSH 👋\nI want to place an order.\n\nPlatform: ${current.platform}\nService: ${current.service}\nQuantity: ${current.quantity}\nLink: ${current.link}\n\nPlease share payment details to complete my order.`;
        window.location.assign(`${whatsappBase()}?text=${encodeURIComponent(message)}`); return;
      }
      setError(""); setLoading(true); setSnapshot(current); setSuccessOrder(null); setPaymentStarted(false);
      try {
        const fingerprint = `${current.serviceCode}:${current.quantity}:${current.link}`;
        const requestId = getSessionValue(`socialrush-upi-request:${fingerprint}`, () => crypto.randomUUID());
        const reference = getSessionValue(`socialrush-upi-ref:${fingerprint}`, () => { const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, ""); return `SR-${stamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; });
        const response = await fetch("/api/checkout/intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceCode: current.serviceCode, quantity: current.quantity, link: current.link, clientRequestId: requestId, packageName: "Custom", notes: null }) });
        const payload = await response.json() as { data?: CheckoutIntent; error?: string };
        if (!response.ok || !payload.data) throw new Error(payload.error || "Unable to prepare payment.");
        setClientRequestId(requestId); setPaymentReference(reference); setIntent(payload.data); setUtr(""); setOpen(true);
      } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to prepare payment."); }
      finally { setLoading(false); }
    };
    document.addEventListener("click", onClick, true);
    return () => { observer.disconnect(); document.removeEventListener("click", onClick, true); };
  }, [active, upiConfigured]);

  async function submitUtr() {
    if (!snapshot || !intent) return;
    const cleanUtr = utr.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9-]{8,40}$/.test(cleanUtr)) { setError("Enter the UTR / Transaction ID from your successful UPI payment."); return; }
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/orders/manual-upi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intentId: intent.id, clientRequestId, paymentReference, utr: cleanUtr }) });
      const payload = await response.json() as { data?: { id: string; public_order_id: string }; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error || "Unable to confirm your order.");
      setSuccessOrder(payload.data); window.setTimeout(() => router.push("/dashboard/orders"), 2200);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to confirm your order."); }
    finally { setSubmitting(false); }
  }

  if (!active) return null;
  return (
    <>
      {!open && error ? <div className="mx-auto my-2 max-w-xl rounded-xl bg-red-500/10 px-4 py-3 text-center text-xs font-semibold text-red-200">{error}</div> : null}
      {open && snapshot && intent ? (
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
                  <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">Secure UPI Checkout</p><h2 className="mt-2 text-3xl font-black">Pay {amountLabel}</h2></div>
                  <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300">Close</button>
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm">
                  <div className="grid gap-2 sm:grid-cols-2"><p><span className="text-zinc-500">Service:</span> <strong>{snapshot.service}</strong></p><p><span className="text-zinc-500">Quantity:</span> <strong>{snapshot.quantity.toLocaleString("en-IN")}</strong></p><p className="sm:col-span-2 break-all"><span className="text-zinc-500">Link:</span> {snapshot.link}</p></div>
                </div>
                <div className="mt-5 text-center"><p className="text-sm font-bold">Pay securely with UPI</p><p className="mt-1 text-xs text-zinc-400">PhonePe • Google Pay • Paytm • Other UPI apps</p></div>
                {upiHref ? <a href={upiHref} onClick={() => setPaymentStarted(true)} className="mt-5 block w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 text-center text-base font-black text-black">Pay {amountLabel}</a> : null}
                <p className="mt-3 text-center text-xs text-zinc-500">Secure UPI payment • Exact amount prefilled</p>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Complete your order</p><h2 className="mt-2 text-2xl font-black">Payment completed? ✓</h2></div><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300">Close</button></div>
                <p className="mt-3 text-sm leading-6 text-zinc-300">Enter the UTR / Transaction ID from your UPI app to confirm your order.</p>
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <label htmlFor="manual-upi-utr" className="text-sm font-black">UTR / Transaction ID</label>
                  <input id="manual-upi-utr" value={utr} onChange={(event) => setUtr(event.target.value.slice(0, 40))} placeholder="Enter transaction ID" className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base outline-none focus:border-orange-400" />
                  <details className="mt-3 text-xs text-zinc-400"><summary className="cursor-pointer font-semibold text-orange-300">Where can I find my UTR?</summary><p className="mt-2 leading-5">Open your UPI app → Transaction History → open this successful payment → copy the UTR / Transaction ID.</p></details>
                  {error ? <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-200">{error}</p> : null}
                  <button type="button" disabled={submitting} onClick={() => void submitUtr()} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 text-base font-black text-black disabled:opacity-50">{submitting ? "Confirming…" : "Confirm My Order"}</button>
                  <button type="button" onClick={() => setPaymentStarted(false)} className="mt-3 w-full py-2 text-xs font-semibold text-zinc-400">Need to pay? Go back</button>
                  <a href={`${whatsappBase()}?text=${encodeURIComponent(`Hi SocialRUSH, I need help with UPI payment reference ${paymentReference}.`)}`} target="_blank" rel="noopener noreferrer" className="mt-2 block text-center text-xs font-bold text-emerald-300">Need help? Contact WhatsApp Support</a>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
