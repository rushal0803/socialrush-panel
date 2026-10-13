"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { NavLinks } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/client";
import { Menu, X } from "lucide-react";
import MobileMenuLayer from "@/components/navigation/MobileMenuLayer";
import Logo from "@/components/Logo";
import AndroidAppDownload from "@/components/pwa/AndroidAppDownload";

export default function DashboardMobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setIsOpen(false);
    await createClient().auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        ref={triggerRef}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((open) => !open);
        }}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-orange-400/30 bg-orange-500/10 text-orange-200 shadow-[0_10px_24px_rgba(0,0,0,.3)] transition hover:-translate-y-0.5 hover:bg-orange-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <MobileMenuLayer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        variant="drawer"
        showCloseButton={false}
        initialFocusRef={closeRef}
        returnFocusRef={triggerRef}
      >
        <div className="flex min-h-0 flex-1 flex-col">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0B0B0F] pb-3 pl-4 pr-[calc(1rem+env(safe-area-inset-right))] pt-[calc(0.75rem+env(safe-area-inset-top))]">
                <div className="min-w-0 max-w-[calc(100%-3.5rem)]">
                  <Logo light />
                  <p className="mt-1 truncate text-[10px] font-semibold tracking-[.13em] text-[#aab2c1]">CUSTOMER WORKSPACE</p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-11 min-h-11 w-11 min-w-11 shrink-0 items-center justify-center rounded-xl border-2 border-orange-400/70 bg-[#151821] text-white shadow-[0_12px_28px_-16px_rgba(255,122,0,.85)] transition hover:bg-orange-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                >
                  <X size={25} strokeWidth={2.75} aria-hidden="true" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 pl-4 pr-[calc(1rem+env(safe-area-inset-right))] pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300">Your tools</p>
              <NavLinks mobile onNavigate={() => setIsOpen(false)} />
              <div className="mt-5"><AndroidAppDownload /></div>
                            </div>
              <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-white/10 bg-[#101219] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
                <Link href="/dashboard/wallet" onClick={() => setIsOpen(false)} className="flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ffb000] px-3 text-xs font-extrabold text-[#17100b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300">Add Funds</Link>
                <Link href="/dashboard/support" onClick={() => setIsOpen(false)} className="flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/[.05] px-3 text-xs font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300">Get Support</Link>
                <button type="button" onClick={handleLogout} className="col-span-2 min-h-11 rounded-xl text-xs font-semibold text-[#b9c1ce] transition-colors hover:bg-white/[.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300">Log out</button>
              </div>
        </div>
      </MobileMenuLayer>
    </div>
  );
}
