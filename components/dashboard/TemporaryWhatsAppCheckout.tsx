"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const DEFAULT_WHATSAPP_URL = "https://wa.me/918860330771";
const ACTIVE_ROUTES = new Set(["/dashboard/new-order", "/dashboard/order-summary"]);
const CASHFREE_ERROR_PATTERNS = [
  /unable to initialize secure payment/i,
  /preparing secure payment/i,
  /preparing secure checkout/i,
];

type OrderSnapshot = {
  platform: string;
  service: string;
  quantity: string;
  link: string;
  totalLabel: string;
  totalAmount: string;
};

function titleCaseService(code: string) {
  return code
    .split("-")
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === "youtube") return "YouTube";
      if (lower === "linkedin") return "LinkedIn";
      if (lower === "instagram") return "Instagram";
      if (lower === "facebook") return "Facebook";
      if (lower === "telegram") return "Telegram";
      if (lower === "tiktok") return "TikTok";
      if (lower === "twitter") return "Twitter";
      if (lower === "usa") return "USA";
      if (lower === "x") return "X";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function platformLabel(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "x" || normalized === "twitter") return "X / Twitter";
  if (normalized === "youtube") return "YouTube";
  if (normalized === "linkedin") return "LinkedIn";
  if (normalized === "instagram") return "Instagram";
  if (normalized === "facebook") return "Facebook";
  if (normalized === "telegram") return "Telegram";
  if (normalized === "tiktok") return "TikTok";
  return titleCaseService(normalized);
}

function findInputValue(root: ParentNode, labelPattern: RegExp) {
  const labels = Array.from(root.querySelectorAll("label"));
  const label = labels.find((item) => labelPattern.test(item.textContent || ""));
  return label?.querySelector<HTMLInputElement>("input, textarea")?.value?.trim() || "";
}

function findSummaryValue(root: ParentNode, labelPattern: RegExp) {
  const nodes = Array.from(root.querySelectorAll("span, p, dt, div"));
  const label = nodes.find((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    return text.length < 80 && labelPattern.test(text);
  });
  if (!label) return "";
  const parent = label.parentElement;
  if (!parent) return "";

  const directChildren = Array.from(parent.children);
  const sibling = directChildren.find((child) => child !== label && (child.textContent || "").trim());
  if (sibling) return (sibling.textContent || "").replace(/\s+/g, " ").trim();

  const text = (parent.textContent || "").replace(/\s+/g, " ").trim();
  const labelText = (label.textContent || "").replace(/\s+/g, " ").trim();
  return text.replace(labelText, "").trim();
}

function findOrderTotal(root: ParentNode) {
  const nodes = Array.from(root.querySelectorAll("span, p, dt, div"));
  const label = nodes.find((node) => /^order total$/i.test((node.textContent || "").trim()));
  const text = label?.parentElement?.textContent || "";
  const match = text.match(/(?:₹\s*|INR\s*)[\d,]+(?:\.\d{1,2})?/i);
  const totalLabel = match?.[0]?.replace(/\s+/g, " ").trim() || "";
  const totalAmount = totalLabel.replace(/[^\d.]/g, "");
  return { totalLabel, totalAmount };
}

function readOrderSnapshot(): OrderSnapshot {
  const root = document.querySelector("main") || document.body;
  const params = new URLSearchParams(window.location.search);
  const serviceCode = params.get("service") || "";
  const rawPlatform =
    params.get("platform") ||
    serviceCode.split("-")[0] ||
    findSummaryValue(root, /^platform$/i) ||
    "";
  const quantity =
    params.get("quantity") ||
    root.querySelector<HTMLInputElement>('input[inputmode="numeric"]')?.value?.trim() ||
    findSummaryValue(root, /^quantity$/i) ||
    "";
  const link =
    params.get("link") ||
    findInputValue(root, /public link|campaign link|username/i) ||
    findSummaryValue(root, /^public link$/i) ||
    "";
  const summaryService = findSummaryValue(root, /^service$/i);
  const { totalLabel, totalAmount } = findOrderTotal(root);

  return {
    platform: rawPlatform ? platformLabel(rawPlatform) : "Not specified",
    service: serviceCode ? titleCaseService(serviceCode) : summaryService || "Not specified",
    quantity: quantity || "Not specified",
    link: link || "Not specified",
    totalLabel: totalLabel || "Please confirm",
    totalAmount,
  };
}

