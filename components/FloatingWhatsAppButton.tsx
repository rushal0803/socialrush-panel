"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const whatsappUrl = "https://wa.me/918860330771";

export default function FloatingWhatsAppButton() {
  const pathname = usePathname();
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    if (pathname !== "/" && pathname !== "/faq") return;
    const targets = pathname === "/faq"
      ? Array.from(document.querySelectorAll<HTMLElement>("[data-faq-accordion]"))
      : ["order-builder", "final-cta"].map((id) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
    if (!targets.length) return;
    const observer = new IntersectionObserver((entries) => setCovered(entries.some((entry) => entry.isIntersecting)), { threshold: 0.22 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);
  const hasInlineOrderHelp = pathname === "/dashboard/order-summary";
  const isPackagesRoute = pathname === "/packages";
  const isServicesRoute = pathname === "/services";
  const isCheckoutRoute =
    pathname.includes("order-summary") ||
    pathname.includes("/checkout") ||
    pathname === "/dashboard/new-order";
  const isWalletRoute =
    pathname === "/dashboard/wallet" ||
    pathname === "/dashboard/add-funds";
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isDashboardActionRoute =
    pathname === "/dashboard/account" ||
    pathname === "/dashboard/support" ||
    pathname === "/dashboard/billing" ||
    pathname === "/dashboard/orders" ||
    pathname === "/dashboard/order-history";

  if (hasInlineOrderHelp || isPackagesRoute || isServicesRoute || isWalletRoute || isCheckoutRoute || isAdminRoute || isDashboardActionRoute || covered) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open SocialRUSH WhatsApp support"
      className="fixed bottom-[calc(.75rem+env(safe-area-inset-bottom))] right-[calc(.75rem+env(safe-area-inset-right))] z-[68] inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-500 p-0 text-xs font-bold text-white shadow-[0_16px_38px_-12px_rgba(34,197,94,.65)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-xl active:scale-[.98] sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:min-h-12 sm:gap-2 sm:px-4 sm:py-3"
    >
      <FaWhatsapp className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">
        Need Help?
      </span>
    </a>
  );
}
