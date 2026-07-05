"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { NavLinks } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/client";
import { Menu, X } from "lucide-react";
import MobileMenuLayer from "@/components/navigation/MobileMenuLayer";
import Logo from "@/components/Logo";

export default function DashboardMobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

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
        aria-label="Toggle dashboard navigation"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((open) => !open);
        }}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-400/30 bg-orange-500/10 text-orange-200 shadow-[0_10px_24px_rgba(0,0,0,.3)] transition hover:-translate-y-0.5 hover:bg-orange-500/20"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <MobileMenuLayer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        topClassName="top-20"
        showCloseButton={false}
      >
        <div className="mx-auto w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-orange-400/30 bg-[#0B0B0F]/98 p-3.5 shadow-[0_24px_60px_-24px_rgba(255,122,0,.5)] sm:rounded-[1.75rem] sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <Logo light />
                <div>
                  <p className="text-right text-[10px] font-black uppercase tracking-[0.16em] text-orange-400">Dashboard</p>
                  <p className="mt-1 text-right text-xs font-bold text-[#D1D5DB]">Quick navigation</p>
                </div>
              </div>

              <NavLinks mobile onNavigate={() => setIsOpen(false)} />

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                <Link
                  href="/dashboard/new-order"
                  onClick={() => setIsOpen(false)}
                  className="col-span-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F00] px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20"
                >
                  Start Order
                </Link>
                <Link
                  href="/dashboard/account"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-500/10 px-3 py-2.5 text-sm font-bold text-orange-100"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-bold text-[#D1D5DB] transition hover:border-orange-400/30 hover:text-white"
                >
                  Log out
                </button>
              </div>
        </div>
      </MobileMenuLayer>
    </div>
  );
}
