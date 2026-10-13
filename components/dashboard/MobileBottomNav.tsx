"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, ReceiptText, WalletCards, UserRound } from "lucide-react";
import { isDashboardNavItemActive } from "@/lib/dashboard/navigation";

const links = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/dashboard/new-order", label: "New Order", Icon: PlusCircle },
  { href: "/dashboard/orders", label: "Orders", Icon: ReceiptText },
  { href: "/dashboard/wallet", label: "Wallet", Icon: WalletCards },
  { href: "/dashboard/account", label: "Account", Icon: UserRound },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[65] border-t border-white/[.12] bg-[#0b0e14]/95 px-1.5 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-12px_30px_-24px_rgba(0,0,0,.95)] backdrop-blur lg:hidden" aria-label="Primary dashboard navigation">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {links.map(({ href, label, Icon }) => {
          const active = isDashboardNavItemActive(pathname, href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={`flex min-h-[3.5rem] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-semibold leading-tight transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300 ${active ? "bg-orange-400/[.14] text-orange-200" : "text-[#aab2c1] hover:bg-white/[.06] hover:text-white"}`}
            >
              <Icon className="h-[1.2rem] w-[1.2rem] shrink-0" aria-hidden="true" />
              <span className="max-w-full whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
