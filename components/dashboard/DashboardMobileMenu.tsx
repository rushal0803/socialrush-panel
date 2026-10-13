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
                <div className="min-w-0 max-w-[calc(100%-3.5rem)]"><Logo light /></div>
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

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 pl-4 pr-[calc(1rem+env(safe-area-inset-right))] pb-4">
                <p className="mb-4 text-xs leading-5 text-slate-400">Your orders, funds and campaign workspace.</p>
                <NavLinks mobile onNavigate={() => setIsOpen(false)} />
                <div className="mt-3"><AndroidAppDownload /></div>
              </div>

              {/* Keep important money/help actions visible even when the workspace list is long. */}
              <div role="group" aria-label="Quick dashboard actions" className="shrink-0 border-t border-white/10 bg-[#0B0B0F] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pr-[calc(1rem+env(safe-area-inset-right))]">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/dashboard/wallet#add-funds"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex min-h-12 min-w-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F00] px-2 py-3 text-sm font-bold text-[#17100b] shadow-lg shadow-orange-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                  >
                    Add Funds
                  </Link>
                  <Link
                    href="/dashboard/support"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex min-h-12 min-w-0 items-center justify-center rounded-xl border border-white/20 bg-white/[.06] px-2 py-3 text-sm font-bold text-white transition-colors hover:border-orange-300/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                  >
                    Get Support
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[.03] px-3 text-sm font-semibold text-[#D1D5DB] transition-colors hover:border-orange-400/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                >
                  Log out
                </button>
              </div>
        </div>
      </MobileMenuLayer>
    </div>
  );
}
