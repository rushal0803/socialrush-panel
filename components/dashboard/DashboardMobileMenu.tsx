"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { NavLinks } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Menu, ReceiptText, WalletCards, X } from "lucide-react";
import MobileMenuLayer from "@/components/navigation/MobileMenuLayer";
import Logo from "@/components/Logo";
import AndroidAppDownload from "@/components/pwa/AndroidAppDownload";

export default function DashboardMobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  async function handleLogout() {
    setIsOpen(false);
    setSigningOut(true);
    try {
      await createClient().auth.signOut();
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        ref={triggerRef}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        aria-controls="socialrush-mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-orange-400/30 bg-orange-500/10 text-orange-100 transition-colors hover:bg-orange-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <MobileMenuLayer
        open={isOpen}
        onClose={closeMenu}
        variant="drawer"
        showCloseButton={false}
        initialFocusRef={closeRef}
        returnFocusRef={triggerRef}
      >
        <div id="socialrush-mobile-navigation" className="flex min-h-0 flex-1 flex-col bg-[#0b0d12] text-white">
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0b0d12] pb-3 pl-5 pr-[calc(1rem+env(safe-area-inset-right))] pt-[calc(.75rem+env(safe-area-inset-top))]">
            <div className="min-w-0">
              <Logo light />
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.13em] text-slate-400">Customer workspace</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-orange-400/50 bg-[#151821] text-white transition-colors hover:bg-orange-400/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
            >
              <X size={24} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5">
            <div className="rounded-2xl border border-orange-400/20 bg-gradient-to-br from-[#23180f] via-[#17151a] to-[#11141a] p-4 shadow-[0_16px_28px_-22px_rgba(0,0,0,.85)]">
              <p className="text-[10px] font-bold uppercase tracking-[.17em] text-orange-300">Quick actions</p>
              <Link href="/dashboard/new-order" onClick={closeMenu} className="mt-3 flex min-h-12 items-center justify-between rounded-xl bg-gradient-to-r from-[#ff7900] to-[#ffae22] px-4 text-sm font-bold text-[#211006] transition hover:brightness-110">
                Create new order <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/dashboard/wallet" onClick={closeMenu} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[.045] px-2 text-xs font-semibold text-white transition hover:bg-white/10"><WalletCards size={16} aria-hidden="true" /> Add Funds</Link>
                <Link href="/dashboard/orders" onClick={closeMenu} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[.045] px-2 text-xs font-semibold text-white transition hover:bg-white/10"><ReceiptText size={16} aria-hidden="true" /> Orders</Link>
              </div>
            </div>

            <NavLinks mobile onNavigate={closeMenu} />
            <div className="border-t border-white/10 pt-4"><AndroidAppDownload /></div>
            <button type="button" disabled={signingOut} onClick={handleLogout} className="flex min-h-11 w-full items-center justify-center rounded-xl border border-white/15 bg-white/[.035] text-sm font-semibold text-slate-200 transition hover:bg-white/[.08] disabled:opacity-50">
              {signingOut ? "Signing out..." : "Log out"}
            </button>
          </div>
        </div>
      </MobileMenuLayer>
    </div>
  );
}