function checkoutButton(element: Element) {
  const control = element.closest<HTMLElement>("button, a");
  if (!control) return null;
  if (control.dataset.temporaryCheckout === "true") return control;

  const text = (control.textContent || "").replace(/\s+/g, " ").trim();
  const matches =
    /^place order$/i.test(text) ||
    /^place order securely$/i.test(text) ||
    /^pay .+ and place order$/i.test(text) ||
    /^pay .+ & place order$/i.test(text) ||
    /^pay .+ and continue$/i.test(text) ||
    /^pay .+ & continue$/i.test(text) ||
    /^continue to payment$/i.test(text);
  return matches ? control : null;
}

function whatsappBase() {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
  return configured && /^https:\/\/wa\.me\/\d+/i.test(configured)
    ? configured.split("?")[0]
    : DEFAULT_WHATSAPP_URL;
}

function createOrderReference(snapshot: OrderSnapshot) {
  const key = `socialrush-payment-ref:${snapshot.service}:${snapshot.quantity}:${snapshot.link}:${snapshot.totalAmount}`;
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  const reference = `SR-${stamp}-${suffix}`;
  sessionStorage.setItem(key, reference);
  return reference;
}

function buildVerificationWhatsapp(snapshot: OrderSnapshot, reference: string, utr: string) {
  const message = [
    "Hi SocialRUSH 👋",
    "I have completed my UPI payment and want it verified.",
    "",
    `Order Ref: ${reference}`,
    `Platform: ${snapshot.platform}`,
    `Service: ${snapshot.service}`,
    `Quantity: ${snapshot.quantity}`,
    `Link: ${snapshot.link}`,
    `Amount: ${snapshot.totalLabel}`,
    `UTR / Transaction ID: ${utr}`,
    "",
    "Please verify the payment and confirm my order.",
  ].join("\n");
  return `${whatsappBase()}?text=${encodeURIComponent(message)}`;
}

function prepareTemporaryCheckout(upiConfigured: boolean) {
  const label = upiConfigured ? "Pay via UPI" : "Place Order on WhatsApp";
  const controls = Array.from(document.querySelectorAll<HTMLElement>("button, a"));

  for (const control of controls) {
    const match = checkoutButton(control);
    if (!match) continue;
    if (match.dataset.temporaryCheckout !== "true") match.dataset.temporaryCheckout = "true";
    if (match.getAttribute("aria-label") !== label) match.setAttribute("aria-label", label);
    if (
      !(match instanceof HTMLButtonElement && match.disabled) &&
      (match.textContent || "").replace(/\s+/g, " ").trim() !== label
    ) {
      match.textContent = label;
    }
  }

  const possibleErrors = Array.from(document.querySelectorAll<HTMLElement>("p, div"));
  for (const element of possibleErrors) {
    const text = (element.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length > 180) continue;
    if (!CASHFREE_ERROR_PATTERNS.some((pattern) => pattern.test(text))) continue;
    if (element.dataset.temporaryPaymentHidden !== "true") {
      element.style.display = "none";
      element.dataset.temporaryPaymentHidden = "true";
    }
  }
}

