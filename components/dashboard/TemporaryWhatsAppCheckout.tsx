"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const DEFAULT_WHATSAPP_URL = "https://wa.me/918860330771";
const ACTIVE_ROUTES = new Set(["/dashboard/new-order", "/dashboard/order-summary"]);
const WHATSAPP_BUTTON_LABEL = "Place Order on WhatsApp";
const ORDER_REFERENCE_STORAGE_KEY = "socialrush-whatsapp-order-reference";
const CASHFREE_ERROR_PATTERNS = [
  /unable to initialize secure payment/i,
  /preparing secure payment/i,
  /preparing secure checkout/i,
];

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
  return match?.[0]?.replace(/\s+/g, " ").trim() || "";
}

function checkoutButton(element: Element) {
  const control = element.closest<HTMLElement>("button, a");
  if (!control) return null;
  if (control.dataset.whatsappCheckout === "true") return control;

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

function generateOrderReference() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const timePart = Date.now().toString(36).slice(-5).toUpperCase();
  let randomPart = Math.random().toString(36).slice(2, 5).toUpperCase();

  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    randomPart = values[0].toString(36).slice(-3).toUpperCase().padStart(3, "0");
  }

  return `SR-${date}-${timePart}${randomPart}`;
}

function getOrderReference(signature: string) {
  try {
    const existingRaw = window.sessionStorage.getItem(ORDER_REFERENCE_STORAGE_KEY);
    if (existingRaw) {
      const existing = JSON.parse(existingRaw) as { signature?: string; reference?: string };
      if (existing.signature === signature && existing.reference) return existing.reference;
    }

    const reference = generateOrderReference();
    window.sessionStorage.setItem(
      ORDER_REFERENCE_STORAGE_KEY,
      JSON.stringify({ signature, reference }),
    );
    return reference;
  } catch {
    return generateOrderReference();
  }
}

function buildWhatsAppHref() {
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
  const total = findOrderTotal(root);
  const summaryService = findSummaryValue(root, /^service$/i);

  const platform = rawPlatform ? platformLabel(rawPlatform) : "Not specified";
  const service = serviceCode ? titleCaseService(serviceCode) : summaryService || "Not specified";
  const signature = [platform, service, quantity, link, total].join("|");
  const orderReference = getOrderReference(signature);

  const message = [
    "Hi SocialRUSH 👋",
    "I want to place an order.",
    "",
    `Order Request: ${orderReference}`,
    `Platform: ${platform}`,
    `Service: ${service}`,
    `Quantity: ${quantity || "Not specified"}`,
    `Link: ${link || "Not specified"}`,
    `Total: ${total || "Please confirm"}`,
    "",
    "Payment options: UPI QR / PhonePe Payment Link / Bank Transfer",
    "Please send me the available payment option for this order request.",
    "After payment, I will share the UTR / transaction ID for verification.",
  ].join("\n");

  const configured = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
  const base = configured && /^https:\/\/wa\.me\/\d+/i.test(configured)
    ? configured.split("?")[0]
    : DEFAULT_WHATSAPP_URL;

  return `${base}?text=${encodeURIComponent(message)}`;
}

function prepareTemporaryCheckout() {
  const controls = Array.from(document.querySelectorAll<HTMLElement>("button, a"));
  for (const control of controls) {
    const match = checkoutButton(control);
    if (!match) continue;

    if (match.dataset.whatsappCheckout !== "true") {
      match.dataset.whatsappCheckout = "true";
    }
    if (match.getAttribute("aria-label") !== WHATSAPP_BUTTON_LABEL) {
      match.setAttribute("aria-label", WHATSAPP_BUTTON_LABEL);
    }
    if (
      !(match instanceof HTMLButtonElement && match.disabled) &&
      (match.textContent || "").replace(/\s+/g, " ").trim() !== WHATSAPP_BUTTON_LABEL
    ) {
      match.textContent = WHATSAPP_BUTTON_LABEL;
    }
  }

  const possibleErrors = Array.from(document.querySelectorAll<HTMLElement>("p, div"));
  for (const element of possibleErrors) {
    const text = (element.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length > 180) continue;
    if (!CASHFREE_ERROR_PATTERNS.some((pattern) => pattern.test(text))) continue;
    if (element.dataset.temporaryWhatsappHidden !== "true") {
      element.style.display = "none";
      element.dataset.temporaryWhatsappHidden = "true";
    }
  }
}

export default function TemporaryWhatsAppCheckout() {
  const pathname = usePathname();
  const active = ACTIVE_ROUTES.has(pathname);

  useEffect(() => {
    if (!active) return;

    let scheduled = false;
    const schedulePrepare = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        prepareTemporaryCheckout();
      });
    };

    prepareTemporaryCheckout();
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
      window.location.assign(buildWhatsAppHref());
    };

    document.addEventListener("click", onClick, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick, true);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="border-b border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center text-xs font-semibold leading-5 text-emerald-100 sm:px-6 sm:text-sm">
      Temporary payment mode: after reviewing your order, you’ll continue on WhatsApp to receive payment details and confirm the order. No online payment will be taken on this page.
    </div>
  );
}
