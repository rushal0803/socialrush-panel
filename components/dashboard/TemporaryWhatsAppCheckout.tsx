"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const DEFAULT_WHATSAPP_URL = "https://wa.me/918860330771";
const ACTIVE_ROUTES = new Set(["/dashboard/new-order", "/dashboard/order-summary"]);

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

function findOrderTotal(root: ParentNode) {
  const nodes = Array.from(root.querySelectorAll("span, p, dt, div"));
  const label = nodes.find((node) => /^order total$/i.test((node.textContent || "").trim()));
  const text = label?.parentElement?.textContent || "";
  const match = text.match(/(?:₹\s*|INR\s*)[\d,]+(?:\.\d{1,2})?/i);
  return match?.[0]?.replace(/\s+/g, " ").trim() || "";
}

function checkoutButton(element: Element) {
  const control = element.closest("button, a");
  if (!control) return null;
  const text = (control.textContent || "").replace(/\s+/g, " ").trim();
  const matches =
    /^place order$/i.test(text) ||
    /^place order securely$/i.test(text) ||
    /^pay .+ and place order$/i.test(text) ||
    /^pay .+ & place order$/i.test(text) ||
    /^continue to payment$/i.test(text);
  return matches ? control : null;
}

function buildWhatsAppHref() {
  const root = document.querySelector("main") || document.body;
  const params = new URLSearchParams(window.location.search);

  const serviceCode = params.get("service") || "";
  const rawPlatform = params.get("platform") || serviceCode.split("-")[0] || "";
  const quantity =
    params.get("quantity") ||
    root.querySelector<HTMLInputElement>('input[inputmode="numeric"]')?.value?.trim() ||
    "";
  const link =
    params.get("link") ||
    findInputValue(root, /public link|campaign link|username/i) ||
    "";
  const total = findOrderTotal(root);

  const platform = rawPlatform ? platformLabel(rawPlatform) : "Not specified";
  const service = serviceCode ? titleCaseService(serviceCode) : "Not specified";

  const message = [
    "Hi SocialRUSH 👋",
    "I want to place an order.",
    "",
    `Platform: ${platform}`,
    `Service: ${service}`,
    `Quantity: ${quantity || "Not specified"}`,
    `Link: ${link || "Not specified"}`,
    `Total: ${total || "Please confirm"}`,
    "",
    "Please share the payment details to complete my order.",
  ].join("\n");

  const configured = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
  const base = configured && /^https:\/\/wa\.me\/\d+/i.test(configured)
    ? configured.split("?")[0]
    : DEFAULT_WHATSAPP_URL;

  return `${base}?text=${encodeURIComponent(message)}`;
}

export default function TemporaryWhatsAppCheckout() {
  const pathname = usePathname();
  const active = ACTIVE_ROUTES.has(pathname);

  useEffect(() => {
    if (!active) return;

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
    return () => document.removeEventListener("click", onClick, true);
  }, [active]);

  if (!active) return null;

  return (
    <div className="border-b border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center text-xs font-semibold leading-5 text-emerald-100 sm:px-6 sm:text-sm">
      Temporary payment mode: after reviewing your order, you’ll continue on WhatsApp to receive payment details and confirm the order. No online payment will be taken on this page.
    </div>
  );
}
