"use client";

import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

const whatsappUrl = "https://wa.me/918860330771";

export default function FloatingWhatsAppButton() {
  const pathname = usePathname();
  const hasInlineOrderHelp = pathname === "/dashboard/order-summary";
  const isCheckoutRoute =
    pathname.includes("order-summary") ||
    pathname.includes("/checkout") ||
    pathname === "/dashboard/new-order";
  const isWalletRoute =
    pathname === "/dashboard/wallet" ||
    pathname === "/dashboard/add-funds";

  if (hasInlineOrderHelp || isWalletRoute) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open SocialRUSH WhatsApp support"
      className={`fixed z-[68] inline-flex items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white shadow-[0_16px_38px_-12px_rgba(34,197,94,.65)] transition hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-xl ${
        isCheckoutRoute
          ? "bottom-24 right-3 h-11 w-11 p-0 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:min-h-12 sm:gap-2 sm:px-4 sm:py-3"
          : "bottom-5 right-3 h-11 w-11 p-0 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:min-h-12 sm:gap-2 sm:px-4 sm:py-3"
      }`}
    >
      <FaWhatsapp className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">
        Need Help?
      </span>
    </a>
  );
}
