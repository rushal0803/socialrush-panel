"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/events";

const ACTIVE_ROUTES = new Set(["/dashboard/new-order", "/dashboard/order-summary"]);

function currentOrderContext() {
  const params = new URLSearchParams(window.location.search);
  const serviceCode = params.get("service") || "";
  const platform = params.get("platform") || serviceCode.split("-")[0] || "";
  const quantityRaw = params.get("quantity") || document.querySelector<HTMLInputElement>('input[inputmode="numeric"]')?.value || "";
  const quantity = Number(String(quantityRaw).replace(/,/g, ""));
  const link = params.get("link") || Array.from(document.querySelectorAll<HTMLInputElement>("input, textarea")).find((input) => /instagram|youtube|facebook|linkedin|twitter|tiktok|telegram|https?:\/\//i.test(input.value))?.value?.trim() || "";
  return { serviceCode, platform, quantity, hasLink: Boolean(link) };
}

function isCheckoutControl(element: Element) {
  const control = element.closest<HTMLElement>("button, a");
  if (!control) return null;
  const text = (control.textContent || "").replace(/\s+/g, " ").trim();
  return /^(place order|place order securely|continue to payment|pay securely with upi|pay via upi|place order on whatsapp)/i.test(text) ? control : null;
}

export default function CheckoutFunnelTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!ACTIVE_ROUTES.has(pathname)) return;

    const initial = currentOrderContext();
    if (initial.serviceCode) {
      track("service_viewed", { service_code: initial.serviceCode, platform: initial.platform, surface: "dashboard_order" });
      track("order_started", { service_code: initial.serviceCode, platform: initial.platform, surface: "dashboard_order" });
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const checkout = isCheckoutControl(target);
      if (!checkout) return;

      const current = currentOrderContext();
      const valid = Boolean(current.serviceCode && Number.isInteger(current.quantity) && current.quantity > 0 && current.hasLink);
      track("order_details_completed", {
        service_code: current.serviceCode,
        platform: current.platform,
        validation_passed: valid,
        surface: "dashboard_order",
      });
      if (!valid) {
        track("checkout_error", {
          service_code: current.serviceCode,
          platform: current.platform,
          error_category: "incomplete_order_details",
          surface: "dashboard_order",
        });
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return null;
}
