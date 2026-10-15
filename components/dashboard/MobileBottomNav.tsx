"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, PlusCircle, ReceiptText, WalletCards, UserRound } from "lucide-react";
import { isDashboardLinkActive } from "@/lib/dashboard/navigation";

const links = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/dashboard/new-order", label: "New Order", Icon: PlusCircle },
  { href: "/dashboard/orders", label: "Orders", Icon: ReceiptText },
  { href: "/dashboard/wallet", label: "Wallet", Icon: WalletCards },
  { href: "/dashboard/account", label: "Account", Icon: UserRound },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  // Payment and verification are focused flows: don't cover their primary CTA.
  if (pathname.startsWith("/dashboard/direct-upi") || pathname.startsWith("/dashboard/order-summary")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[65] border-t border-white/[.12] bg-[#0c0e14]/95 px-1.5 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-15px_35px_-24px_rgba(0,0,0,.95)] backdrop-blur-md lg:hidden"
      aria-label="Primary dashboard navigation"
      data-dashboard-bottom-nav
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-0.5">
        {links.map(({ href, label, Icon }) => {
          const active = isDashboardLinkActive(pathname, href, query);
          const order = href === "/dashboard/new-order";
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-semibold leading-tight transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300 ${active
                ? "bg-orange-400/[.13] text-orange-200"
                : order ? "text-orange-300 hover:bg-orange-400/[.08]" : "text-slate-400 hover:bg-white/[.06] hover:text-white"}`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