export default function TemporaryWhatsAppCheckout() {
  const pathname = usePathname();
  const active = ACTIVE_ROUTES.has(pathname);
  const upiId = process.env.NEXT_PUBLIC_UPI_ID?.trim() || "";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME?.trim() || "SocialRUSH";
  const upiConfigured = Boolean(upiId);
  const [modalOpen, setModalOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<OrderSnapshot | null>(null);
  const [reference, setReference] = useState("");
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);

  const upiHref = useMemo(() => {
    if (!snapshot?.totalAmount || !upiConfigured) return "";
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: snapshot.totalAmount,
      cu: "INR",
      tr: reference || "SocialRUSH",
      tn: `SocialRUSH ${reference || "order"}`,
    });
    return `upi://pay?${params.toString()}`;
  }, [payeeName, reference, snapshot, upiConfigured, upiId]);

  useEffect(() => {
    if (!active) return;

    let scheduled = false;
    const schedulePrepare = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        prepareTemporaryCheckout(upiConfigured);
      });
    };

    prepareTemporaryCheckout(upiConfigured);
    const observer = new MutationObserver(schedulePrepare);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = checkoutButton(target);
      if (!control) return;
      if (control instanceof HTMLButtonElement && control.disabled) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const current = readOrderSnapshot();
      if (!upiConfigured) {
        const message = [
          "Hi SocialRUSH 👋",
          "I want to place an order.",
          "",
          `Platform: ${current.platform}`,
          `Service: ${current.service}`,
          `Quantity: ${current.quantity}`,
          `Link: ${current.link}`,
          `Total: ${current.totalLabel}`,
          "",
          "Please share the payment details to complete my order.",
        ].join("\n");
        window.location.assign(`${whatsappBase()}?text=${encodeURIComponent(message)}`);
        return;
      }

      setSnapshot(current);
      setReference(createOrderReference(current));
      setUtr("");
      setCopied(false);
      setModalOpen(true);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick, true);
    };
  }, [active, upiConfigured]);

  if (!active) return null;

  return (
    <>
      <div className="border-b border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center text-xs font-semibold leading-5 text-emerald-100 sm:px-6 sm:text-sm">
        {upiConfigured
          ? "Temporary UPI mode: pay the exact amount through your UPI app, then submit the UTR / transaction ID for verification."
          : "Temporary payment mode: after reviewing your order, you’ll continue on WhatsApp to receive payment details and confirm the order."}
      </div>

      {modalOpen && snapshot ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-orange-400/20 bg-[#0f131a] p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Secure temporary payment</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Pay {snapshot.totalLabel} via UPI</h2>
                <p className="mt-1 text-sm text-zinc-400">Order Ref: {reference}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300"
              >
                Close
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">UPI ID</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold text-white">{upiId}</code>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(upiId);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1800);
                  }}
                  className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-3 text-sm text-zinc-400">Exact payable amount: <strong className="text-white">{snapshot.totalLabel}</strong></p>
            </div>

            {upiHref ? (
              <a
                href={upiHref}
                className="mt-4 block w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 text-center text-base font-bold text-black"
              >
                Open UPI App & Pay {snapshot.totalLabel}
              </a>
            ) : null}

            <div className="mt-5 rounded-2xl border border-white/10 p-4">
              <label className="block text-sm font-semibold text-white" htmlFor="temporary-upi-utr">
                After payment, enter UTR / Transaction ID
              </label>
              <input
                id="temporary-upi-utr"
                value={utr}
                onChange={(event) => setUtr(event.target.value.replace(/\s+/g, "").slice(0, 40))}
                placeholder="Example: 425612345678"
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white outline-none focus:border-orange-400"
              />
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Payment is not treated as confirmed until the transaction is verified. Do not rely on screenshots alone.
              </p>
            </div>

            <button
              type="button"
              disabled={utr.trim().length < 6}
              onClick={() => {
                window.location.assign(buildVerificationWhatsapp(snapshot, reference, utr.trim()));
              }}
              className="mt-4 w-full rounded-2xl bg-emerald-500 px-5 py-4 text-base font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit Payment for Verification
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
              Full automatic payment confirmation and order creation will be enabled only after an approved payment gateway provides server-side verification/webhooks.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
